// next.config.js loads *.md as raw text (turbopack rule), so an import of a
// Markdown file is its contents.
declare module "*.md" {
  const content: string
  export default content
}
