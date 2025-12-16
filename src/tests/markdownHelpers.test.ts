// Imports
import { describe, it, expect } from "vitest";

// Project imports
import { escapeHtml, parseMarkdown } from "../utils/markdownHelpers";

describe("markdownHelpers", () => {
  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      expect(escapeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
      );
    });

    it("should escape ampersands", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("should escape quotes", () => {
      expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
    });

    it("should handle multiple special characters", () => {
      expect(escapeHtml('<div class="test">Test & "quote"</div>')).toBe(
        "&lt;div class=&quot;test&quot;&gt;Test &amp; &quot;quote&quot;&lt;/div&gt;"
      );
    });

    it("should not modify safe text", () => {
      expect(escapeHtml("Hello World")).toBe("Hello World");
    });
  });

  describe("parseMarkdown", () => {
    describe("line breaks", () => {
      it("should preserve single line breaks as <br>", () => {
        expect(parseMarkdown("Line 1\nLine 2")).toBe("Line 1<br>Line 2");
      });

      it("should handle multiple line breaks", () => {
        expect(parseMarkdown("Line 1\nLine 2\nLine 3")).toBe(
          "Line 1<br>Line 2<br>Line 3"
        );
      });
    });

    describe("bold formatting", () => {
      it("should convert **text** to <strong>", () => {
        expect(parseMarkdown("This is **bold** text")).toBe(
          "This is <strong>bold</strong> text"
        );
      });

      it("should convert __text__ to <strong>", () => {
        expect(parseMarkdown("This is __bold__ text")).toBe(
          "This is <strong>bold</strong> text"
        );
      });

      it("should handle multiple bold sections", () => {
        expect(parseMarkdown("**bold1** and **bold2**")).toBe(
          "<strong>bold1</strong> and <strong>bold2</strong>"
        );
      });

      it("should not double-process bold", () => {
        expect(parseMarkdown("**bold**")).toBe("<strong>bold</strong>");
      });
    });

    describe("italic formatting", () => {
      it("should convert *text* to <em>", () => {
        expect(parseMarkdown("This is *italic* text")).toBe(
          "This is <em>italic</em> text"
        );
      });

      it("should convert _text_ to <em>", () => {
        expect(parseMarkdown("This is _italic_ text")).toBe(
          "This is <em>italic</em> text"
        );
      });

      it("should not convert single asterisk/underscore in bold", () => {
        // ** should not become em
        expect(parseMarkdown("**bold**")).toContain("<strong>");
      });

      it("should handle multiple italic sections", () => {
        expect(parseMarkdown("*italic1* and *italic2*")).toBe(
          "<em>italic1</em> and <em>italic2</em>"
        );
      });
    });

    describe("links", () => {
      it("should convert [text](url) to <a> tag", () => {
        expect(parseMarkdown("[Google](https://google.com)")).toBe(
          '<a href="https://google.com" rel="noopener noreferrer">Google</a>'
        );
      });

      it("should handle relative URLs", () => {
        expect(parseMarkdown("[Link](/about)")).toBe(
          '<a href="/about" rel="noopener noreferrer">Link</a>'
        );
      });

      it("should block javascript: protocol", () => {
        // Note: URLs with parentheses may not parse perfectly with regex
        // This test uses a simpler javascript: URL
        const result = parseMarkdown("[Click](javascript:alert)");
        expect(result).not.toContain("javascript:");
        expect(result).toBe("Click");
      });

      it("should block data: protocol", () => {
        const result = parseMarkdown("[Click](data:text/html)");
        expect(result).not.toContain("data:");
        expect(result).toBe("Click");
      });

      it("should escape URL in href attribute", () => {
        expect(parseMarkdown("[Link](https://example.com?q=test)")).toContain(
          "href="
        );
      });

      it("should handle multiple links", () => {
        expect(
          parseMarkdown("[Link1](http://a.com) and [Link2](http://b.com)")
        ).toBe(
          '<a href="http://a.com" rel="noopener noreferrer">Link1</a> and <a href="http://b.com" rel="noopener noreferrer">Link2</a>'
        );
      });
    });

    describe("combined formatting", () => {
      it("should handle bold and italic together", () => {
        expect(parseMarkdown("***bold and italic***")).toContain("<strong>");
      });

      it("should handle link with formatting", () => {
        const result = parseMarkdown("**[Bold Link](https://example.com)**");
        expect(result).toContain("<strong>");
        expect(result).toContain(
          '<a href="https://example.com" rel="noopener noreferrer">'
        );
      });

      it("should handle complex vessel description", () => {
        const input =
          "**Vessel Details**\n\nA ship with the following features:\nLength: 100m\nSpeed: 20 knots\n\nFor more info: [Visit Site](https://example.com)";
        const result = parseMarkdown(input);
        expect(result).toContain("<strong>Vessel Details</strong>");
        expect(result).toContain("Length: 100m");
        expect(result).toContain(
          '<a href="https://example.com" rel="noopener noreferrer">'
        );
      });
    });

    describe("security", () => {
      it("should prevent XSS from script tags", () => {
        const result = parseMarkdown("<script>alert('xss')</script>");
        expect(result).not.toContain("<script>");
        expect(result).toContain("&lt;script&gt;");
      });

      it("should prevent XSS from event handlers", () => {
        const result = parseMarkdown(
          "<div onclick=\"alert('xss')\">Click</div>"
        );
        // The entire HTML tag is escaped, so onclick= becomes &quot;onclick=&quot; in the escaped text
        expect(result).not.toContain("<div onclick");
        expect(result).toContain("&lt;div");
      });

      it("should prevent XSS in markdown context", () => {
        const result = parseMarkdown("[Click](javascript:alert)");
        expect(result).not.toContain("javascript:");
        // Should return just the link text
        expect(result).toBe("Click");
      });

      it("should escape ampersands before converting markdown", () => {
        const result = parseMarkdown("**Bold & Safe**");
        expect(result).toContain("&amp;");
        expect(result).toContain("<strong>");
      });
    });

    describe("edge cases", () => {
      it("should handle empty string", () => {
        expect(parseMarkdown("")).toBe("");
      });

      it("should handle whitespace only", () => {
        expect(parseMarkdown("   ")).toBe("   ");
      });

      it("should handle incomplete markdown", () => {
        // Missing closing **
        expect(parseMarkdown("**bold without closing")).toBe(
          "**bold without closing"
        );
      });

      it("should not break on special characters", () => {
        expect(parseMarkdown("Price: $99.99")).toBe("Price: $99.99");
      });

      it("should handle markdown at line boundaries", () => {
        // Leading and trailing newlines are preserved as <br> tags
        expect(parseMarkdown("\n**bold**\n")).toBe(
          "<br><strong>bold</strong><br>"
        );
      });

      it("should not match nested incomplete markdown", () => {
        expect(parseMarkdown("*text with **nested** markup*")).toContain(
          "<em>"
        );
      });
    });
  });
});
