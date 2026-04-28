import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RelatedNodeView from './RelatedNodeView';

export const RelatedArticles = Node.create({
  name: 'relatedArticles',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      articleIds: {
        default: [],
        parseHTML: element => {
          const ids = element.getAttribute('data-ids');
          return ids ? JSON.parse(ids) : [];
        },
        renderHTML: attributes => ({
          'data-ids': JSON.stringify(attributes.articleIds),
        }),
      },
      displayLimit: {
        default: 3,
        parseHTML: element => parseInt(element.getAttribute('data-limit') || '3', 10),
        renderHTML: attributes => ({
          'data-limit': attributes.displayLimit,
        }),
      },
      style: {
        default: 'list', // 'list'
        parseHTML: element => element.getAttribute('data-style') || 'list',
        renderHTML: attributes => ({
          'data-style': attributes.style,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="related-articles"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'related-articles' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RelatedNodeView);
  },
});
