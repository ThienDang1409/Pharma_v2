"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useCallback, useState } from "react";
import "./tiptap.css";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
  onImageUpload,
}: TiptapEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showCellMenu, setShowCellMenu] = useState(false);
  const [cellMenuPosition, setCellMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedBgColor, setSelectedBgColor] = useState("#ffffff");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const colors = [
    "#000000", // Black
    "#ffffff", // White
    "#dc2626", // Red
    "#ea580c", // Orange
    "#ca8a04", // Yellow
    "#16a34a", // Green
    "#0284c7", // Blue
    "#9333ea", // Purple
    "#db2777", // Pink
    "#64748b", // Gray
  ];

  const bgColors = [
    "#ffffff", // White
    "#f3f4f6", // Light Gray
    "#dbeafe", // Light Blue
    "#dcfce7", // Light Green
    "#fef3c7", // Light Yellow
    "#fee2e2", // Light Red
    "#fce7f3", // Light Pink
    "#e0e7ff", // Light Indigo
    "#fef9c3", // Pale Yellow
    "#d1fae5", // Pale Green
  ];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'tableHeader', 'tableCell'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-800 cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) =>
                element.getAttribute("data-background-color"),
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) {
                  return {};
                }
                return {
                  "data-background-color": attributes.backgroundColor,
                };
              },
            },
            borderStyle: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-border-style"),
              renderHTML: (attributes) => {
                if (!attributes.borderStyle) {
                  return {};
                }
                return {
                  "data-border-style": attributes.borderStyle,
                };
              },
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          const styles = [];

          if (HTMLAttributes["data-background-color"]) {
            styles.push(
              `background-color: ${HTMLAttributes["data-background-color"]}`
            );
          }

          if (HTMLAttributes["data-border-style"]) {
            if (HTMLAttributes["data-border-style"] === "none") {
              styles.push("border: none !important");
            } else {
              styles.push("border: 2px solid #d1d5db");
            }
          }

          if (styles.length > 0) {
            HTMLAttributes.style = styles.join("; ");
          }

          return ["th", HTMLAttributes, 0];
        },
      }),
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) =>
                element.getAttribute("data-background-color"),
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) {
                  return {};
                }
                return {
                  "data-background-color": attributes.backgroundColor,
                };
              },
            },
            borderStyle: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-border-style"),
              renderHTML: (attributes) => {
                if (!attributes.borderStyle) {
                  return {};
                }
                return {
                  "data-border-style": attributes.borderStyle,
                };
              },
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          const styles = [];

          if (HTMLAttributes["data-background-color"]) {
            styles.push(
              `background-color: ${HTMLAttributes["data-background-color"]}`
            );
          }

          if (HTMLAttributes["data-border-style"]) {
            if (HTMLAttributes["data-border-style"] === "none") {
              styles.push("border: none !important");
            } else {
              styles.push("border: 2px solid #d1d5db");
            }
          }

          if (styles.length > 0) {
            HTMLAttributes.style = styles.join("; ");
          }

          return ["td", HTMLAttributes, 0];
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4",
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // Check if we're in a table cell
          if (
            $from.parent.type.name === "tableCell" ||
            $from.parent.type.name === "tableHeader"
          ) {
            event.preventDefault();
            setCellMenuPosition({ x: event.clientX, y: event.clientY });
            setShowCellMenu(true);
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        try {
          setIsUploadingImage(true);
          if (onImageUpload) {
            // Use custom upload handler if provided
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
          } else {
            // Fallback to data URL
            const reader = new FileReader();
            reader.onload = (event) => {
              const url = event.target?.result as string;
              editor.chain().focus().setImage({ src: url }).run();
            };
            reader.readAsDataURL(file);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image");
        } finally {
          setIsUploadingImage(false);
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  // Link handlers
  const openLinkDialog = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href || '';
    const selectedText = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    ) || '';
    
    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setShowLinkDialog(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      setShowLinkDialog(false);
      return;
    }

    // If there's link text, insert it first
    if (linkText && !editor.state.selection.empty === false) {
      editor.chain().focus().insertContent(linkText).run();
    }

    // Add http:// if no protocol specified
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl 
      : `https://${linkUrl}`;

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl, linkText]);

  const unsetLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const setColor = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().setColor(color).run();
        setSelectedColor(color);
        setShowColorPicker(false);
      }
    },
    [editor]
  );

  const unsetColor = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetColor().run();
      setShowColorPicker(false);
    }
  }, [editor]);

  const setCellBackgroundColor = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().setCellAttribute("backgroundColor", color).run();
        setSelectedBgColor(color);
        setShowBgColorPicker(false);
      }
    },
    [editor]
  );

  const toggleCellBorder = useCallback(
    (borderStyle: string) => {
      if (editor) {
        if (borderStyle === "none") {
          editor.chain().focus().setCellAttribute("borderStyle", "none").run();
        } else {
          editor.chain().focus().setCellAttribute("borderStyle", "solid").run();
        }
      }
    },
    [editor]
  );

  const mergeCells = useCallback(() => {
    if (editor) {
      editor.chain().focus().mergeCells().run();
    }
  }, [editor]);

  const splitCell = useCallback(() => {
    if (editor) {
      editor.chain().focus().splitCell().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-scroll">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-300 p-2 flex flex-wrap gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 font-bold text-gray-700 border transition-colors ${
            editor.isActive("bold")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 italic text-gray-700 border transition-colors ${
            editor.isActive("italic")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 line-through text-gray-700 border transition-colors ${
            editor.isActive("strike")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          S
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          H3
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("bulletList")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("orderedList")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("blockquote")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
        >
          Quote
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive({ textAlign: 'left' })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive({ textAlign: 'center' })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive({ textAlign: 'right' })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
          title="Align Right"
        >
          ➡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive({ textAlign: 'justify' })
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
          title="Justify"
        >
          ⬌
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        {/* Link Controls */}
        <button
          type="button"
          onClick={openLinkDialog}
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
            editor.isActive("link")
              ? "bg-blue-100 border-blue-300"
              : "border-transparent"
          }`}
          title="Add/Edit Link"
        >
          🔗
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={unsetLink}
            className="px-3 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent hover:border-red-300"
            title="Remove Link"
          >
            ⛔
          </button>
        )}
        <div className="w-px bg-gray-300 mx-1"></div>
        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-3 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 text-gray-700 border border-transparent"
          >
            <span>A</span>
            <div
              className="w-4 h-0.5 rounded"
              style={{ backgroundColor: selectedColor }}
            ></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10">
              <div className="grid grid-cols-5 gap-2 mb-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColor(color)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={unsetColor}
                  className="w-full px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Reset Color
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-px bg-gray-300 mx-1"></div>
        {/* Table Controls */}
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 1, cols: 2, withHeaderRow: false})
              .run()
          }
          className="px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent"
          title="Insert table"
        >
          ⊞ Table
        </button>
        {editor.isActive("table") && (
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Add column before"
            >
              ←Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Add column after"
            >
              Col→
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent text-xs"
              title="Delete column"
            >
              ✕Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Add row before"
            >
              ↑Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Add row after"
            >
              Row↓
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent text-xs"
              title="Delete row"
            >
              ✕Row
            </button>
            <button
              type="button"
              onClick={mergeCells}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Merge cells"
            >
              ⊕Merge
            </button>
            <button
              type="button"
              onClick={splitCell}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Split cell"
            >
              ⊟Split
            </button>
            <div className="w-px bg-gray-300 mx-0.5"></div>
            {/* Cell Background Color Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="px-2 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 text-gray-700 border border-transparent text-xs"
                title="Cell background color"
              >
                <span>🎨</span>
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: selectedBgColor }}
                ></div>
              </button>
              {showBgColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 w-48">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Cell Background
                  </p>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {bgColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCellBackgroundColor(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-2">
                    <input
                      type="color"
                      value={selectedBgColor}
                      onChange={(e) => setCellBackgroundColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setCellBackgroundColor("transparent")}
                      className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Clear Background
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleCellBorder("solid")}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Show border"
            >
              ▭ Border
            </button>
            <button
              type="button"
              onClick={() => toggleCellBorder("none")}
              className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
              title="Hide border"
            >
              ▢ No Border
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent text-xs"
              title="Delete table"
            >
              ✕Table
            </button>
          </>
        )}
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent"
          title="Add image from URL"
        >
          🔗 URL
        </button>
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={isUploadingImage}
          className="px-3 py-1.5 rounded hover:bg-blue-50 disabled:opacity-50 text-gray-700 border border-transparent"
          title="Upload image file"
        >
          {isUploadingImage ? "⏳" : "📤"} Upload
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1.5 rounded hover:bg-blue-50 disabled:opacity-50 text-gray-700 border border-transparent"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1.5 rounded hover:bg-blue-50 disabled:opacity-50 text-gray-700 border border-transparent"
        >
          ↷ Redo
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent className="overflow-scroll max-h-[600px]" editor={editor} />

      {/* Right-click Context Menu for Table Cells */}
      {showCellMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCellMenu(false)}
          />
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[200px]"
            style={{
              left: `${cellMenuPosition.x}px`,
              top: `${cellMenuPosition.y}px`,
            }}
          >
            <div className="text-xs font-semibold text-gray-600 px-2 py-1 mb-1">
              Cell Options
            </div>

            {/* Background Color */}
            <button
              type="button"
              onClick={() => {
                const color = window.prompt(
                  "Enter background color (hex):",
                  selectedBgColor
                );
                if (color) {
                  setCellBackgroundColor(color);
                  setShowCellMenu(false);
                }
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
            >
              <span>🎨</span>
              <span>Background Color</span>
            </button>

            {/* Border Options */}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              type="button"
              onClick={() => {
                toggleCellBorder("solid");
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
            >
              <span>▭</span>
              <span>Show Border</span>
            </button>
            <button
              type="button"
              onClick={() => {
                toggleCellBorder("none");
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
            >
              <span>▢</span>
              <span>Hide Border</span>
            </button>

            {/* Cell Actions */}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              type="button"
              onClick={() => {
                mergeCells();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
            >
              <span>⊕</span>
              <span>Merge Cells</span>
            </button>
            <button
              type="button"
              onClick={() => {
                splitCell();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
            >
              <span>⊟</span>
              <span>Split Cell</span>
            </button>

            {/* Row/Column Actions */}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addRowBefore().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Insert Row Above
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addRowAfter().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Insert Row Below
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addColumnBefore().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Insert Column Left
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addColumnAfter().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Insert Column Right
            </button>

            {/* Delete Actions */}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteRow().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
            >
              Delete Row
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteColumn().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
            >
              Delete Column
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteTable().run();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
            >
              Delete Table
            </button>
          </div>
        </>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editor?.getAttributes('link').href ? 'Edit Link' : 'Add Link'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use selected text
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={setLink}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                {linkUrl ? 'Set Link' : 'Remove Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
