import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageSliderNodeView from './ImageSliderNodeView';

export const ImageSlider = Node.create({
  name: 'imageSlider',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      images: {
        default: [], // Array of { id: string, url: string, caption: string }
        parseHTML: element => {
          const data = element.getAttribute('data-images');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: attributes => ({
          'data-images': JSON.stringify(attributes.images),
        }),
      },
      showPagination: {
        default: true,
        parseHTML: element => element.getAttribute('data-pagination') !== 'false',
        renderHTML: attributes => ({
          'data-pagination': attributes.showPagination.toString(),
        }),
      },
      autoplay: {
        default: false,
        parseHTML: element => element.getAttribute('data-autoplay') === 'true',
        renderHTML: attributes => ({
          'data-autoplay': attributes.autoplay.toString(),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-slider"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-slider' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageSliderNodeView);
  },
});
