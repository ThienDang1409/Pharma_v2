// "use client";

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Placeholder from "@tiptap/extension-placeholder";
// import Image from "@tiptap/extension-image";
// import { TextStyle } from "@tiptap/extension-text-style";
// import { Color } from "@tiptap/extension-color";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableHeader } from "@tiptap/extension-table-header";
// import { TableCell } from "@tiptap/extension-table-cell";
// import TextAlign from "@tiptap/extension-text-align";
// import Link from "@tiptap/extension-link";
// import { useCallback, useState, useEffect } from "react";
// import SlashCommand from "../editor-modern/extensions/SlashCommand";
// import suggestion from "../editor-modern/extensions/Suggestion";
// import "./tiptap.css";

// interface TiptapEditorProps {
//   content: string;
//   onChange: (content: string) => void;
//   placeholder?: string;
//   onImageUpload?: (file: File) => Promise<string>;
// }

// export default function TiptapEditor({
//   content,
//   onChange,
//   placeholder = "Write your content here...",
//   onImageUpload,
// }: TiptapEditorProps) {
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [showBgColorPicker, setShowBgColorPicker] = useState(false);
//   const [showCellMenu, setShowCellMenu] = useState(false);
//   const [cellMenuPosition, setCellMenuPosition] = useState({ x: 0, y: 0 });
//   const [selectedColor, setSelectedColor] = useState("#000000");
//   const [selectedBgColor, setSelectedBgColor] = useState("#ffffff");
//   const [isUploadingImage, setIsUploadingImage] = useState(false);
//   const [showLinkDialog, setShowLinkDialog] = useState(false);
//   const [linkUrl, setLinkUrl] = useState("");
//   const [linkText, setLinkText] = useState("");

//   const colors = [
//     "#000000", // Black
//     "#ffffff", // White
//     "#dc2626", // Red
//     "#ea580c", // Orange
//     "#ca8a04", // Yellow
//     "#16a34a", // Green
//     "#0284c7", // Blue
//     "#9333ea", // Purple
//     "#db2777", // Pink
//     "#64748b", // Gray
//   ];

//   const bgColors = [
//     "#ffffff", // White
//     "#f3f4f6", // Light Gray
//     "#dbeafe", // Light Blue
//     "#dcfce7", // Light Green
//     "#fef3c7", // Light Yellow
//     "#fee2e2", // Light Red
//     "#fce7f3", // Light Pink
//     "#e0e7ff", // Light Indigo
//     "#fef9c3", // Pale Yellow
//     "#d1fae5", // Pale Green
//   ];

//   const editor = useEditor({
//     immediatelyRender: false,
//     extensions: [
//       StarterKit,
//       TextStyle,
//       Color,
//       TextAlign.configure({
//         types: ['heading', 'paragraph', 'tableHeader', 'tableCell'],
//         alignments: ['left', 'center', 'right', 'justify'],
//       }),
//       Link.configure({
//         openOnClick: false,
//         HTMLAttributes: {
//           class: 'text-primary-600 underline hover:text-primary-800 cursor-pointer',
//         },
//       }),
//       Placeholder.configure({
//         placeholder,
//       }),
//       Image.configure({
//         HTMLAttributes: {
//           class: "max-w-full h-auto rounded",
//         },
//       }),
//       Table.configure({
//         resizable: true,
//       }),
//       TableRow,
//       SlashCommand.configure({
//         suggestion,
//       }),
//       TableHeader.extend({
//         addAttributes() {
//           return {
//             ...this.parent?.(),
//             backgroundColor: {
//               default: null,
//               parseHTML: (element) =>
//                 element.getAttribute("data-background-color"),
//               renderHTML: (attributes) => {
//                 if (!attributes.backgroundColor) {
//                   return {};
//                 }
//                 return {
//                   "data-background-color": attributes.backgroundColor,
//                 };
//               },
//             },
//             borderStyle: {
//               default: null,
//               parseHTML: (element) => element.getAttribute("data-border-style"),
//               renderHTML: (attributes) => {
//                 if (!attributes.borderStyle) {
//                   return {};
//                 }
//                 return {
//                   "data-border-style": attributes.borderStyle,
//                 };
//               },
//             },
//           };
//         },
//         renderHTML({ HTMLAttributes }) {
//           const styles = [];

//           if (HTMLAttributes["data-background-color"]) {
//             styles.push(
//               `background-color: ${HTMLAttributes["data-background-color"]}`
//             );
//           }

//           if (HTMLAttributes["data-border-style"]) {
//             if (HTMLAttributes["data-border-style"] === "none") {
//               styles.push("border: none !important");
//             } else {
//               styles.push("border: 2px solid #d1d5db");
//             }
//           }

//           if (styles.length > 0) {
//             HTMLAttributes.style = styles.join("; ");
//           }

//           return ["th", HTMLAttributes, 0];
//         },
//       }),
//       TableCell.extend({
//         addAttributes() {
//           return {
//             ...this.parent?.(),
//             backgroundColor: {
//               default: null,
//               parseHTML: (element) =>
//                 element.getAttribute("data-background-color"),
//               renderHTML: (attributes) => {
//                 if (!attributes.backgroundColor) {
//                   return {};
//                 }
//                 return {
//                   "data-background-color": attributes.backgroundColor,
//                 };
//               },
//             },
//             borderStyle: {
//               default: null,
//               parseHTML: (element) => element.getAttribute("data-border-style"),
//               renderHTML: (attributes) => {
//                 if (!attributes.borderStyle) {
//                   return {};
//                 }
//                 return {
//                   "data-border-style": attributes.borderStyle,
//                 };
//               },
//             },
//           };
//         },
//         renderHTML({ HTMLAttributes }) {
//           const styles = [];

//           if (HTMLAttributes["data-background-color"]) {
//             styles.push(
//               `background-color: ${HTMLAttributes["data-background-color"]}`
//             );
//           }

//           if (HTMLAttributes["data-border-style"]) {
//             if (HTMLAttributes["data-border-style"] === "none") {
//               styles.push("border: none !important");
//             } else {
//               styles.push("border: 2px solid #d1d5db");
//             }
//           }

//           if (styles.length > 0) {
//             HTMLAttributes.style = styles.join("; ");
//           }

//           return ["td", HTMLAttributes, 0];
//         },
//       }),
//     ],
//     content,
//     editorProps: {
//       attributes: {
//         class:
//           "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4",
//       },
//       handleDOMEvents: {
//         contextmenu: (view, event) => {
//           const { state } = view;
//           const { selection } = state;
//           const { $from } = selection;

//           // Check if we're in a table cell
//           if (
//             $from.parent.type.name === "tableCell" ||
//             $from.parent.type.name === "tableHeader"
//           ) {
//             event.preventDefault();
//             setCellMenuPosition({ x: event.clientX, y: event.clientY });
//             setShowCellMenu(true);
//             return true;
//           }
//           return false;
//         },
//       },
//     },
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//   });

//   // Update editor content if content prop changes from outside
//   useEffect(() => {
//     if (editor && content !== editor.getHTML()) {
//       editor.commands.setContent(content);
//     }
//   }, [content, editor]);

//   const addImage = useCallback(() => {
//     const url = window.prompt("Enter image URL:");
//     if (url && editor) {
//       editor.chain().focus().setImage({ src: url }).run();
//     }
//   }, [editor]);

//   const handleImageUpload = useCallback(async () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.onchange = async (e) => {
//       const file = (e.target as HTMLInputElement).files?.[0];
//       if (file && editor) {
//         try {
//           setIsUploadingImage(true);
//           if (onImageUpload) {
//             // Use custom upload handler if provided
//             const url = await onImageUpload(file);
//             editor.chain().focus().setImage({ src: url }).run();
//           } else {
//             // Fallback to data URL
//             const reader = new FileReader();
//             reader.onload = (event) => {
//               const url = event.target?.result as string;
//               editor.chain().focus().setImage({ src: url }).run();
//             };
//             reader.readAsDataURL(file);
//           }
//         } catch (error) {
//           console.error("Error uploading image:", error);
//           alert("Failed to upload image");
//         } finally {
//           setIsUploadingImage(false);
//         }
//       }
//     };
//     input.click();
//   }, [editor, onImageUpload]);

//   // Link handlers
//   const openLinkDialog = useCallback(() => {
//     const previousUrl = editor?.getAttributes('link').href || '';
//     const selectedText = editor?.state.doc.textBetween(
//       editor.state.selection.from,
//       editor.state.selection.to
//     ) || '';

//     setLinkUrl(previousUrl);
//     setLinkText(selectedText);
//     setShowLinkDialog(true);
//   }, [editor]);

//   const setLink = useCallback(() => {
//     if (!editor) return;

//     if (!linkUrl) {
//       editor.chain().focus().unsetLink().run();
//       setShowLinkDialog(false);
//       return;
//     }

//     // If there's link text, insert it first
//     if (linkText && !editor.state.selection.empty === false) {
//       editor.chain().focus().insertContent(linkText).run();
//     }

//     // Add http:// if no protocol specified
//     const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
//       ? linkUrl 
//       : `https://${linkUrl}`;

//     editor
//       .chain()
//       .focus()
//       .extendMarkRange('link')
//       .setLink({ href: url })
//       .run();

//     setShowLinkDialog(false);
//     setLinkUrl('');
//     setLinkText('');
//   }, [editor, linkUrl, linkText]);

//   const unsetLink = useCallback(() => {
//     if (editor) {
//       editor.chain().focus().unsetLink().run();
//     }
//   }, [editor]);

//   const setColor = useCallback(
//     (color: string) => {
//       if (editor) {
//         editor.chain().focus().setColor(color).run();
//         setSelectedColor(color);
//         setShowColorPicker(false);
//       }
//     },
//     [editor]
//   );

//   const unsetColor = useCallback(() => {
//     if (editor) {
//       editor.chain().focus().unsetColor().run();
//       setShowColorPicker(false);
//     }
//   }, [editor]);

//   const setCellBackgroundColor = useCallback(
//     (color: string) => {
//       if (editor) {
//         editor.chain().focus().setCellAttribute("backgroundColor", color).run();
//         setSelectedBgColor(color);
//         setShowBgColorPicker(false);
//       }
//     },
//     [editor]
//   );

//   const toggleCellBorder = useCallback(
//     (borderStyle: string) => {
//       if (editor) {
//         if (borderStyle === "none") {
//           editor.chain().focus().setCellAttribute("borderStyle", "none").run();
//         } else {
//           editor.chain().focus().setCellAttribute("borderStyle", "solid").run();
//         }
//       }
//     },
//     [editor]
//   );

//   const mergeCells = useCallback(() => {
//     if (editor) {
//       editor.chain().focus().mergeCells().run();
//     }
//   }, [editor]);

//   const splitCell = useCallback(() => {
//     if (editor) {
//       editor.chain().focus().splitCell().run();
//     }
//   }, [editor]);

//   if (!editor) {
//     return null;
//   }

//   return (
//     <div className="border border-gray-300 rounded-lg overflow-scroll">
//       {/* Toolbar */}
//       <div className="bg-white border-b border-gray-300 p-2 flex flex-wrap gap-1 shadow-sm">
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 font-bold text-gray-700 border transition-colors ${
//             editor.isActive("bold")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           B
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 italic text-gray-700 border transition-colors ${
//             editor.isActive("italic")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           I
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleStrike().run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 line-through text-gray-700 border transition-colors ${
//             editor.isActive("strike")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           S
//         </button>
//         <div className="w-px bg-gray-300 mx-1"></div>
//         <button
//           type="button"
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 1 }).run()
//           }
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("heading", { level: 1 })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           H1
//         </button>
//         <button
//           type="button"
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 2 }).run()
//           }
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("heading", { level: 2 })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           H2
//         </button>
//         <button
//           type="button"
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 3 }).run()
//           }
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("heading", { level: 3 })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           H3
//         </button>
//         <div className="w-px bg-gray-300 mx-1"></div>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("bulletList")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           • List
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("orderedList")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           1. List
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleBlockquote().run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("blockquote")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//         >
//           Quote
//         </button>
//         <div className="w-px bg-gray-300 mx-1"></div>
//         {/* Text Alignment */}
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().setTextAlign('left').run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive({ textAlign: 'left' })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//           title="Align Left"
//         >
//           ⬅
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().setTextAlign('center').run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive({ textAlign: 'center' })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//           title="Align Center"
//         >
//           ↔
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().setTextAlign('right').run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive({ textAlign: 'right' })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//           title="Align Right"
//         >
//           ➡
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().setTextAlign('justify').run()}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive({ textAlign: 'justify' })
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//           title="Justify"
//         >
//           ⬌
//         </button>
//         <div className="w-px bg-gray-300 mx-1"></div>
//         {/* Link Controls */}
//         <button
//           type="button"
//           onClick={openLinkDialog}
//           className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border transition-colors ${
//             editor.isActive("link")
//               ? "bg-blue-100 border-blue-300"
//               : "border-transparent"
//           }`}
//           title="Add/Edit Link"
//         >
//           🔗
//         </button>
//         {editor.isActive("link") && (
//           <button
//             type="button"
//             onClick={unsetLink}
//             className="px-3 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent hover:border-red-300"
//             title="Remove Link"
//           >
//             ⛔
//           </button>
//         )}
//         <div className="w-px bg-gray-300 mx-1"></div>
//         {/* Text Color Picker */}
//         <div className="relative">
//           <button
//             type="button"
//             onClick={() => setShowColorPicker(!showColorPicker)}
//             className="px-3 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 text-gray-700 border border-transparent"
//           >
//             <span>A</span>
//             <div
//               className="w-4 h-0.5 rounded"
//               style={{ backgroundColor: selectedColor }}
//             ></div>
//           </button>
//           {showColorPicker && (
//             <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10">
//               <div className="grid grid-cols-5 gap-2 mb-2">
//                 {colors.map((color) => (
//                   <button
//                     key={color}
//                     type="button"
//                     onClick={() => setColor(color)}
//                     className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
//                     style={{ backgroundColor: color }}
//                     title={color}
//                   />
//                 ))}
//               </div>
//               <div className="border-t border-gray-200 pt-2 space-y-2">
//                 <input
//                   type="color"
//                   value={selectedColor}
//                   onChange={(e) => setColor(e.target.value)}
//                   className="w-full h-8 rounded cursor-pointer"
//                 />
//                 <button
//                   type="button"
//                   onClick={unsetColor}
//                   className="w-full px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
//                 >
//                   Reset Color
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//         <div className="w-px bg-gray-300 mx-1"></div>
//         {/* Table Controls */}
//         <button
//           type="button"
//           onClick={() =>
//             editor
//               .chain()
//               .focus()
//               .insertTable({ rows: 1, cols: 2, withHeaderRow: false})
//               .run()
//           }
//           className="px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent"
//           title="Insert table"
//         >
//           ⊞ Table
//         </button>
//         {editor.isActive("table") && (
//           <>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().addColumnBefore().run()}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Add column before"
//             >
//               ←Col
//             </button>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().addColumnAfter().run()}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Add column after"
//             >
//               Col→
//             </button>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().deleteColumn().run()}
//               className="px-2 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent text-xs"
//               title="Delete column"
//             >
//               ✕Col
//             </button>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().addRowBefore().run()}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Add row before"
//             >
//               ↑Row
//             </button>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().addRowAfter().run()}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Add row after"
//             >
//               Row↓
//             </button>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().deleteRow().run()}
//               className="px-2 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent text-xs"
//               title="Delete row"
//             >
//               ✕Row
//             </button>
//             <button
//               type="button"
//               onClick={mergeCells}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Merge cells"
//             >
//               ⊕Merge
//             </button>
//             <button
//               type="button"
//               onClick={splitCell}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Split cell"
//             >
//               ⊟Split
//             </button>
//             <div className="w-px bg-gray-300 mx-0.5"></div>
//             {/* Cell Background Color Picker */}
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setShowBgColorPicker(!showBgColorPicker)}
//                 className="px-2 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 text-gray-700 border border-transparent text-xs"
//                 title="Cell background color"
//               >
//                 <span>🎨</span>
//                 <div
//                   className="w-4 h-4 rounded border border-gray-300"
//                   style={{ backgroundColor: selectedBgColor }}
//                 ></div>
//               </button>
//               {showBgColorPicker && (
//                 <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 w-48">
//                   <p className="text-xs font-medium text-gray-700 mb-2">
//                     Cell Background
//                   </p>
//                   <div className="grid grid-cols-5 gap-2 mb-2">
//                     {bgColors.map((color) => (
//                       <button
//                         key={color}
//                         type="button"
//                         onClick={() => setCellBackgroundColor(color)}
//                         className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
//                         style={{ backgroundColor: color }}
//                         title={color}
//                       />
//                     ))}
//                   </div>
//                   <div className="border-t border-gray-200 pt-2 space-y-2">
//                     <input
//                       type="color"
//                       value={selectedBgColor}
//                       onChange={(e) => setCellBackgroundColor(e.target.value)}
//                       className="w-full h-8 rounded cursor-pointer"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setCellBackgroundColor("transparent")}
//                       className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Clear Background
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <button
//               type="button"
//               onClick={() => toggleCellBorder("solid")}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Show border"
//             >
//               ▭ Border
//             </button>
//             <button
//               type="button"
//               onClick={() => toggleCellBorder("none")}
//               className="px-2 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-xs"
//               title="Hide border"
//             >
//               ▢ No Border
//             </button>
//             <button
//               type="button"
//               onClick={() => editor.chain().focus().deleteTable().run()}
//               className="px-2 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent text-xs"
//               title="Delete table"
//             >
//               ✕Table
//             </button>
//           </>
//         )}
//         <div className="w-px bg-gray-300 mx-1"></div>
//         <button
//           type="button"
//           onClick={addImage}
//           className="px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent"
//           title="Add image from URL"
//         >
//           🔗 URL
//         </button>
//         <button
//           type="button"
//           onClick={handleImageUpload}
//           disabled={isUploadingImage}
//           className="px-3 py-1.5 rounded hover:bg-blue-50 disabled:opacity-50 text-gray-700 border border-transparent"
//           title="Upload image file"
//         >
//           {isUploadingImage ? "⏳" : "📤"} Upload
//         </button>
//         <div className="w-px bg-gray-300 mx-1"></div>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().undo().run()}
//           disabled={!editor.can().undo()}
//           className="px-3 py-1.5 rounded hover:bg-blue-50 disabled:opacity-50 text-gray-700 border border-transparent"
//         >
//           ↶ Undo
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().redo().run()}
//           disabled={!editor.can().redo()}
//           className="px-3 py-1.5 rounded hover:bg-blue-50 disabled:opacity-50 text-gray-700 border border-transparent"
//         >
//           ↷ Redo
//         </button>
//       </div>

//       {/* Editor Content */}
//       <EditorContent className="overflow-scroll max-h-[600px]" editor={editor} />

//       {/* Right-click Context Menu for Table Cells */}
//       {showCellMenu && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setShowCellMenu(false)}
//           />
//           <div
//             className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[200px]"
//             style={{
//               left: `${cellMenuPosition.x}px`,
//               top: `${cellMenuPosition.y}px`,
//             }}
//           >
//             <div className="text-xs font-semibold text-gray-600 px-2 py-1 mb-1">
//               Cell Options
//             </div>

//             {/* Background Color */}
//             <button
//               type="button"
//               onClick={() => {
//                 const color = window.prompt(
//                   "Enter background color (hex):",
//                   selectedBgColor
//                 );
//                 if (color) {
//                   setCellBackgroundColor(color);
//                   setShowCellMenu(false);
//                 }
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
//             >
//               <span>🎨</span>
//               <span>Background Color</span>
//             </button>

//             {/* Border Options */}
//             <div className="border-t border-gray-200 my-1"></div>
//             <button
//               type="button"
//               onClick={() => {
//                 toggleCellBorder("solid");
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
//             >
//               <span>▭</span>
//               <span>Show Border</span>
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 toggleCellBorder("none");
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
//             >
//               <span>▢</span>
//               <span>Hide Border</span>
//             </button>

//             {/* Cell Actions */}
//             <div className="border-t border-gray-200 my-1"></div>
//             <button
//               type="button"
//               onClick={() => {
//                 mergeCells();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
//             >
//               <span>⊕</span>
//               <span>Merge Cells</span>
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 splitCell();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
//             >
//               <span>⊟</span>
//               <span>Split Cell</span>
//             </button>

//             {/* Row/Column Actions */}
//             <div className="border-t border-gray-200 my-1"></div>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().addRowBefore().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
//             >
//               Insert Row Above
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().addRowAfter().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
//             >
//               Insert Row Below
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().addColumnBefore().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
//             >
//               Insert Column Left
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().addColumnAfter().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
//             >
//               Insert Column Right
//             </button>

//             {/* Delete Actions */}
//             <div className="border-t border-gray-200 my-1"></div>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().deleteRow().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
//             >
//               Delete Row
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().deleteColumn().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
//             >
//               Delete Column
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 editor.chain().focus().deleteTable().run();
//                 setShowCellMenu(false);
//               }}
//               className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
//             >
//               Delete Table
//             </button>
//           </div>
//         </>
//       )}

//       {/* Link Dialog */}
//       {showLinkDialog && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">
//               {editor?.getAttributes('link').href ? 'Edit Link' : 'Add Link'}
//             </h3>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Link Text
//                 </label>
//                 <input
//                   type="text"
//                   value={linkText}
//                   onChange={(e) => setLinkText(e.target.value)}
//                   placeholder="Click here"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Leave blank to use selected text
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   URL
//                 </label>
//                 <input
//                   type="text"
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   placeholder="https://example.com"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
//                   autoFocus
//                 />
//               </div>
//             </div>

//             <div className="flex gap-2 mt-6">
//               <button
//                 type="button"
//                 onClick={setLink}
//                 className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
//               >
//                 {linkUrl ? 'Set Link' : 'Remove Link'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowLinkDialog(false);
//                   setLinkUrl('');
//                   setLinkText('');
//                 }}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ResizableImage from "tiptap-extension-resize-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useCallback, useState, useEffect } from "react";
import SlashCommand from "../editor-modern/extensions/SlashCommand";
import suggestion from "../editor-modern/extensions/Suggestion";
import ImageSelector from "../image/ImageSelector";
import ImageCaption from "./extensions/ImageCaption";
import ImageOverlayText from "./extensions/ImageOverlayText";
import { imageApi } from "@/lib/api";
import { IMAGE_FOLDERS } from "@/lib/constants/api";
import "./tiptap.css";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

type OverlayPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

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
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const [showCaptionDialog, setShowCaptionDialog] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [showOverlayDialog, setShowOverlayDialog] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition>("bottom-left");

  const uploadImageToCloudinary = useCallback(
    async (file: File): Promise<string> => {
      if (onImageUpload) {
        const uploadedUrl = await onImageUpload(file);
        if (!uploadedUrl) {
          throw new Error("Image upload did not return URL");
        }
        return uploadedUrl;
      }

      const response = await imageApi.upload(file, {
        folder: IMAGE_FOLDERS.BLOGS_CONTENT,
      });

      const uploadedUrl = response.data?.image?.cloudinaryUrl;
      if (!uploadedUrl) {
        throw new Error("Cloudinary URL was not returned by upload API");
      }

      return uploadedUrl;
    },
    [onImageUpload]
  );

  useEffect(() => {
    const openImagePicker = () => {
      setShowImageSelector(true);
    };

    window.addEventListener("editor:open-image-picker", openImagePicker);
    return () => {
      window.removeEventListener("editor:open-image-picker", openImagePicker);
    };
  }, []);

  const colors = [
    "#000000", "#ffffff", "#dc2626", "#ea580c", "#ca8a04",
    "#16a34a", "#0284c7", "#9333ea", "#db2777", "#64748b",
  ];

  const bgColors = [
    "#ffffff", "#f3f4f6", "#dbeafe", "#dcfce7", "#fef3c7",
    "#fee2e2", "#fce7f3", "#e0e7ff", "#fef9c3", "#d1fae5",
  ];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph", "tableHeader", "tableCell"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary-600 underline hover:text-primary-800 cursor-pointer",
        },
      }),
      Placeholder.configure({ placeholder }),
      // ResizableImage.configure({
      //   allowBase64: true,
      //   HTMLAttributes: {
      //     class: "max-w-full h-auto rounded transition-all shadow-sm",
      //   },
      // }),
      ResizableImage,
      ImageCaption,
      ImageOverlayText,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      SlashCommand.configure({ suggestion }),
      TableHeader.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-background-color"),
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) return {};
                return { "data-background-color": attributes.backgroundColor };
              },
            },
            borderStyle: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-border-style"),
              renderHTML: (attributes) => {
                if (!attributes.borderStyle) return {};
                return { "data-border-style": attributes.borderStyle };
              },
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          const styles: string[] = [];
          if (HTMLAttributes["data-background-color"]) {
            styles.push(`background-color: ${HTMLAttributes["data-background-color"]}`);
          }
          if (HTMLAttributes["data-border-style"]) {
            styles.push(
              HTMLAttributes["data-border-style"] === "none"
                ? "border: none !important"
                : "border: 2px solid #d1d5db"
            );
          }
          if (styles.length > 0) HTMLAttributes.style = styles.join("; ");
          return ["th", HTMLAttributes, 0];
        },
      }),
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-background-color"),
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) return {};
                return { "data-background-color": attributes.backgroundColor };
              },
            },
            borderStyle: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-border-style"),
              renderHTML: (attributes) => {
                if (!attributes.borderStyle) return {};
                return { "data-border-style": attributes.borderStyle };
              },
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          const styles: string[] = [];
          if (HTMLAttributes["data-background-color"]) {
            styles.push(`background-color: ${HTMLAttributes["data-background-color"]}`);
          }
          if (HTMLAttributes["data-border-style"]) {
            styles.push(
              HTMLAttributes["data-border-style"] === "none"
                ? "border: none !important"
                : "border: 2px solid #d1d5db"
            );
          }
          if (styles.length > 0) HTMLAttributes.style = styles.join("; ");
          return ["td", HTMLAttributes, 0];
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[360px] max-w-none p-4",
      },
        handleClickOn: (_view, pos, node) => {
          if (!isImageLikeNode(node.type.name)) {
            return false;
          }

          setSelectedImagePos(pos);
          editor?.commands.setNodeSelection(pos);
          return true;
        },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
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

  useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const insertUploadedImage = useCallback(
    async (file: File) => {
      if (!editor) return;

      const imageUrl = await uploadImageToCloudinary(file);
      editor
        .chain()
        .focus()
        .setImage({ src: imageUrl, alt: file.name })
        .run();
    },
    [editor, uploadImageToCloudinary]
  );

  useEffect(() => {
    if (!editor) return;

    const handlePaste: EventListener = (event) => {
      const clipboardEvent = event as ClipboardEvent;
      const filesFromItems = Array.from(clipboardEvent.clipboardData?.items || [])
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));

      const filesFromFileList = Array.from(clipboardEvent.clipboardData?.files || []).filter(
        (file) => file.type.startsWith("image/")
      );

      const dedupedFiles = [...filesFromItems, ...filesFromFileList].filter(
        (file, index, allFiles) =>
          allFiles.findIndex(
            (candidate) =>
              candidate.name === file.name &&
              candidate.size === file.size &&
              candidate.lastModified === file.lastModified
          ) === index
      );

      const files = dedupedFiles;

      if (!files.length) return;

      clipboardEvent.preventDefault();

      void (async () => {
        setIsUploadingImage(true);

        try {
          for (const file of files) {
            await insertUploadedImage(file);
          }
        } catch (error) {
          console.error("Error handling pasted image:", error);
          window.alert("Paste ảnh thất bại. Vui lòng kiểm tra upload Cloudinary.");
        } finally {
          setIsUploadingImage(false);
        }
      })();
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener("paste", handlePaste);

    return () => {
      editorDom.removeEventListener("paste", handlePaste);
    };
  }, [editor, insertUploadedImage]);

  const isImageLikeNode = useCallback((nodeName?: string | null): boolean => {
    if (!nodeName) return false;
    return nodeName.toLowerCase().includes("image");
  }, []);

  const findImageNodePosition = useCallback((): number | null => {
    if (!editor) return null;

    const { state } = editor;
    const { from, to } = state.selection;
    let imagePos: number | null = null;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (isImageLikeNode(node.type.name) && imagePos === null) {
        imagePos = pos;
        return false;
      }
      return true;
    });

    if (imagePos !== null) return imagePos;

    const nodeAtFrom = state.doc.nodeAt(from);
    if (isImageLikeNode(nodeAtFrom?.type.name)) {
      return from;
    }

    const beforeNode = state.selection.$from.nodeBefore;
    if (beforeNode && isImageLikeNode(beforeNode.type.name)) {
      return from - beforeNode.nodeSize;
    }

    const afterNode = state.selection.$from.nodeAfter;
    if (afterNode && isImageLikeNode(afterNode.type.name)) {
      return from;
    }

    return null;
  }, [editor, isImageLikeNode]);

  const openCaptionDialog = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) {
      window.alert("Hãy chọn ảnh trước khi thêm chú thích.");
      return;
    }

    const imageNode = editor.state.doc.nodeAt(imagePos);
    const existingCaption = imageNode ? editor.state.doc.nodeAt(imagePos + imageNode.nodeSize) : null;
    setCaptionText(existingCaption ? existingCaption.textContent || "" : "");
    setSelectedImagePos(imagePos);
    setShowCaptionDialog(true);
  }, [editor, findImageNodePosition, selectedImagePos]);

  const saveCaption = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) return;

    const imageNode = editor.state.doc.nodeAt(imagePos);
    if (!imageNode) return;

    const captionPos = imagePos + imageNode.nodeSize;
    const existingNode = editor.state.doc.nodeAt(captionPos);

    if (existingNode?.type.name === "imageCaption") {
      editor
        .chain()
        .focus()
        .deleteRange({ from: captionPos, to: captionPos + existingNode.nodeSize })
        .insertContentAt(captionPos, {
          type: "imageCaption",
          content: [{ type: "text", text: captionText.trim() }],
        })
        .setTextSelection(captionPos + 1)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContentAt(captionPos, {
          type: "imageCaption",
          content: [{ type: "text", text: captionText.trim() }],
        })
        .setTextSelection(captionPos + 1)
        .run();
    }

    setShowCaptionDialog(false);
  }, [captionText, editor, findImageNodePosition, selectedImagePos]);

  const openOverlayDialog = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) {
      window.alert("Hãy chọn ảnh trước khi viết đè.");
      return;
    }

    const imageNode = editor.state.doc.nodeAt(imagePos);
    const existingOverlay = imageNode ? editor.state.doc.nodeAt(imagePos + imageNode.nodeSize) : null;
    setOverlayText(existingOverlay ? existingOverlay.textContent || "" : "");
    setOverlayPosition("bottom-left");
    setSelectedImagePos(imagePos);
    setShowOverlayDialog(true);
  }, [editor, findImageNodePosition, selectedImagePos]);

  const saveOverlay = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) return;

    const imageNode = editor.state.doc.nodeAt(imagePos);
    if (!imageNode) return;

    const overlayPos = imagePos + imageNode.nodeSize;
    const existingNode = editor.state.doc.nodeAt(overlayPos);

    if (existingNode?.type.name === "imageOverlayText") {
      editor
        .chain()
        .focus()
        .deleteRange({ from: overlayPos, to: overlayPos + existingNode.nodeSize })
        .insertContentAt(overlayPos, {
          type: "imageOverlayText",
          attrs: { position: overlayPosition },
          content: [{ type: "text", text: overlayText.trim() }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContentAt(overlayPos, {
          type: "imageOverlayText",
          attrs: { position: overlayPosition },
          content: [{ type: "text", text: overlayText.trim() }],
        })
        .run();
    }

    setShowOverlayDialog(false);
  }, [editor, findImageNodePosition, overlayPosition, overlayText, selectedImagePos]);

  const addImage = useCallback(() => {
    setShowImageSelector(true);
  }, []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploadingImage(true);
      try {
        await insertUploadedImage(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        window.alert("Upload ảnh thất bại. Vui lòng kiểm tra Cloudinary.");
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  }, [insertUploadedImage]);

  const handleImageSelect = (
    _imageId: string | null,
    imageData?: { cloudinaryUrl?: string; fileName?: string; description?: string }
  ) => {
    if (imageData?.cloudinaryUrl && editor) {
      editor.chain().focus().setImage({ src: imageData.cloudinaryUrl }).run();
    }
    setShowImageSelector(false);
  };

  const openLinkDialog = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href || "";
    const selectedText =
      editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      ) || "";
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
    if (linkText && editor.state.selection.empty) {
      editor.chain().focus().insertContent(linkText).run();
    }
    const url =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
        ? linkUrl
        : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  }, [editor, linkUrl, linkText]);

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
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
        editor
          .chain()
          .focus()
          .setCellAttribute("borderStyle", borderStyle === "none" ? "none" : "solid")
          .run();
      }
    },
    [editor]
  );

  const mergeCells = useCallback(() => {
    editor?.chain().focus().mergeCells().run();
  }, [editor]);

  const splitCell = useCallback(() => {
    editor?.chain().focus().splitCell().run();
  }, [editor]);

  if (!editor) return null;

  // ─── Toolbar button helper ────────────────────────────────────
  const ToolBtn = ({
    onClick,
    active,
    disabled,
    title,
    className = "",
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-3 py-1.5 rounded border transition-colors text-sm
        ${active ? "bg-blue-100 border-blue-300 text-gray-800" : "border-transparent text-gray-700 hover:bg-blue-50"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg flex flex-col relative overflow-visible bg-white h-full min-h-[520px]">
      {/* ─── Toolbar ─── */}
      <div className="relative bg-white border-b border-gray-300 p-2 flex flex-wrap content-start gap-1 min-h-[104px] shadow-sm overflow-visible sticky top-0 z-40 rounded-t-lg">
        {/* Text style */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <span className="line-through">S</span>
        </ToolBtn>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>H1</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</ToolBtn>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>• List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1. List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>Quote</ToolBtn>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Text Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">⬅</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">↔</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">➡</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">⬌</ToolBtn>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Link */}
        <ToolBtn onClick={openLinkDialog} active={editor.isActive("link")} title="Add/Edit Link">🔗</ToolBtn>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={unsetLink}
            className="px-3 py-1.5 rounded hover:bg-red-50 text-red-600 border border-transparent hover:border-red-300 text-sm"
            title="Remove Link"
          >
            ⛔
          </button>
        )}

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-3 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 text-gray-700 border border-transparent text-sm"
          >
            <span>A</span>
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: selectedColor }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[70]">
              <div className="grid grid-cols-5 gap-2 mb-2">
                {colors.map((color) => (
                  <button key={color} type="button" onClick={() => setColor(color)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <input type="color" value={selectedColor} onChange={(e) => setColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                <button type="button" onClick={unsetColor} className="w-full px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">Reset Color</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Table Insert */}
        <ToolBtn
          onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 3, withHeaderRow: false }).run()}
          title="Insert table"
        >
          ⊞ Table
        </ToolBtn>

        {/* Table Controls — only visible when inside a table */}
        {editor.isActive("table") && (
          <>
            <ToolBtn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column before">←Col</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after">Col→</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column" className="hover:bg-red-50 text-red-600">✕Col</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row before">↑Row</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row after">Row↓</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row" className="hover:bg-red-50 text-red-600">✕Row</ToolBtn>
            <ToolBtn onClick={mergeCells} title="Merge cells">⊕Merge</ToolBtn>
            <ToolBtn onClick={splitCell} title="Split cell">⊟Split</ToolBtn>

            <div className="w-px bg-gray-300 mx-0.5 self-stretch" />

            {/* Cell Background Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="px-2 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 text-gray-700 border border-transparent text-xs"
                title="Cell background color"
              >
                <span>🎨</span>
                <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: selectedBgColor }} />
              </button>
              {showBgColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[70] w-48">
                  <p className="text-xs font-medium text-gray-700 mb-2">Cell Background</p>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {bgColors.map((color) => (
                      <button key={color} type="button" onClick={() => setCellBackgroundColor(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                        style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-2">
                    <input type="color" value={selectedBgColor} onChange={(e) => setCellBackgroundColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                    <button type="button" onClick={() => setCellBackgroundColor("transparent")} className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Clear Background</button>
                  </div>
                </div>
              )}
            </div>

            <ToolBtn onClick={() => toggleCellBorder("solid")} title="Show border">▭ Border</ToolBtn>
            <ToolBtn onClick={() => toggleCellBorder("none")} title="Hide border">▢ No Border</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} className="hover:bg-red-50 text-red-600" title="Delete table">✕Table</ToolBtn>
          </>
        )}

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Image */}
        <ToolBtn onClick={addImage} title="Open image library">🖼️ Library</ToolBtn>
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={isUploadingImage}
          title="Upload image file"
          className={`px-3 py-1.5 rounded hover:bg-blue-50 text-gray-700 border border-transparent text-sm ${isUploadingImage ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {isUploadingImage ? "⏳" : "📤"} Upload
        </button>
        <ToolBtn onClick={openCaptionDialog} title="Them chu thich cho anh dang chon">📝 Chu thich</ToolBtn>
        <ToolBtn onClick={openOverlayDialog} title="Them o text de viet de len anh">✍ Overlay</ToolBtn>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Undo/Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↶ Undo</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↷ Redo</ToolBtn>
      </div>

      {/* ─── Editor ─── */}
      <EditorContent className="flex-1 overflow-y-auto min-h-[420px]" editor={editor} />

      {/* ─── Right-click Context Menu ─── */}
      {showCellMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowCellMenu(false)} />
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[200px]"
            style={{ left: `${cellMenuPosition.x}px`, top: `${cellMenuPosition.y}px` }}
          >
            <div className="text-xs font-semibold text-gray-600 px-2 py-1 mb-1">Cell Options</div>
            <button type="button" onClick={() => { const c = window.prompt("Enter background color (hex):", selectedBgColor); if (c) { setCellBackgroundColor(c); setShowCellMenu(false); } }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm">🎨 Background Color</button>
            <div className="border-t border-gray-200 my-1" />
            <button type="button" onClick={() => { toggleCellBorder("solid"); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">▭ Show Border</button>
            <button type="button" onClick={() => { toggleCellBorder("none"); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">▢ Hide Border</button>
            <div className="border-t border-gray-200 my-1" />
            <button type="button" onClick={() => { mergeCells(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">⊕ Merge Cells</button>
            <button type="button" onClick={() => { splitCell(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">⊟ Split Cell</button>
            <div className="border-t border-gray-200 my-1" />
            <button type="button" onClick={() => { editor.chain().focus().addRowBefore().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">Insert Row Above</button>
            <button type="button" onClick={() => { editor.chain().focus().addRowAfter().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">Insert Row Below</button>
            <button type="button" onClick={() => { editor.chain().focus().addColumnBefore().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">Insert Column Left</button>
            <button type="button" onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">Insert Column Right</button>
            <div className="border-t border-gray-200 my-1" />
            <button type="button" onClick={() => { editor.chain().focus().deleteRow().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm">Delete Row</button>
            <button type="button" onClick={() => { editor.chain().focus().deleteColumn().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm">Delete Column</button>
            <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); setShowCellMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded text-sm">Delete Table</button>
          </div>
        </>
      )}

      {/* ─── Link Dialog ─── */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editor?.getAttributes("link").href ? "Edit Link" : "Add Link"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use selected text</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={setLink}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                {linkUrl ? "Set Link" : "Remove Link"}
              </button>
              <button type="button" onClick={() => { setShowLinkDialog(false); setLinkUrl(""); setLinkText(""); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCaptionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Thêm chú thích ảnh</h3>
              <p className="text-sm text-gray-500 mt-1">Chọn ảnh đã click, nhập dòng chú thích và lưu để hiển thị ngay phía dưới ảnh.</p>
            </div>
            <div className="p-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Nội dung chú thích</label>
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập chú thích ảnh..."
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCaptionDialog(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveCaption}
                disabled={!captionText.trim()}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lưu chú thích
              </button>
            </div>
          </div>
        </div>
      )}

      {showOverlayDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Viết đè lên ảnh</h3>
              <p className="text-sm text-gray-500 mt-1">Tạo một ô text nổi trên ảnh. Bản này là overlay block riêng, chưa phải kéo thả tự do.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung text</label>
                <textarea
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nhập text muốn đè lên ảnh..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí overlay</label>
                <select
                  value={overlayPosition}
                  onChange={(e) => setOverlayPosition(e.target.value as OverlayPosition)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="top-left">Top left</option>
                  <option value="top-right">Top right</option>
                  <option value="bottom-left">Bottom left</option>
                  <option value="bottom-right">Bottom right</option>
                  <option value="center">Center</option>
                </select>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  Nếu bạn muốn kéo thả ô text tự do trên ảnh, mình sẽ nâng cấp thành canvas overlay riêng ở bước tiếp theo.
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOverlayDialog(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveOverlay}
                disabled={!overlayText.trim()}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Chèn overlay
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={(image) => handleImageSelect(image._id, image)}
      />
    </div>
  );
}