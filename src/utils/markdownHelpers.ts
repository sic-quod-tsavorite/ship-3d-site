/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export const escapeHtml = (text: string): string => {
  const htmlMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlMap[char] || char);
};

/**
 * Validates a URL to prevent javascript: and data: protocol attacks
 */
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, "http://example.com");
    const protocol = urlObj.protocol.toLowerCase();
    // Only allow http, https, and relative URLs
    return protocol === "http:" || protocol === "https:" || !url.includes(":");
  } catch {
    // If URL parsing fails, treat relative URLs as valid
    return (
      !url.toLowerCase().startsWith("javascript:") &&
      !url.toLowerCase().startsWith("data:")
    );
  }
};

/**
 * Converts basic markdown to sanitized HTML
 * Supports: bold, italic, links, and line breaks
 */
export const parseMarkdown = (text: string): string => {
  // Escape HTML to prevent XSS
  let html = escapeHtml(text);

  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, "<br>");

  // Convert bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Convert italic (*text* or _text_)
  // Use negative lookbehind to avoid matching ** or __
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");

  // Convert links [text](url)
  // Use a more careful regex that stops at the last ) to handle URLs with parentheses
  html = html.replace(
    /\[([^\[\]]*)\]\(([^)]+)\)/g,
    (_match: string, text: string, url: string): string => {
      if (isValidUrl(url)) {
        return `<a href="${escapeHtml(url)}" rel="noopener noreferrer">${text}</a>`;
      }
      // If URL is invalid, return the text without link
      return text;
    }
  );

  return html;
};
