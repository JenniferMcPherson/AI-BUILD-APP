"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { slugify, withUniqueSuffix } from "@/lib/slug";
import { ArticleSchema, CitationSchema } from "@/lib/validations";
import { MAX_CITATIONS } from "@/lib/library";

export type CreateArticleState =
  | {
      errors?: { title?: string[]; excerpt?: string[]; content?: string[] };
      message?: string;
    }
  | undefined;

export async function createArticle(
  _state: CreateArticleState,
  formData: FormData
): Promise<CreateArticleState> {
  const { userId } = await verifySession();

  const validatedFields = ArticleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const citations: { text: string; url?: string }[] = [];
  for (let i = 0; i < MAX_CITATIONS; i++) {
    const text = formData.get(`citationText${i}`);
    const url = formData.get(`citationUrl${i}`);
    if (typeof text === "string" && text.trim()) {
      const parsed = CitationSchema.safeParse({ text, url: url || "" });
      if (parsed.success) {
        citations.push({ text: parsed.data.text, url: parsed.data.url || undefined });
      }
    }
  }

  const { title, excerpt, content } = validatedFields.data;
  const slug = withUniqueSuffix(slugify(title));

  const article = await db.article.create({
    data: { title, excerpt, content, citations, authorId: userId, slug },
    select: { slug: true },
  });

  redirect(`/library/${article.slug}`);
}

export async function deleteArticle(articleId: string) {
  const { userId } = await verifySession();
  await db.article.deleteMany({ where: { id: articleId, authorId: userId } });
  redirect("/library");
}
