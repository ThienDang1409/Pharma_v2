import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RelatedNodeView from './RelatedNodeView';

export const RelatedProducts = Node.create({
  name: 'relatedProducts',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      productIds: {
        default: [],
        parseHTML: element => {
          const ids = element.getAttribute('data-ids');
          return ids ? JSON.parse(ids) : [];
        },
        renderHTML: attributes => ({
          'data-ids': JSON.stringify(attributes.productIds),
        }),
      },
      displayLimit: {
        default: 8,
        parseHTML: element => parseInt(element.getAttribute('data-limit') || '8', 10),
        renderHTML: attributes => ({
          'data-limit': attributes.displayLimit,
        }),
      },
      style: {
        default: 'slide', // 'slide' | 'grid'
        parseHTML: element => element.getAttribute('data-style') || 'slide',
        renderHTML: attributes => ({
          'data-style': attributes.style,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="related-products"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'related-products' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RelatedNodeView);
  },
});
