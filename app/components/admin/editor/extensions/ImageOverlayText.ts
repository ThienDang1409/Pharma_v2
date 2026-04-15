import { mergeAttributes, Node } from "@tiptap/core";

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
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as { position?: string };
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-image-overlay-text": "true",
        "data-position": normalizeOverlayPosition(attrs.position),
        class: "image-overlay-box",
      }),
      0,
    ];
  },
});

export default ImageOverlayText;
