import assert from "node:assert/strict"
import { afterEach, beforeEach, mock, test } from "node:test"
import { POST } from "@/app/api/builds/upload-sign/route"
import {
  BUILD_UPLOAD_FOLDER,
  BUILD_UPLOAD_FORMATS,
} from "@/features/builds/keys"

const originalUrl = process.env.UPLOAD_SIGN_URL
const originalSecret = process.env.WORKER_SHARED_SECRET
beforeEach(() => {
  process.env.UPLOAD_SIGN_URL = "https://sign.example.test/sign"
  process.env.WORKER_SHARED_SECRET = "test-only-secret"
})
afterEach(() => {
  mock.restoreAll()
  if (originalUrl === undefined) delete process.env.UPLOAD_SIGN_URL
  else process.env.UPLOAD_SIGN_URL = originalUrl
  if (originalSecret === undefined) delete process.env.WORKER_SHARED_SECRET
  else process.env.WORKER_SHARED_SECRET = originalSecret
})
const payload = {
  signature: "test-signature",
  timestamp: 123,
  cloudName: "test",
  apiKey: "test",
  params: {
    folder: BUILD_UPLOAD_FOLDER,
    allowed_formats: BUILD_UPLOAD_FORMATS,
  },
}

test("missing configuration does not contact the signing service", async () => {
  delete process.env.UPLOAD_SIGN_URL
  const fetch = mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected fetch")
  })
  assert.equal((await POST()).status, 503)
  assert.equal(fetch.mock.callCount(), 0)
})

test("network and timeout failures return a recoverable upload error", async () => {
  mock.method(globalThis, "fetch", async () => {
    throw new Error("offline")
  })
  const result = await POST()
  assert.equal(result.status, 502)
  assert.equal(typeof (await result.json()).error, "string")
})

test("upstream errors return 502", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () => new Response("Unavailable", { status: 503 }),
  )
  assert.equal((await POST()).status, 502)
})

for (const params of [
  {},
  { folder: BUILD_UPLOAD_FOLDER },
  { ...payload.params, folder: "board" },
  { ...payload.params, allowed_formats: "svg" },
]) {
  test(`refuses insufficient upload restrictions: ${JSON.stringify(params)}`, async () => {
    mock.method(globalThis, "fetch", async () =>
      Response.json({ ...payload, params }),
    )
    assert.equal((await POST()).status, 503)
  })
}

test("malformed upstream JSON is handled without throwing", async () => {
  mock.method(globalThis, "fetch", async () => new Response("not json"))
  assert.equal((await POST()).status, 503)
})

test("valid restricted signatures pass through unchanged and requests have a deadline", async () => {
  const fetch = mock.method(
    globalThis,
    "fetch",
    async (_url: unknown, options?: RequestInit) => {
      assert.ok(options?.signal instanceof AbortSignal)
      assert.deepEqual(JSON.parse(String(options.body)), payload.params)
      return Response.json(payload)
    },
  )
  const result = await POST()
  assert.equal(result.status, 200)
  assert.deepEqual(await result.json(), payload)
  assert.equal(fetch.mock.callCount(), 1)
})
