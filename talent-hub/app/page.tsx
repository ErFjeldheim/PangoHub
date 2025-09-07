import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">Pango Talent Hub</h1>
          <p className="text-muted-foreground">Professional consultant management system for internal teams</p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/login">
            <Button size="lg" className="w-full">
              Sign In
            </Button>
          </Link>

          <Link href="/auth/request-access">
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              Request Access
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Access is by invitation only. Contact your administrator for access.
        </p>
      </div>
    </div>
  )
}
