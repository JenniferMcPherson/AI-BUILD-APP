"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { REPORT_REASONS } from "@/lib/creator";
import type { ReportState } from "@/app/actions/reports";

export function ReportDialog({
  label,
  action,
}: {
  label: string;
  action: (state: ReportState, formData: FormData) => Promise<ReportState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-3.5 w-3.5" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {label}</DialogTitle>
          <DialogDescription>Let us know what&apos;s wrong. We&apos;ll review it.</DialogDescription>
        </DialogHeader>
        {state?.success ? (
          <p className="text-sm text-success">Thanks — we&apos;ve recorded your report.</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Reason</Label>
              <select
                id="reason"
                name="reason"
                required
                defaultValue=""
                className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
              >
                <option value="" disabled>
                  Choose a reason
                </option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="details">Details (optional)</Label>
              <Textarea id="details" name="details" maxLength={1000} rows={3} />
            </div>
            {state?.error && <p className="text-xs text-danger">{state.error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
