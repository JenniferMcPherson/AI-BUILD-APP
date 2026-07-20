"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createProject, type CreateProjectState } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const initialState: CreateProjectState = undefined;

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createProject, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new project</DialogTitle>
          <DialogDescription>
            Describe what you want to build. You can refine it with the AI builder afterwards.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" name="name" placeholder="My Habit Tracker" required autoFocus />
            {state?.errors?.name && <p className="text-xs text-danger">{state.errors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">What do you want to build?</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Build me an app that helps me track daily habits with streaks and reminders..."
              rows={4}
            />
            {state?.errors?.description && (
              <p className="text-xs text-danger">{state.errors.description[0]}</p>
            )}
          </div>
          {state?.message && <p className="text-xs text-danger">{state.message}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
