/**
 * Injects a <base> tag so relative asset links (styles.css, app.js) resolve
 * correctly no matter what exact URL the document was requested at — with or
 * without a trailing slash, with or without an explicit /index.html suffix.
 */
export function withBaseHref(html: string, baseHref: string): string {
  const headMatch = html.match(/<head[^>]*>/i);
  if (!headMatch) return html;
  const insertAt = headMatch.index! + headMatch[0].length;
  return `${html.slice(0, insertAt)}<base href="${baseHref}">${html.slice(insertAt)}`;
}
