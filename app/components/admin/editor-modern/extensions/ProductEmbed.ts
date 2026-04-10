import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ProductNodeView from './ProductNodeView';

export const ProductEmbed = Node.create({
  name: 'productEmbed',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      productId: {
        default: null,
      },
      productName: {
        default: 'Sản phẩm mẫu',
      },
      price: {
        default: '0đ',
      },
      image: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-product-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductNodeView);
  },
});
