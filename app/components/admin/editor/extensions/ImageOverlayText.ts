import { mergeAttributes, Node } from "@tiptap/core";

const DEFAULT_OVERLAY_BACKGROUND = "rgba(15, 23, 42, 0.78)";
const DEFAULT_OVERLAY_TEXT = "#ffffff";

const normalizeOverlayPosition = (value?: string) => {
  switch (value) {
    case "top-left":
    case "top-right":
    case "bottom-left":
    case "bottom-right":
    case "center":
      return value;
    default:
      return "bottom-left";
  }
};

const normalizeOverlayColor = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : fallback;
};

const ImageOverlayText = Node.create({
  name: "imageOverlayText",

  group: "block",
  content: "inline*",
  draggable: false,
  selectable: false,

  addAttributes() {
    return {
      position: {
        default: "bottom-left",
      },
      backgroundColor: {
        default: DEFAULT_OVERLAY_BACKGROUND,
      },
      textColor: {
        default: DEFAULT_OVERLAY_TEXT,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-image-overlay-text="true"]',
        getAttrs: (element) => {
          const overlay = element as HTMLElement;
          return {
            position: normalizeOverlayPosition(overlay.getAttribute("data-position") || undefined),
            backgroundColor: normalizeOverlayColor(
              overlay.getAttribute("data-background-color") || overlay.style.backgroundColor,
              DEFAULT_OVERLAY_BACKGROUND
            ),
            textColor: normalizeOverlayColor(
              overlay.getAttribute("data-text-color") || overlay.style.color,
              DEFAULT_OVERLAY_TEXT
            ),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as {
      position?: string;
      backgroundColor?: string;
      textColor?: string;
      style?: string;
    };

    const backgroundColor = normalizeOverlayColor(attrs.backgroundColor, DEFAULT_OVERLAY_BACKGROUND);
    const textColor = normalizeOverlayColor(attrs.textColor, DEFAULT_OVERLAY_TEXT);

    const style = [
      attrs.style,
      `background-color: ${backgroundColor}`,
      `color: ${textColor}`,
    ]
      .filter(Boolean)
      .join("; ");

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-image-overlay-text": "true",
        "data-position": normalizeOverlayPosition(attrs.position),
        "data-background-color": backgroundColor,
        "data-text-color": textColor,
        style,
        class: "image-overlay-box",
      }),
      0,
    ];
  },
});

export default ImageOverlayText;
