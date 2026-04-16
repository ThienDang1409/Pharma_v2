/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList } from '../components/CommandList';
import { layoutSlashItems, type SlashCommandItem } from './LayoutTemplates';

export default {
  char: '/',
  command: ({ editor, range, props }: any) => {
    props.command({ editor, range });
  },
  items: ({ query }: { query: string }) => {
    const baseItems: SlashCommandItem[] = [
      {
        title: 'Text',
        description: 'Bắt đầu viết văn bản thuần túy.',
        keywords: ['paragraph', 'text', 'chu'],
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .toggleNode('paragraph', 'paragraph')
            .run();
        },
      },
      {
        title: 'Heading 1',
        description: 'Tiêu đề lớn nhất.',
        keywords: ['h1', 'title', 'heading'],
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 1 })
            .run();
        },
      },
      {
        title: 'Heading 2',
        description: 'Tiêu đề vừa.',
        keywords: ['h2', 'heading'],
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 2 })
            .run();
        },
      },
      {
        title: 'Heading 3',
        description: 'Tiêu đề nhỏ.',
        keywords: ['h3', 'heading'],
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 3 })
            .run();
        },
      },
      {
        title: 'Bullet List',
        description: 'Tạo danh sách dấu chấm.',
        keywords: ['list', 'ul', 'bullet'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: 'Numbered List',
        description: 'Tạo danh sách đánh số.',
        keywords: ['list', 'ol', 'number'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: 'Blockquote',
        description: 'Trích dẫn nội dung.',
        keywords: ['quote', 'blockquote', 'trich dan'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
      },
      {
        title: 'Callout',
        description: 'Hộp thoại nhấn mạnh thông tin.',
        keywords: ['callout', 'note', 'alert'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setCallout({ type: 'info' }).run();
        },
      },
      {
        title: 'Code',
        description: 'Khối mã nguồn.',
        keywords: ['code', 'snippet'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
      },
      {
        title: 'Table',
        description: 'Chèn bảng dữ liệu.',
        keywords: ['table', 'bang', 'grid'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
      ...layoutSlashItems,
      {
        title: 'Divider',
        description: 'Đường kẻ phân cách.',
        keywords: ['divider', 'line', 'hr'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
      },
      {
        title: 'Image',
        description: 'Chèn hình ảnh từ thư viện.',
        keywords: ['image', 'photo', 'anh', 'hinh'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          const event = new CustomEvent("editor:open-image-picker");
          window.dispatchEvent(event);
        },
      },
      {
        title: 'Related Products',
        description: 'Nhúng danh sách sản phẩm cùng danh mục.',
        keywords: ['related', 'products', 'san pham'],
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent('<p>[[RELATED_PRODUCTS]]</p>')
            .run();
        },
      },
      {
        title: 'Related Articles',
        description: 'Nhúng danh sách bài viết cùng danh mục.',
        keywords: ['related', 'articles', 'bai viet'],
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent('<p>[[RELATED_ARTICLES]]</p>')
            .run();
        },
      },
    ];

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return baseItems;
    }

    return baseItems.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        ...(item.keywords || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
