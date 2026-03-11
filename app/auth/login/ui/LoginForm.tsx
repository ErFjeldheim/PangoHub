// app/auth/login/ui/LoginForm.tsx
"use client";

import { useActionState } from "react"; // ✅ from 'react'
import { useFormStatus } from "react-dom"; // ✅ still from 'react-dom'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { login } from "../actions"; // import the server action directly

const initialState = { error: null as string | null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

export function LoginForm() {
  // use the server action with useActionState
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="consultant@company.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      {state?.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {state.error}
        </div>
      )}

      <SubmitButton />

      <div className="text-center text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <div className="mt-2 text-center text-sm text-muted-foreground">
        Need access?{" "}
        <Link
          href="/auth/request-access"
          className="text-primary hover:underline"
        >
          Request an invitation
        </Link>
      </div>
    </form>
  );
}
