"use client";

import { Extension } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ResizableImage from "tiptap-extension-resize-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { Table as TiptapTable } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Package,
  Palette,
  Quote,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
  Upload,
} from "lucide-react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
    };
  }
}
import SlashCommand from "./extensions/SlashCommand";
import suggestion from "./extensions/Suggestion";
import { RelatedProducts } from "./extensions/RelatedProducts";
import { RelatedArticles } from "./extensions/RelatedArticles";
import { ImageSlider } from "./extensions/ImageSlider";
import RelatedSelectionModal from "./components/RelatedSelectionModal";
import ImageSliderModal from "./components/ImageSliderModal";
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
  defaultCategoryId?: string;
  folder?: string;
}

interface RelatedModalState {
  isOpen: boolean;
  type: "products" | "articles";
  ids: string[];
  limit: number;
  style: string;
  pos: number | null;
}

type OverlayPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
type PickerType = "text" | "highlight" | "cellBg" | null;
type RelatedModalType = RelatedModalState["type"];

interface ImageSliderItem {
  id: string;
  url: string;
  caption: string;
}

interface ImageSliderModalState {
  isOpen: boolean;
  images: ImageSliderItem[];
  autoplay: boolean;
  showPagination: boolean;
  pos: number | null;
}

interface RelatedModalEventDetail {
  type: RelatedModalType;
  ids?: string[];
  limit?: number;
  style?: string;
  pos?: number | null;
}

interface ImageSliderModalEventDetail {
  images?: ImageSliderItem[];
  autoplay?: boolean;
  showPagination?: boolean;
  pos?: number | null;
}

const DEFAULT_TEXT_COLOR = "#111827";
const DEFAULT_HIGHLIGHT_COLOR = "#fef08a";
const DEFAULT_OVERLAY_BG_COLOR = "#0f172a";
const DEFAULT_OVERLAY_TEXT_COLOR = "#ffffff";

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32"];

const TEXT_COLORS = [
  "#000000",
  "#ffffff",
  // Red shades
  "#7f1d1d",
  "#991b1b",
  "#b91c1c",
  "#dc2626",
  "#ef4444",
  "#f87171",
  // Orange shades
  "#7c2d12",
  "#9a3412",
  "#c2410c",
  "#ea580c",
  "#f97316",
  "#fb923c",
  // Yellow shades
  "#713f12",
  "#854d0e",
  "#a16207",
  "#ca8a04",
  "#eab308",
  "#facc15",
  // Green shades
  "#14532d",
  "#166534",
  "#15803d",
  "#16a34a",
  "#22c55e",
  "#4ade80",
  // Blue shades
  "#1e3a8a",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  // Purple shades
  "#581c87",
  "#6b21a8",
  "#7e22ce",
  "#9333ea",
  "#a855f7",
  "#c084fc",
  // Pink shades
  "#831843",
  "#9d174d",
  "#be185d",
  "#db2777",
  "#ec4899",
  "#f472b6",
  // Gray shades
  "#111827",
  "#1f2937",
  "#374151",
  "#4b5563",
  "#6b7280",
  "#9ca3af",
];

const HIGHLIGHT_COLORS = [
  // Red shades
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  // Orange shades
  "#ffedd5",
  "#fed7aa",
  "#fdba74",
  "#fb923c",
  "#f97316",
  // Yellow shades
  "#fef9c3",
  "#fef08a",
  "#fde047",
  "#facc15",
  "#eab308",
  // Green shades
  "#dcfce7",
  "#bbf7d0",
  "#86efac",
  "#4ade80",
  "#22c55e",
  // Blue shades
  "#dbeafe",
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  // Purple shades
  "#ede9fe",
  "#ddd6fe",
  "#c4b5fd",
  "#a78bfa",
  "#8b5cf6",
  // Pink shades
  "#fce7f3",
  "#fbcfe8",
  "#f9a8d4",
  "#f472b6",
  "#ec4899",
  // Gray shades
  "#f3f4f6",
  "#e5e7eb",
  "#d1d5db",
  "#9ca3af",
  "#6b7280",
];

const TABLE_BG_COLORS = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#fee2e2",
  "#ffedd5",
  "#fef9c3",
  "#dcfce7",
  "#dbeafe",
  "#ede9fe",
  "#fce7f3",
  "#e2e8f0",
  "#fecaca",
  "#fed7aa",
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#ddd6fe",
  "#fbcfe8",
  "#cbd5e1",
  "#e5e7eb",
];

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

const isImageLikeNode = (nodeName?: string | null): boolean => {
  if (!nodeName) return false;
  return nodeName.toLowerCase().includes("image");
};

const normalizeOverlayPosition = (value?: string): OverlayPosition => {
  switch (value) {
    case "top-left":
    case "top-right":
    case "bottom-left":
    case "bottom-right":
    case "center":
      return value;
    default:
      return "bottom-left";
  }
};

const normalizeFontSize = (value?: string | null): string => {
  if (!value) return "16";
  const numericValue = value.replace("px", "").trim();
  return FONT_SIZES.includes(numericValue) ? numericValue : "16";
};

function CaptionIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h16" />
    </svg>
  );
}

function OverlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M7 11h10" />
      <path d="M7 15h6" />
    </svg>
  );
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
  onImageUpload,
  folder,
  defaultCategoryId,
}: TiptapEditorProps) {
  const [relatedModal, setRelatedModal] = useState<RelatedModalState>({
    isOpen: false,
    type: "products",
    ids: [],
    limit: 8,
    style: "slide",
    pos: null,
  });
  const [imageSliderModal, setImageSliderModal] = useState<ImageSliderModalState>({
    isOpen: false,
    images: [],
    autoplay: false,
    showPagination: true,
    pos: null,
  });
  const [showCellMenu, setShowCellMenu] = useState(false);
  const [cellMenuPosition, setCellMenuPosition] = useState({ x: 0, y: 0 });

  const [selectedColor, setSelectedColor] = useState(DEFAULT_TEXT_COLOR);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR);
  const [selectedBgColor, setSelectedBgColor] = useState("#ffffff");
  const [selectedFontSize, setSelectedFontSize] = useState("16");

  const [openColorPicker, setOpenColorPicker] = useState<PickerType>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

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
  const [overlayBackgroundColor, setOverlayBackgroundColor] = useState(DEFAULT_OVERLAY_BG_COLOR);
  const [overlayTextColor, setOverlayTextColor] = useState(DEFAULT_OVERLAY_TEXT_COLOR);

  const textColorButtonRef = useRef<HTMLButtonElement | null>(null);
  const highlightColorButtonRef = useRef<HTMLButtonElement | null>(null);
  const cellBgButtonRef = useRef<HTMLButtonElement | null>(null);
  const colorPopoverRef = useRef<HTMLDivElement | null>(null);

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

    const openRelatedModal = (event: Event) => {
      const customEvent = event as CustomEvent<RelatedModalEventDetail>;
      const { type, ids, limit, style, pos } = customEvent.detail;
      setRelatedModal({
        isOpen: true,
        type,
        ids: ids || [],
        limit: limit || (type === "products" ? 8 : 3),
        style: style || (type === "products" ? "slide" : "list"),
        pos: pos !== undefined ? pos : null,
      });
    };

    const openImageSliderModal = (event: Event) => {
      const customEvent = event as CustomEvent<ImageSliderModalEventDetail>;
      const { images, autoplay, showPagination, pos } = customEvent.detail;
      setImageSliderModal({
        isOpen: true,
        images: images || [],
        autoplay: autoplay || false,
        showPagination: showPagination !== undefined ? showPagination : true,
        pos: pos !== undefined ? pos : null,
      });
    };

    window.addEventListener("editor:open-image-picker", openImagePicker);
    window.addEventListener("editor:open-related-modal", openRelatedModal);
    window.addEventListener("editor:open-image-slider-modal", openImageSliderModal);
    return () => {
      window.removeEventListener("editor:open-image-picker", openImagePicker);
      window.removeEventListener("editor:open-related-modal", openRelatedModal);
      window.removeEventListener("editor:open-image-slider-modal", openImageSliderModal);
    };
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      RelatedProducts,
      RelatedArticles,
      ImageSlider,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontSize,
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
      ResizableImage,
      ImageCaption,
      ImageOverlayText,
      TiptapTable.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            layoutTemplate: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-layout-template"),
              renderHTML: (attributes) => {
                if (!attributes.layoutTemplate) return {};
                return { "data-layout-template": attributes.layoutTemplate };
              },
            },
          };
        },
      }).configure({
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
            layoutCell: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-layout-cell"),
              renderHTML: (attributes) => {
                if (!attributes.layoutCell) return {};
                return { "data-layout-cell": attributes.layoutCell };
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
            layoutCell: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-layout-cell"),
              renderHTML: (attributes) => {
                if (!attributes.layoutCell) return {};
                return { "data-layout-cell": attributes.layoutCell };
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
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[420px] max-w-none p-4",
      },
      handleClickOn: (_view, pos, node) => {
        if (!isImageLikeNode(node.type.name)) {
          return false;
        }

        setSelectedImagePos(pos);
        editor?.chain().focus().setNodeSelection(pos).run();
        return true;
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          if ($from.parent.type.name === "tableCell" || $from.parent.type.name === "tableHeader") {
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

      const filesFromFileList = Array.from(clipboardEvent.clipboardData?.files || []).filter((file) =>
        file.type.startsWith("image/")
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

      if (!dedupedFiles.length) return;

      clipboardEvent.preventDefault();

      void (async () => {
        setIsUploadingImage(true);

        try {
          for (const file of dedupedFiles) {
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
  }, [editor]);

  const findAdjacentNodePosition = useCallback(
    (imagePos: number, targetType: "imageCaption" | "imageOverlayText"): number | null => {
      if (!editor) return null;

      const imageNode = editor.state.doc.nodeAt(imagePos);
      if (!imageNode) return null;

      let cursor = imagePos + imageNode.nodeSize;
      for (let i = 0; i < 4; i += 1) {
        const candidateNode = editor.state.doc.nodeAt(cursor);
        if (!candidateNode) break;

        if (candidateNode.type.name === targetType) {
          return cursor;
        }

        if (candidateNode.type.name === "imageCaption" || candidateNode.type.name === "imageOverlayText") {
          cursor += candidateNode.nodeSize;
          continue;
        }

        break;
      }

      return null;
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    const syncToolbarState = () => {
      const textStyleAttrs = editor.getAttributes("textStyle") as {
        color?: string;
        fontSize?: string;
      };
      const highlightAttrs = editor.getAttributes("highlight") as {
        color?: string;
      };

      setSelectedColor(textStyleAttrs.color || DEFAULT_TEXT_COLOR);
      setSelectedFontSize(normalizeFontSize(textStyleAttrs.fontSize));
      setSelectedHighlightColor(highlightAttrs.color || DEFAULT_HIGHLIGHT_COLOR);
      setSelectedImagePos(findImageNodePosition());
    };

    syncToolbarState();
    editor.on("selectionUpdate", syncToolbarState);
    editor.on("transaction", syncToolbarState);

    return () => {
      editor.off("selectionUpdate", syncToolbarState);
      editor.off("transaction", syncToolbarState);
    };
  }, [editor, findImageNodePosition]);

  const openCaptionDialog = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) {
      window.alert("Hãy chọn ảnh trước khi thêm chú thích.");
      return;
    }

    const captionPos = findAdjacentNodePosition(imagePos, "imageCaption");
    const existingCaption = captionPos !== null ? editor.state.doc.nodeAt(captionPos) : null;

    setCaptionText(existingCaption?.textContent || "");
    setSelectedImagePos(imagePos);
    setShowCaptionDialog(true);
  }, [editor, findAdjacentNodePosition, findImageNodePosition, selectedImagePos]);

  const saveCaption = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) return;

    const imageNode = editor.state.doc.nodeAt(imagePos);
    if (!imageNode) return;

    const captionPayload = {
      type: "imageCaption",
      content: [{ type: "text", text: captionText.trim() }],
    };

    const existingCaptionPos = findAdjacentNodePosition(imagePos, "imageCaption");

    if (existingCaptionPos !== null) {
      const existingCaptionNode = editor.state.doc.nodeAt(existingCaptionPos);
      if (!existingCaptionNode) return;

      editor
        .chain()
        .focus()
        .deleteRange({
          from: existingCaptionPos,
          to: existingCaptionPos + existingCaptionNode.nodeSize,
        })
        .insertContentAt(existingCaptionPos, captionPayload)
        .setTextSelection(existingCaptionPos + 1)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContentAt(imagePos + imageNode.nodeSize, captionPayload)
        .setTextSelection(imagePos + imageNode.nodeSize + 1)
        .run();
    }

    setShowCaptionDialog(false);
  }, [captionText, editor, findAdjacentNodePosition, findImageNodePosition, selectedImagePos]);

  const openOverlayDialog = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) {
      window.alert("Hãy chọn ảnh trước khi viết đè.");
      return;
    }

    const overlayPos = findAdjacentNodePosition(imagePos, "imageOverlayText");
    const existingOverlay = overlayPos !== null ? editor.state.doc.nodeAt(overlayPos) : null;

    if (existingOverlay?.type.name === "imageOverlayText") {
      setOverlayText(existingOverlay.textContent || "");
      setOverlayPosition(normalizeOverlayPosition(existingOverlay.attrs.position));
      setOverlayBackgroundColor(
        typeof existingOverlay.attrs.backgroundColor === "string"
          ? existingOverlay.attrs.backgroundColor
          : DEFAULT_OVERLAY_BG_COLOR
      );
      setOverlayTextColor(
        typeof existingOverlay.attrs.textColor === "string"
          ? existingOverlay.attrs.textColor
          : DEFAULT_OVERLAY_TEXT_COLOR
      );
    } else {
      setOverlayText("");
      setOverlayPosition("bottom-left");
      setOverlayBackgroundColor(DEFAULT_OVERLAY_BG_COLOR);
      setOverlayTextColor(DEFAULT_OVERLAY_TEXT_COLOR);
    }

    setSelectedImagePos(imagePos);
    setShowOverlayDialog(true);
  }, [editor, findAdjacentNodePosition, findImageNodePosition, selectedImagePos]);

  const saveOverlay = useCallback(() => {
    if (!editor) return;

    const imagePos = selectedImagePos ?? findImageNodePosition();
    if (imagePos === null) return;

    const imageNode = editor.state.doc.nodeAt(imagePos);
    if (!imageNode) return;

    const overlayPayload = {
      type: "imageOverlayText",
      attrs: {
        position: overlayPosition,
        backgroundColor: overlayBackgroundColor,
        textColor: overlayTextColor,
      },
      content: [{ type: "text", text: overlayText.trim() }],
    };

    const existingOverlayPos = findAdjacentNodePosition(imagePos, "imageOverlayText");

    if (existingOverlayPos !== null) {
      const existingOverlayNode = editor.state.doc.nodeAt(existingOverlayPos);
      if (!existingOverlayNode) return;

      editor
        .chain()
        .focus()
        .deleteRange({
          from: existingOverlayPos,
          to: existingOverlayPos + existingOverlayNode.nodeSize,
        })
        .insertContentAt(existingOverlayPos, overlayPayload)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContentAt(imagePos + imageNode.nodeSize, overlayPayload)
        .run();
    }

    setShowOverlayDialog(false);
  }, [
    editor,
    findAdjacentNodePosition,
    findImageNodePosition,
    overlayBackgroundColor,
    overlayPosition,
    overlayText,
    overlayTextColor,
    selectedImagePos,
  ]);

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
      editor?.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) || "";

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
  }, [editor, linkText, linkUrl]);

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const setFontSize = useCallback(
    (value: string) => {
      if (!editor) return;

      if (value === "default") {
        editor
          .chain()
          .focus()
          .setMark("textStyle", { fontSize: null })
          .removeEmptyTextStyle()
          .run();
        setSelectedFontSize("16");
        return;
      }

      editor.chain().focus().setMark("textStyle", { fontSize: `${value}px` }).run();
      setSelectedFontSize(value);
    },
    [editor]
  );

  const setTextColor = useCallback(
    (color: string, closePicker = true) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
      setSelectedColor(color);
      if (closePicker) setOpenColorPicker(null);
    },
    [editor]
  );

  const unsetTextColor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetColor().run();
    setSelectedColor(DEFAULT_TEXT_COLOR);
    setOpenColorPicker(null);
  }, [editor]);

  const setHighlightColor = useCallback(
    (color: string, closePicker = true) => {
      if (!editor) return;
      editor.chain().focus().setHighlight({ color }).run();
      setSelectedHighlightColor(color);
      if (closePicker) setOpenColorPicker(null);
    },
    [editor]
  );

  const unsetHighlightColor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
    setSelectedHighlightColor(DEFAULT_HIGHLIGHT_COLOR);
    setOpenColorPicker(null);
  }, [editor]);

  const setCellBackgroundColor = useCallback(
    (color: string, closePicker = true) => {
      if (!editor) return;
      editor.chain().focus().setCellAttribute("backgroundColor", color).run();
      setSelectedBgColor(color);
      if (closePicker) setOpenColorPicker(null);
    },
    [editor]
  );

  const toggleCellBorder = useCallback(
    (borderStyle: "none" | "solid") => {
      if (!editor) return;
      editor.chain().focus().setCellAttribute("borderStyle", borderStyle).run();
    },
    [editor]
  );

  const mergeCells = useCallback(() => {
    editor?.chain().focus().mergeCells().run();
  }, [editor]);

  const splitCell = useCallback(() => {
    editor?.chain().focus().splitCell().run();
  }, [editor]);

  const getPickerAnchor = useCallback((picker: PickerType) => {
    if (picker === "text") return textColorButtonRef.current;
    if (picker === "highlight") return highlightColorButtonRef.current;
    if (picker === "cellBg") return cellBgButtonRef.current;
    return null;
  }, []);

  const updatePickerPosition = useCallback(
    (picker: Exclude<PickerType, null>) => {
      const anchor = getPickerAnchor(picker);
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const popupWidth = 312;
      const popupHeight = 286;

      let left = rect.left;
      if (left + popupWidth > window.innerWidth - 12) {
        left = window.innerWidth - popupWidth - 12;
      }
      left = Math.max(12, left);

      let top = rect.bottom + 8;
      if (top + popupHeight > window.innerHeight - 12) {
        top = rect.top - popupHeight - 8;
      }
      top = Math.max(12, top);

      setPickerPosition({ top, left });
    },
    [getPickerAnchor]
  );

  const toggleColorPicker = useCallback(
    (picker: Exclude<PickerType, null>) => {
      setOpenColorPicker((previousPicker) => {
        const nextPicker = previousPicker === picker ? null : picker;
        if (nextPicker) {
          requestAnimationFrame(() => updatePickerPosition(nextPicker));
        }
        return nextPicker;
      });
    },
    [updatePickerPosition]
  );

  useEffect(() => {
    if (!openColorPicker) return;

    const reposition = () => updatePickerPosition(openColorPicker);
    reposition();

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [openColorPicker, updatePickerPosition]);

  useEffect(() => {
    if (!openColorPicker) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (colorPopoverRef.current?.contains(target)) {
        return;
      }

      const anchor = getPickerAnchor(openColorPicker);
      if (anchor?.contains(target)) {
        return;
      }

      setOpenColorPicker(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [getPickerAnchor, openColorPicker]);

  useEffect(() => {
    if (!openColorPicker) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenColorPicker(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openColorPicker]);

  if (!editor) return null;

  const currentPickerPalette =
    openColorPicker === "text"
      ? TEXT_COLORS
      : openColorPicker === "highlight"
        ? HIGHLIGHT_COLORS
        : openColorPicker === "cellBg"
          ? TABLE_BG_COLORS
          : [];

  const currentPickerColor =
    openColorPicker === "text"
      ? selectedColor
      : openColorPicker === "highlight"
        ? selectedHighlightColor
        : selectedBgColor;

  const currentPickerLabel =
    openColorPicker === "text"
      ? "Text Color"
      : openColorPicker === "highlight"
        ? "Highlight Color"
        : "Cell Background";

  const applyPickerColor = (color: string, closePicker = true) => {
    if (openColorPicker === "text") {
      setTextColor(color, closePicker);
      return;
    }

    if (openColorPicker === "highlight") {
      setHighlightColor(color, closePicker);
      return;
    }

    if (openColorPicker === "cellBg") {
      setCellBackgroundColor(color, closePicker);
    }
  };

  const resetPickerColor = () => {
    if (openColorPicker === "text") {
      unsetTextColor();
      return;
    }

    if (openColorPicker === "highlight") {
      unsetHighlightColor();
      return;
    }

    if (openColorPicker === "cellBg") {
      setCellBackgroundColor("transparent");
    }
  };

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
    title: string;
    className?: string;
    children: ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm transition-colors
        ${active
          ? "border-blue-300 bg-blue-100 text-gray-900"
          : "border-transparent bg-white text-gray-700 hover:bg-blue-50"
        }
        ${disabled ? "cursor-not-allowed opacity-40" : ""}
        ${className}`}
    >
      {children}
    </button>
  );

  const ToolGroup = ({ children }: { children: ReactNode }) => (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
      {children}
    </div>
  );

  const isInTable = editor.isActive("table");
  const isImageSelected = selectedImagePos !== null;

  return (
    <div className="border border-gray-300 rounded-lg flex flex-col relative overflow-hidden bg-white h-full min-h-[550px]">
      <div className="bg-white border-b border-gray-300 p-2 space-y-2 sticky top-0 z-40 rounded-t-lg">
        <div className="flex flex-wrap items-center gap-2">
          <ToolGroup>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strike Through"
            >
              <Strikethrough size={15} />
            </ToolBtn>
          </ToolGroup>

          <ToolGroup>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={15} />
            </ToolBtn>
          </ToolGroup>

          <ToolGroup>
            <label className="text-xs font-semibold text-gray-600 pl-1" htmlFor="editor-font-size">
              Size
            </label>
            <select
              id="editor-font-size"
              value={selectedFontSize}
              onChange={(event) => setFontSize(event.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
              title="Font size"
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </ToolGroup>

          <ToolGroup>
            <button
              type="button"
              ref={textColorButtonRef}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => toggleColorPicker("text")}
              title="Text Color"
              className="inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-blue-50"
            >
              <Palette size={15} />
              <span className="h-3 w-3 rounded border border-gray-300" style={{ backgroundColor: selectedColor }} />
            </button>

            <button
              type="button"
              ref={highlightColorButtonRef}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => toggleColorPicker("highlight")}
              title="Highlight Color"
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm text-gray-700 hover:bg-blue-50 ${editor.isActive("highlight") ? "border-blue-300 bg-blue-100" : "border-transparent bg-white"
                }`}
            >
              <Highlighter size={15} />
              <span
                className="h-3 w-3 rounded border border-gray-300"
                style={{ backgroundColor: selectedHighlightColor }}
              />
            </button>
          </ToolGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToolGroup>
            <ToolBtn
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              active={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              active={editor.isActive({ textAlign: "justify" })}
              title="Justify"
            >
              <AlignJustify size={15} />
            </ToolBtn>
          </ToolGroup>

          <ToolGroup>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Ordered List"
            >
              <ListOrdered size={15} />
            </ToolBtn>
          </ToolGroup>

          <ToolGroup>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote size={15} />
            </ToolBtn>
          </ToolGroup>

          <ToolGroup>
            <ToolBtn onClick={openLinkDialog} active={editor.isActive("link")} title="Add/Edit Link">
              <Link2 size={15} />
            </ToolBtn>
            {editor.isActive("link") && (
              <ToolBtn onClick={unsetLink} title="Remove Link" className="text-red-600 hover:bg-red-50">
                <Link2Off size={15} />
              </ToolBtn>
            )}
          </ToolGroup>

          <ToolGroup>
            <ToolBtn
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo size={15} />
            </ToolBtn>
          </ToolGroup>
          <ToolGroup>
            <ToolBtn
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 1, cols: 2, withHeaderRow: false })
                  .run()
              }
              title="Insert Table"
            >
              <TableIcon size={15} />
              <span className="text-xs">Insert Table</span>
            </ToolBtn>
            <ToolBtn onClick={addImage} title="Open Image Library">
              <ImageIcon size={15} />
              <span className="text-xs">Library</span>
            </ToolBtn>
            <ToolBtn onClick={handleImageUpload} disabled={isUploadingImage} title="Upload Image">
              <Upload size={15} />
              <span className="text-xs">Upload</span>
            </ToolBtn>
          </ToolGroup>

          <ToolGroup>
            <ToolBtn
              onClick={() => setRelatedModal(prev => ({ ...prev, isOpen: true, type: "products", ids: [], pos: null }))}
              active={editor.isActive("relatedProducts")}
              title="Insert Related Products"
            >
              <Package size={15} />
              <span className="text-xs">Sản phẩm</span>
            </ToolBtn>
            <ToolBtn
              onClick={() => setRelatedModal(prev => ({ ...prev, isOpen: true, type: "articles", ids: [], pos: null }))}
              active={editor.isActive("relatedArticles")}
              title="Insert Related Articles"
            >
              <FileText size={15} />
              <span className="text-xs">Bài viết</span>
            </ToolBtn>
          </ToolGroup>


          {isInTable && (
            <ToolGroup>
              <ToolBtn
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Add Column Before"
              >
                <TableIcon size={15} />
                <span className="text-xs">+Col L</span>
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="Add Column After"
              >
                <TableIcon size={15} />
                <span className="text-xs">+Col R</span>
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Add Row Above"
              >
                <TableIcon size={15} />
                <span className="text-xs">+Row Up</span>
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="Add Row Below"
              >
                <TableIcon size={15} />
                <span className="text-xs">+Row Down</span>
              </ToolBtn>
              <ToolBtn onClick={mergeCells} title="Merge Cells">
                <span className="text-xs font-semibold">Merge</span>
              </ToolBtn>
              <ToolBtn onClick={splitCell} title="Split Cell">
                <span className="text-xs font-semibold">Split</span>
              </ToolBtn>

              <button
                type="button"
                ref={cellBgButtonRef}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleColorPicker("cellBg")}
                title="Cell Background"
                className="inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-blue-50"
              >
                <Palette size={15} />
                <span className="h-3 w-3 rounded border border-gray-300" style={{ backgroundColor: selectedBgColor }} />
              </button>

              <ToolBtn onClick={() => toggleCellBorder("solid")} title="Show Cell Border">
                <span className="text-xs">Border</span>
              </ToolBtn>
              <ToolBtn onClick={() => toggleCellBorder("none")} title="Hide Cell Border">
                <span className="text-xs">No Border</span>
              </ToolBtn>


            </ToolGroup>
          )}
          {isInTable && (
            <ToolGroup>
              <ToolBtn
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Column"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                <span className="text-xs">Col</span>
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Row"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                <span className="text-xs">Row</span>
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Delete Table"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                <span className="text-xs">Table</span>
              </ToolBtn>
            </ToolGroup>
          )
          }

          {isImageSelected && (
            <ToolGroup>
              <ToolBtn onClick={openCaptionDialog} title="Add/Edit Caption">
                <CaptionIcon />
                <span className="text-xs">Caption</span>
              </ToolBtn>
              <ToolBtn onClick={openOverlayDialog} title="Add/Edit Overlay">
                <OverlayIcon />
                <span className="text-xs">Overlay</span>
              </ToolBtn>
            </ToolGroup>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-2">


          {!isInTable && !isImageSelected && (
            <span className="text-xs text-gray-500 px-1">
              Chèn bảng/ảnh hoặc chọn một bảng/ảnh để hiện thêm công cụ chi tiết.
            </span>
          )}
        </div>
      </div>

      <EditorContent className="flex-1 overflow-y-auto pb-16 min-h-[420px]" editor={editor} />

      {showCellMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowCellMenu(false)} />
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[220px]"
            style={{ left: `${cellMenuPosition.x}px`, top: `${cellMenuPosition.y}px` }}
          >
            <div className="text-xs font-semibold text-gray-600 px-2 py-1 mb-1">Cell Options</div>

            <button
              type="button"
              onClick={() => {
                const color = window.prompt("Enter background color (hex):", selectedBgColor);
                if (color) {
                  setCellBackgroundColor(color);
                  setShowCellMenu(false);
                }
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Background Color
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              type="button"
              onClick={() => {
                toggleCellBorder("solid");
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Show Border
            </button>
            <button
              type="button"
              onClick={() => {
                toggleCellBorder("none");
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Hide Border
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              type="button"
              onClick={() => {
                mergeCells();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Merge Cells
            </button>
            <button
              type="button"
              onClick={() => {
                splitCell();
                setShowCellMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
            >
              Split Cell
            </button>

            <div className="border-t border-gray-200 my-1" />

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

            <div className="border-t border-gray-200 my-1" />

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

      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editor?.getAttributes("link").href ? "Edit Link" : "Add Link"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use selected text</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
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
                {linkUrl ? "Set Link" : "Remove Link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
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
              <p className="text-sm text-gray-500 mt-1">
                Chọn ảnh đã click, nhập dòng chú thích và lưu để hiển thị ngay phía dưới ảnh.
              </p>
            </div>
            <div className="p-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Nội dung chú thích</label>
              <input
                type="text"
                value={captionText}
                onChange={(event) => setCaptionText(event.target.value)}
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
              <p className="text-sm text-gray-500 mt-1">
                Chọn nội dung, vị trí và màu sắc để tạo overlay block rõ ràng trên ảnh.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung text</label>
                <textarea
                  value={overlayText}
                  onChange={(event) => setOverlayText(event.target.value)}
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
                  onChange={(event) => setOverlayPosition(event.target.value as OverlayPosition)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="top-left">Top left</option>
                  <option value="top-right">Top right</option>
                  <option value="bottom-left">Bottom left</option>
                  <option value="bottom-right">Bottom right</option>
                  <option value="center">Center</option>
                </select>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <label className="text-sm font-semibold text-gray-700">
                    Màu nền
                    <input
                      type="color"
                      value={overlayBackgroundColor}
                      onChange={(event) => setOverlayBackgroundColor(event.target.value)}
                      className="mt-1 block h-10 w-full cursor-pointer rounded border border-gray-300 bg-white"
                    />
                  </label>

                  <label className="text-sm font-semibold text-gray-700">
                    Màu chữ
                    <input
                      type="color"
                      value={overlayTextColor}
                      onChange={(event) => setOverlayTextColor(event.target.value)}
                      className="mt-1 block h-10 w-full cursor-pointer rounded border border-gray-300 bg-white"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
                  <div
                    className="mt-2 inline-block max-w-full rounded-lg px-3 py-2 text-sm font-semibold break-words"
                    style={{
                      backgroundColor: overlayBackgroundColor,
                      color: overlayTextColor,
                    }}
                  >
                    {overlayText.trim() || "Xem trước nội dung overlay"}
                  </div>
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

      {openColorPicker &&
        createPortal(
          <div
            ref={colorPopoverRef}
            className="fixed z-[120] w-[312px] rounded-xl border border-gray-300 bg-white p-3 shadow-2xl"
            style={{ top: pickerPosition.top, left: pickerPosition.left }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{currentPickerLabel}</p>
              <button
                type="button"
                onClick={() => setOpenColorPicker(null)}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {currentPickerPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyPickerColor(color)}
                  className={`h-7 w-7 rounded border-2 transition-colors ${color.toLowerCase() === currentPickerColor.toLowerCase()
                    ? "border-blue-500"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentPickerColor}
                  onChange={(event) => applyPickerColor(event.target.value, false)}
                  className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                  title="Custom color"
                />
                <div className="h-10 flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {currentPickerColor}
                </div>
              </div>
              <button
                type="button"
                onClick={resetPickerColor}
                className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                {openColorPicker === "highlight"
                  ? "Clear Highlight"
                  : openColorPicker === "cellBg"
                    ? "Clear Background"
                    : "Reset Color"}
              </button>
            </div>
          </div>,
          document.body
        )}

      <ImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={(image) => handleImageSelect(image._id, image)}
      />

      <RelatedSelectionModal
        isOpen={relatedModal.isOpen}
        onClose={() => setRelatedModal(prev => ({ ...prev, isOpen: false }))}
        type={relatedModal.type}
        initialIds={relatedModal.ids}
        initialLimit={relatedModal.limit}
        initialStyle={relatedModal.style}
        defaultCategoryId={defaultCategoryId}
        onConfirm={({ ids, limit, style }) => {
          if (!editor) return;

          const nodeType = relatedModal.type === "products" ? "relatedProducts" : "relatedArticles";
          const attrs = relatedModal.type === "products"
            ? { productIds: ids, displayLimit: limit, style }
            : { articleIds: ids, displayLimit: limit, style };

          if (relatedModal.pos !== null) {
            // Update existing node
            editor.chain()
              .focus()
              .setNodeSelection(relatedModal.pos)
              .insertContent({
                type: nodeType,
                attrs
              })
              .run();
          } else {
            // Insert new node
            editor.chain()
              .focus()
              .insertContent({
                type: nodeType,
                attrs
              })
              .run();
          }
          setRelatedModal(prev => ({ ...prev, isOpen: false }));
        }}
      />

      <ImageSliderModal
        key={`${imageSliderModal.pos ?? "new"}-${imageSliderModal.images.length}-${imageSliderModal.isOpen ? "open" : "closed"}`}
        isOpen={imageSliderModal.isOpen}
        onClose={() => setImageSliderModal(prev => ({ ...prev, isOpen: false }))}
        initialImages={imageSliderModal.images}
        initialAutoplay={imageSliderModal.autoplay}
        initialShowPagination={imageSliderModal.showPagination}
        onConfirm={({ images, autoplay, showPagination }) => {
          if (!editor) return;

          const attrs = {
            images: images || [],
            autoplay: autoplay || false,
            showPagination: showPagination !== undefined ? showPagination : true
          };

          if (imageSliderModal.pos !== null) {
            editor.chain()
              .focus()
              .setNodeSelection(imageSliderModal.pos)
              .insertContent({
                type: "imageSlider",
                attrs
              })
              .run();
          } else {
            editor.chain()
              .focus()
              .insertContent({
                type: "imageSlider",
                attrs
              })
              .run();
          }
          setImageSliderModal(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
