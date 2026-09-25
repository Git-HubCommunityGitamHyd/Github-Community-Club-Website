// Run source tests with Node's test runner and the project's existing TypeScript.
// No application bundles, external services, or production data are involved.
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import path from "node:path"
import ts from "typescript"

const root = fileURLToPath(new URL("../", import.meta.url))
export function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return nextResolve("next/server.js", context)
  if (specifier.startsWith("@/") || specifier.startsWith(".")) {
    const base = specifier.startsWith("@/")
      ? path.join(root, specifier.slice(2))
      : fileURLToPath(new URL(specifier, context.parentURL))
    const file = [base, `${base}.ts`, `${base}.tsx`].find(
      (candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate),
    )
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}

export function load(url, context, nextLoad) {
  if (
    url.startsWith("file:") &&
    /\.tsx?$/.test(url) &&
    !url.includes("/node_modules/")
  ) {
    return {
      format: "module",
      source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
        },
        fileName: fileURLToPath(url),
      }).outputText,
      shortCircuit: true,
    }
  }
  return nextLoad(url, context)
}
