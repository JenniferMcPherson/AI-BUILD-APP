"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function RegisterForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite") ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start building software with plain English.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Ada Lovelace" required />
            {state?.errors?.name && (
              <p className="text-xs text-danger">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            {state?.errors?.email && (
              <p className="text-xs text-danger">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && (
              <div className="text-xs text-danger">
                <p>Password must:</p>
                <ul className="list-inside list-disc">
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="inviteCode">
              Invite code <span className="font-normal text-muted">(optional)</span>
            </Label>
            <Input
              id="inviteCode"
              name="inviteCode"
              defaultValue={inviteCode}
              placeholder="ABCD1234"
              className="uppercase"
            />
          </div>
          {state?.message && <p className="text-xs text-danger">{state.message}</p>}
          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
