import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-gh-bg px-4">
      <Card className="w-full max-w-sm border-gh-border bg-gh-surface">
        <CardContent className="p-8">
          <h1 className="mb-6 text-center text-xl font-semibold">
            Admin login
          </h1>
          <form action="/api/admin/login" method="POST" className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gh-muted"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoFocus
                required
                className="w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-sm text-gh-text focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">Incorrect password</p>
            )}
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
