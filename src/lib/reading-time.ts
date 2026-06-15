export function calculateReadTime(body: string | undefined, wordsPerMinute = 200): number {
  if (!body) return 1;

  const withoutFrontmatter = body.replace(/^---[\s\S]*?---/, "");
  const withoutCodeBlocks = withoutFrontmatter.replace(/```[\s\S]*?```/g, "");
  const wordCount = withoutCodeBlocks.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
