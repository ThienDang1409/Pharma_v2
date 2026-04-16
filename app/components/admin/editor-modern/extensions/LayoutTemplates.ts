/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SlashCommandItem {
  title: string;
  description: string;
  keywords?: string[];
  command: ({ editor, range }: any) => void;
}

interface LayoutTemplateDefinition {
  key: string;
  title: string;
  description: string;
  keywords: string[];
  html: string;
}

const createInsertHtmlCommand =
  (html: string) =>
  ({ editor, range }: any) => {
    if (editor.isActive("table")) {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .deleteTable()
        .insertContent(html)
        .run();
      return;
    }

    editor.chain().focus().deleteRange(range).insertContent(html).run();
  };

const layoutTemplateDefinitions: LayoutTemplateDefinition[] = [
  {
    key: "image-image",
    title: "Layout: Hình + Hình",
    description: "Hai cột hình song song, có chỗ điền chú thích.",
    keywords: ["layout", "hinh hinh", "image image", "2 cot", "gallery"],
    html: `
      <table>
        <tbody>
          <tr>
            <td data-border-style="none">
              <p><strong>Hình 1</strong></p>
              <p><em>Nhấn / Image để chèn ảnh vào cột trái.</em></p>
              <p><em>Chú thích hình trái...</em></p>
            </td>
            <td data-border-style="none">
              <p><strong>Hình 2</strong></p>
              <p><em>Nhấn / Image để chèn ảnh vào cột phải.</em></p>
              <p><em>Chú thích hình phải...</em></p>
            </td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `.trim(),
  },
  {
    key: "image-text",
    title: "Layout: Hình + Chữ",
    description: "Một cột ảnh và một cột nội dung mô tả.",
    keywords: ["layout", "hinh chu", "image text", "story"],
    html: `
      <table>
        <tbody>
          <tr>
            <td data-border-style="none">
              <p><strong>Hình minh họa</strong></p>
              <p><em>Nhấn / Image để chèn ảnh.</em></p>
            </td>
            <td data-border-style="none">
              <h3>Tiêu đề nội dung</h3>
              <p>Điền nội dung mô tả cho phần này...</p>
            </td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `.trim(),
  },
  {
    key: "text-image",
    title: "Layout: Chữ + Hình",
    description: "Cột nội dung bên trái và ảnh bên phải.",
    keywords: ["layout", "chu hinh", "text image", "reverse"],
    html: `
      <table>
        <tbody>
          <tr>
            <td data-border-style="none">
              <h3>Tiêu đề nội dung</h3>
              <p>Điền nội dung mô tả cho phần này...</p>
            </td>
            <td data-border-style="none">
              <p><strong>Hình minh họa</strong></p>
              <p><em>Nhấn / Image để chèn ảnh.</em></p>
            </td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `.trim(),
  },
  {
    key: "text-text",
    title: "Layout: Chữ + Chữ",
    description: "Hai cột văn bản để so sánh hoặc kể song song.",
    keywords: ["layout", "chu chu", "text text", "compare"],
    html: `
      <table>
        <tbody>
          <tr>
            <td data-border-style="none">
              <h3>Cột trái</h3>
              <p>Nội dung cột trái...</p>
            </td>
            <td data-border-style="none">
              <h3>Cột phải</h3>
              <p>Nội dung cột phải...</p>
            </td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `.trim(),
  },
  {
    key: "triple-image",
    title: "Layout: 3 Hình Ngang",
    description: "Ba hình trên cùng một hàng để tạo gallery nhanh.",
    keywords: ["layout", "3 hinh", "three image", "gallery"],
    html: `
      <table>
        <tbody>
          <tr>
            <td data-border-style="none">
              <p><strong>Hình 1</strong></p>
              <p><em>Nhấn / Image để chèn ảnh.</em></p>
              <p><em>Caption 1</em></p>
            </td>
            <td data-border-style="none">
              <p><strong>Hình 2</strong></p>
              <p><em>Nhấn / Image để chèn ảnh.</em></p>
              <p><em>Caption 2</em></p>
            </td>
            <td data-border-style="none">
              <p><strong>Hình 3</strong></p>
              <p><em>Nhấn / Image để chèn ảnh.</em></p>
              <p><em>Caption 3</em></p>
            </td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `.trim(),
  },
  {
    key: "quote-image",
    title: "Layout: Trích Dẫn + Hình",
    description: "Khối quote nổi bật đi cùng ảnh minh họa.",
    keywords: ["layout", "quote", "trich dan", "testimonial"],
    html: `
      <table>
        <tbody>
          <tr>
            <td data-border-style="none">
              <blockquote>
                <p>"Câu trích dẫn nổi bật đặt ở đây..."</p>
              </blockquote>
              <p><strong>Người phát biểu</strong></p>
            </td>
            <td data-border-style="none">
              <p><strong>Hình minh họa</strong></p>
              <p><em>Nhấn / Image để chèn ảnh.</em></p>
            </td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `.trim(),
  },
];

export const layoutSlashItems: SlashCommandItem[] = layoutTemplateDefinitions.map(
  (template) => ({
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    command: createInsertHtmlCommand(template.html),
  })
);
