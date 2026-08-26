const { sanitizePlainText } = require("../utils/sanitize");

describe("sanitizePlainText", () => {
  test("strips script tags entirely", () => {
    const input = 'Great product<script>alert("hacked")</script>';
    const result = sanitizePlainText(input);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
  });

  test("strips all HTML tags, keeping the text content", () => {
    const input = "<b>Bold</b> and <i>italic</i> text";
    const result = sanitizePlainText(input);
    expect(result).toBe("Bold and italic text");
  });

  test("leaves normal plain text completely unchanged", () => {
    const input = "A perfectly normal product description with no HTML.";
    expect(sanitizePlainText(input)).toBe(input);
  });

  test("trims leading and trailing whitespace", () => {
    expect(sanitizePlainText("   padded text   ")).toBe("padded text");
  });

  test("removes an img tag with an onerror attribute (a common XSS vector)", () => {
    const input = '<img src=x onerror="steal_data()">Product name';
    const result = sanitizePlainText(input);
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("<img");
  });

  test("returns non-string input unchanged (defensive default)", () => {
    expect(sanitizePlainText(null)).toBeNull();
    expect(sanitizePlainText(undefined)).toBeUndefined();
  });

  test("handles an empty string without throwing", () => {
    expect(sanitizePlainText("")).toBe("");
  });
});
