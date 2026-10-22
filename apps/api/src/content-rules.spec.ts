import { containsProfanity, countWords, skillError } from "./content-rules";
import { containsContactLeak, extractContacts, maskContact } from "./marketplace-rules";

describe("skillError", () => {
  it.each(["00000111", "12345", "a", "???", "@@##", "fuck", "f u c k".replace(/ /g, ""), "Sh1t"])("rejects %s", (skill) => {
    expect(skillError(skill)).not.toBeNull();
  });

  it.each(["Mathematics", "C++", "C#", "Class 10 Maths", "A-Level Physics", "Python 3", "Hindi"])("accepts %s", (skill) => {
    expect(skillError(skill)).toBeNull();
  });
});

describe("countWords", () => {
  it("counts whitespace separated words", () => {
    expect(countWords("  need   a maths tutor ")).toBe(4);
    expect(countWords("")).toBe(0);
  });
});

describe("containsProfanity", () => {
  it("catches leetspeak and repeated letters but not clean text", () => {
    expect(containsProfanity("what the fuuuck")).toBe(true);
    expect(containsProfanity("Essex classics tutor")).toBe(false);
  });
});

describe("contact masking", () => {
  const text = "call 98765 43210 or mail me@example.com or rahul at gmail dot com or visit www.site.com";

  it("detects and masks every contact form", () => {
    expect(containsContactLeak(text)).toBe(true);
    expect(maskContact(text)).not.toMatch(/98765|example\.com|gmail|www\./);
  });

  it("extracts contacts for later reveal", () => {
    const found = extractContacts(text).join("|");
    expect(found).toContain("98765 43210");
    expect(found).toContain("me@example.com");
    expect(found).toContain("www.site.com");
  });

  it("leaves normal requirement text alone", () => {
    expect(containsContactLeak("Need class 10 maths tutor, 3 days a week, budget 500 per hour")).toBe(false);
  });
});
