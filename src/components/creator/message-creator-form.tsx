"use client";

import { useActionState, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { sendCreatorMessage } from "@/app/actions/creator-messages";

export function MessageCreatorForm({
  projectSlug,
  creatorName,
}: {
  projectSlug: string;
  creatorName: string;
}) {
  const [open, setOpen] = useState(false);
  const action = sendCreatorMessage.bind(null, projectSlug);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <MessageCircle className="h-4 w-4" />
          Message creator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {creatorName}</DialogTitle>
          <DialogDescription>Ask a question about this listing.</DialogDescription>
        </DialogHeader>
        {state?.success ? (
          <p className="text-sm text-success">Sent — they&apos;ll see it in their inbox.</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <Textarea
              name="body"
              required
              maxLength={2000}
              rows={4}
              placeholder="Hi! I had a question about..."
            />
            {state?.error && <p className="text-xs text-danger">{state.error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
