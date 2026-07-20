"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
        {state?.errors?.currentPassword && (
          <p className="text-xs text-danger">{state.errors.currentPassword[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        {state?.errors?.newPassword && (
          <p className="text-xs text-danger">{state.errors.newPassword[0]}</p>
        )}
      </div>
      {state?.message && <p className="text-xs text-danger">{state.message}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Updating..." : "Update password"}
        </Button>
        {state?.success && <span className="text-xs text-success">Password updated</span>}
      </div>
    </form>
  );
}
