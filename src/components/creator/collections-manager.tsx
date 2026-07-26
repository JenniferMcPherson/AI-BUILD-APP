"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { createCollection, updateCollection, deleteCollection } from "@/app/actions/collections";

export type CollectionItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  projectCount: number;
};

export function CollectionsManager({ collections }: { collections: CollectionItem[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createCollection, undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">Group your listings into themed collections.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New collection</DialogTitle>
              <DialogDescription>Give it a name shoppers will recognize.</DialogDescription>
            </DialogHeader>
            <form action={action} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required maxLength={80} placeholder="Starter kits" />
                {state?.errors?.title && <p className="text-xs text-danger">{state.errors.title[0]}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" name="description" maxLength={300} rows={3} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating..." : "Create collection"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
          No collections yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((collection) => (
            <CollectionRow key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionRow({ collection }: { collection: CollectionItem }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${collection.title}"? Projects in it won't be deleted.`)) return;
    startTransition(async () => {
      await deleteCollection(collection.id);
    });
  }

  async function handleUpdate(formData: FormData) {
    setError(null);
    const result = await updateCollection(collection.id, formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <form action={handleUpdate} className="flex flex-col gap-2 rounded-md border border-border p-4">
        <Input name="title" defaultValue={collection.title} required maxLength={80} />
        <Textarea name="description" defaultValue={collection.description ?? ""} maxLength={300} rows={2} />
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
      <div>
        <p className="font-medium">{collection.title}</p>
        {collection.description && <p className="text-sm text-muted">{collection.description}</p>}
        <p className="mt-1 text-xs text-muted">
          {collection.projectCount} project{collection.projectCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit collection">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={pending}
          aria-label="Delete collection"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
