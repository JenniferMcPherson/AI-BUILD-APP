import { parseContent, parseInline } from "@/lib/markdown";

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((segment, i) =>
        segment.bold ? <strong key={i}>{segment.text}</strong> : <span key={i}>{segment.text}</span>
      )}
    </>
  );
}

export function ArticleContent({ content }: { content: string }) {
  const blocks = parseContent(content);

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              <Inline text={block.text} />
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-inside list-disc space-y-1 text-foreground">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-foreground">
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
