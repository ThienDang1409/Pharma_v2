"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";

import SlashCommand from "./extensions/SlashCommand";
import suggestion from "./extensions/Suggestion";
import { Callout } from "./extensions/Callout";
import { ProductEmbed } from "./extensions/ProductEmbed";

import { useCallback, useState, useEffect } from "react";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Code as CodeIcon,
  Undo, Redo, Plus, Highlighter
} from "lucide-react";


import ResizableImage from "tiptap-extension-resize-image";
import ImageSelector from "../image/ImageSelector";

const lowlight = createLowlight(all);

interface ModernTiptapEditorProps {
  content: any; // Can be HTML string or JSON object
  onChange: (content: any) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  editable?: boolean;
}

type PickerType = "productList" | "imageGallery";

interface ComponentTemplate {
  id: string;
  pickerType: PickerType;
  title: string;
  description: string;
  html: string;
}

const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    id: "product-list-grid",
    pickerType: "productList",
    title: "Product Grid 3 cột",
    description: "Danh sách sản phẩm dạng thẻ hiện đại, phù hợp landing page.",
    html: `
      <section data-modern-component="product-list-grid" class="not-prose my-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-xl font-bold text-gray-900">Danh sách sản phẩm nổi bật</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article class="rounded-xl border border-gray-200 p-4">
            <img src="https://placehold.co/600x400" alt="Sản phẩm 1" class="mb-3 h-40 w-full rounded-lg object-cover" />
            <h4 class="text-base font-semibold text-gray-900">Sản phẩm 1</h4>
            <p class="mt-1 text-sm text-gray-500">Mô tả ngắn sản phẩm.</p>
          </article>
          <article class="rounded-xl border border-gray-200 p-4">
            <img src="https://placehold.co/600x400" alt="Sản phẩm 2" class="mb-3 h-40 w-full rounded-lg object-cover" />
            <h4 class="text-base font-semibold text-gray-900">Sản phẩm 2</h4>
            <p class="mt-1 text-sm text-gray-500">Mô tả ngắn sản phẩm.</p>
          </article>
          <article class="rounded-xl border border-gray-200 p-4">
            <img src="https://placehold.co/600x400" alt="Sản phẩm 3" class="mb-3 h-40 w-full rounded-lg object-cover" />
            <h4 class="text-base font-semibold text-gray-900">Sản phẩm 3</h4>
            <p class="mt-1 text-sm text-gray-500">Mô tả ngắn sản phẩm.</p>
          </article>
        </div>
      </section>
    `,
  },
  {
    id: "product-list-featured",
    pickerType: "productList",
    title: "Featured Product + List",
    description: "Một sản phẩm nổi bật bên trái và danh sách bên phải.",
    html: `
      <section data-modern-component="product-list-featured" class="not-prose my-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <article class="lg:col-span-3 rounded-2xl bg-gray-900 p-6 text-white">
            <div class="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-200">Featured</div>
            <h3 class="text-2xl font-bold">Sản phẩm chính</h3>
            <p class="mt-2 text-sm text-gray-200">Mô tả ngắn cho sản phẩm nổi bật.</p>
            <button class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900">Xem chi tiết</button>
          </article>
          <div class="lg:col-span-2 space-y-3">
            <div class="rounded-xl border border-gray-200 p-3">
              <h4 class="font-semibold text-gray-900">Sản phẩm phụ 1</h4>
              <p class="text-sm text-gray-500">Mô tả nhanh.</p>
            </div>
            <div class="rounded-xl border border-gray-200 p-3">
              <h4 class="font-semibold text-gray-900">Sản phẩm phụ 2</h4>
              <p class="text-sm text-gray-500">Mô tả nhanh.</p>
            </div>
            <div class="rounded-xl border border-gray-200 p-3">
              <h4 class="font-semibold text-gray-900">Sản phẩm phụ 3</h4>
              <p class="text-sm text-gray-500">Mô tả nhanh.</p>
            </div>
          </div>
        </div>
      </section>
    `,
  },
  {
    id: "gallery-masonry",
    pickerType: "imageGallery",
    title: "Image Gallery Masonry",
    description: "Bộ sưu tập hình ảnh dạng masonry nhẹ, dễ tùy biến.",
    html: `
      <section data-modern-component="gallery-masonry" class="not-prose my-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-xl font-bold text-gray-900">Bộ sưu tập hình ảnh</h3>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <img src="https://placehold.co/600x400" alt="Gallery 1" class="h-40 w-full rounded-xl object-cover" />
          <img src="https://placehold.co/600x500" alt="Gallery 2" class="h-56 w-full rounded-xl object-cover" />
          <img src="https://placehold.co/600x350" alt="Gallery 3" class="h-32 w-full rounded-xl object-cover" />
          <img src="https://placehold.co/600x450" alt="Gallery 4" class="h-48 w-full rounded-xl object-cover" />
        </div>
      </section>
    `,
  },
  {
    id: "gallery-slider-look",
    pickerType: "imageGallery",
    title: "Image Strip + Caption",
    description: "Dạng strip ảnh ngang với phần chú thích bên dưới.",
    html: `
      <section data-modern-component="gallery-strip" class="not-prose my-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-xl font-bold text-gray-900">Hình ảnh sản phẩm thực tế</h3>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <img src="https://placehold.co/600x420" alt="Gallery A" class="h-56 w-full rounded-xl object-cover" />
          <img src="https://placehold.co/600x420" alt="Gallery B" class="h-56 w-full rounded-xl object-cover" />
          <img src="https://placehold.co/600x420" alt="Gallery C" class="h-56 w-full rounded-xl object-cover" />
        </div>
        <p class="mt-3 text-sm text-gray-500">Bạn có thể đổi ảnh bằng trình quản lý media của hệ thống.</p>
      </section>
    `,
  },
];

export default function ModernTiptapEditor({
  content,
  onChange,
  placeholder = "Nhấn '/' để chèn nhanh...",
  onImageUpload,
  editable = true,
}: ModernTiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [pickerType, setPickerType] = useState<PickerType | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const openPicker = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: PickerType }>;
      if (customEvent.detail?.type) {
        setPickerType(customEvent.detail.type);
      }
    };

    const openImagePicker = () => {
      setShowImageSelector(true);
    };

    window.addEventListener("modern-editor:open-component-picker", openPicker);
    window.addEventListener("editor:open-image-picker", openImagePicker);
    return () => {
      window.removeEventListener("modern-editor:open-component-picker", openPicker);
      window.removeEventListener("editor:open-image-picker", openImagePicker);
    };
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary-600 underline hover:text-primary-800",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: "rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      CharacterCount,
      Callout,
      SlashCommand.configure({
        suggestion,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px] max-w-none p-4 md:p-8",
      },
    },
    onUpdate: ({ editor }) => {
      // We can return HTML or JSON. Let's return HTML for now to keep it compatible with existing DB, 
      // but in the plan we wanted JSON for advanced features.
      // onChange(editor.getJSON());
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    setShowImageSelector(true);
  }, []);

  const handleImageSelect = (imageId: string | null, imageData?: any) => {
    if (imageData?.cloudinaryUrl && editor) {
      editor.chain().focus().setImage({ src: imageData.cloudinaryUrl }).run();
    }
    setShowImageSelector(false);
  };

  const insertTemplate = (template: ComponentTemplate) => {
    if (!editor) {
      return;
    }

    editor.chain().focus().insertContent(template.html).run();
    setPickerType(null);
  };

  if (!isMounted || !editor) {
    return (
      <div className="w-full h-[500px] bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border-2 border-dashed border-gray-200">
        <span className="text-gray-400 font-medium">Đang tải trình soạn thảo...</span>
      </div>
    );
  }

  return (
    <>
    <div className="modern-editor-container bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Main Toolbar */}
      <div className="editor-header bg-gray-50/80 backdrop-blur-md border-b border-gray-200 p-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
              title="Redo"
            >
              <Redo size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-lg transition-all ${editor.isActive("heading", { level: 1 }) ? "bg-primary-50 text-primary-600 shadow-inner" : "text-gray-500 hover:bg-gray-100"}`}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg transition-all ${editor.isActive("heading", { level: 2 }) ? "bg-primary-50 text-primary-600 shadow-inner" : "text-gray-500 hover:bg-gray-100"}`}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-all ${editor.isActive("bulletList") ? "bg-primary-50 text-primary-600 shadow-inner" : "text-gray-500 hover:bg-gray-100"}`}
              title="Bullet List"
            >
              <List size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: "left" }) ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: "center" }) ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <AlignCenter size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={addImage}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
              title="Insert Image"
            >
              <ImageIcon size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded-lg transition-all ${editor.isActive("codeBlock") ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:bg-gray-100"}`}
              title="Code Block"
            >
              <CodeIcon size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Words</span>
            <span className="text-sm font-semibold text-gray-700">{editor.storage.characterCount.words()}</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-200 transition-all transform active:scale-95">
             Preview
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="editor-content-wrapper relative bg-white">
        {/* Quick Menu Hint */}
        {!editor.isActive('slashCommand') && editor.state.selection.empty && (
           <div className="absolute left-8 top-8 pointer-events-none text-gray-300 transition-opacity opacity-0 group-focus-within:opacity-100">
             {/* Hint text if needed */}
           </div>
        )}
        
        <EditorContent 
           editor={editor} 
           className="relative z-10"
        />
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-2.5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               Ready to write
            </span>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-medium italic">
               Tips: Type '/' to show menu
            </span>
         </div>
      </div>
    </div>
    <ImageSelector
      isOpen={showImageSelector}
      onClose={() => setShowImageSelector(false)}
      onSelect={(image) => handleImageSelect(image._id, image)}
      folder="blogs/content"
    />
    {pickerType && (
      <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                {pickerType === "productList" ? "Chọn danh sách sản phẩm" : "Chọn danh sách hình ảnh"}
              </h3>
              <p className="text-sm text-gray-500">Chọn component đã thiết kế sẵn để chèn nhanh vào nội dung.</p>
            </div>
            <button
              type="button"
              onClick={() => setPickerType(null)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {COMPONENT_TEMPLATES.filter((template) => template.pickerType === pickerType).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => insertTemplate(template)}
                className="text-left rounded-xl border border-gray-200 p-4 hover:border-primary-400 hover:shadow-md transition-all"
              >
                <div className="text-sm font-black text-gray-900">{template.title}</div>
                <p className="mt-1 text-xs text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
