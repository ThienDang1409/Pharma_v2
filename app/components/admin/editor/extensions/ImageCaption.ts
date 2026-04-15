import { mergeAttributes, Node } from "@tiptap/core";

const ImageCaption = Node.create({
  name: "imageCaption",

  group: "block",
  content: "inline*",
  draggable: false,
  selectable: false,

  parseHTML() {
    return [
      {
        tag: 'p[data-image-caption="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(HTMLAttributes, {
        "data-image-caption": "true",
        class: "image-caption-line",
      }),
      0,
    ];
  },
});

export default ImageCaption;
