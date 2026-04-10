/**
 * Utility for translation using Langbly API (Google Translate v2 drop-in replacement)
 */

export interface TranslateOptions {
  from?: string;
  to?: string;
  isHtml?: boolean;
}

interface PreservedBlock {
  token: string;
  html: string;
}

const MEDIA_TAG_REGEX = /<(img|video|source|iframe|picture|svg|canvas)\b[^>]*>(?:[\s\S]*?<\/\1>)?|<(img|source)\b[^>]*\/?\s*>/gi;

/**
 * Translates text using Langbly API
 * @param text The text to translate
 * @param options Translation options
 * @returns Translated text
 */
export async function translateText(
  text: string,
  options: TranslateOptions = {}
): Promise<string> {
  const { from = "vi", to = "en", isHtml = false } = options;

  // Using the provided Langbly API key
  const apiKey = process.env.NEXT_PUBLIC_LANGBLY_API_KEY;

  if (!text || text.trim() === "") return "";
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_LANGBLY_API_KEY");
  }

  try {
    const response = await fetch(
      `https://api.langbly.com/language/translate/v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          q: text,
          target: to,
          source: from,
          format: isHtml ? "html" : "text",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Langbly API Error:", errorData);
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.data?.translations?.[0]?.translatedText;

    if (!translatedText) {
      throw new Error("No translation returned from Langbly");
    }

    return translatedText;

  } catch (error) {
    console.error("Error in translateText:", error);
    throw error;
  }
}

function preserveMediaBlocks(html: string): { safeHtml: string; blocks: PreservedBlock[] } {
  const blocks: PreservedBlock[] = [];
  const safeHtml = html.replace(MEDIA_TAG_REGEX, (match) => {
    const token = `__MEDIA_BLOCK_${blocks.length}__`;
    blocks.push({ token, html: match });
    return token;
  });

  return { safeHtml, blocks };
}

function restoreMediaBlocks(html: string, blocks: PreservedBlock[]): string {
  return blocks.reduce((result, block) => {
    return result.split(block.token).join(block.html);
  }, html);
}

/**
 * Translate HTML content while preserving media tags such as <img>, <video>, <iframe>.
 * This avoids sending media URLs/base64 payloads to translation API.
 */
export async function translateHtmlPreservingMedia(
  html: string,
  options: Omit<TranslateOptions, "isHtml"> = {}
): Promise<string> {
  if (!html || html.trim() === "") return "";

  const { safeHtml, blocks } = preserveMediaBlocks(html);
  const translated = await translateText(safeHtml, { ...options, isHtml: true });
  return restoreMediaBlocks(translated, blocks);
}
