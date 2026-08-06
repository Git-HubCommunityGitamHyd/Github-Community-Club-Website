import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const { error } = searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gh-bg">
      <Card className="w-full max-w-sm border-gray-200 bg-white dark:border-gh-border dark:bg-gh-surface">
        <CardContent className="p-8">
          <h1 className="mb-6 text-center text-xl font-semibold">
            Admin login
          </h1>
          <form action="/api/admin/login" method="POST" className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gh-muted"
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
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gh-border dark:bg-gh-elevated dark:text-gh-text dark:focus:border-gh-accent dark:focus:ring-gh-accent"
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
