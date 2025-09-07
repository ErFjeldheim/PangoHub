// app/auth/login/page.tsx  (SERVER COMPONENT — no "use client")
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./ui/LoginForm";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Pango Talent Hub
            </CardTitle>
            <CardDescription>
              Sign in to access the consultant management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
