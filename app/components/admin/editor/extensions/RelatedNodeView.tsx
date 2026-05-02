import React, { useEffect, useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Package, FileText, Trash2, Edit2 } from "lucide-react";
import { blogApi } from "@/lib/api";
import ProductCard from "@/app/components/cards/ProductCard";
import NewsCard from "@/app/components/cards/NewsCard";
import type { Blog } from "@/lib/types";

interface RelatedNodeAttrs {
  productIds?: string[];
  articleIds?: string[];
  displayLimit?: number;
  style?: string;
}

interface RelatedNode {
  type: {
    name: "relatedProducts" | "relatedArticles";
  };
  attrs: RelatedNodeAttrs;
}

interface RelatedNodeViewProps {
  node: RelatedNode;
}

export default function RelatedNodeView(props: ReactNodeViewProps) {
  const { node, deleteNode, getPos } = props;
  const typedNode = node as typeof node & RelatedNodeViewProps["node"];
  const isProducts = typedNode.type.name === "relatedProducts";
  const ids = isProducts
    ? (typedNode.attrs.productIds ?? [])
    : (typedNode.attrs.articleIds ?? []);
  const limit = typedNode.attrs.displayLimit;
  const style = typedNode.attrs.style;

  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (!ids || ids.length === 0) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedItems = await Promise.all(
          ids.slice(0, 4).map(async (id: string) => {
            try {
              const response = await blogApi.getById(id);
              return response.data?.blog;
            } catch {
              return null;
            }
          })
        );
        setItems(fetchedItems.filter((item): item is Blog => item !== null));
      } catch (error) {
        console.error("Error fetching related items preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [ids]);

  const handleEdit = () => {
    const event = new CustomEvent("editor:open-related-modal", {
      detail: {
        type: isProducts ? "products" : "articles",
        ids,
        limit,
        style,
        pos: getPos(),
      }
    });
    window.dispatchEvent(event);
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "";
    return new Date(dateInput).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <NodeViewWrapper className="related-embed-wrapper my-12 group relative">
      <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-100 p-8 transition-all hover:border-primary-200 hover:bg-primary-50/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isProducts ? 'bg-primary-50 text-primary-900' : 'bg-secondary-50 text-secondary-800'}`}>
              {isProducts ? <Package size={24} /> : <FileText size={24} />}
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-950 uppercase tracking-tight">
                {isProducts ? "Sản phẩm liên quan" : "Bài viết liên quan"}
                <span className="ml-3 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {ids?.length || 0} mục • {style}
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-2.5 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-100 hover:text-primary-900 hover:border-primary-200 hover:bg-primary-50 transition-all"
              title="Edit items"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => deleteNode()}
              className="p-2.5 bg-white text-rose-500 rounded-xl shadow-sm border border-gray-100 hover:bg-rose-50 hover:border-rose-200 transition-all"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-48 h-64 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-64 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow pointer-events-none"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <div className="scale-90 origin-top">
                  {isProducts ? (
                    <ProductCard product={item} />
                  ) : (
                    <NewsCard article={item} formatDate={formatDate} />
                  )}
                </div>
              </div>
            ))}
            {ids.length > 4 && (
              <div className="flex-shrink-0 w-24 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 font-bold text-sm">
                +{ids.length - 4} thêm
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400 font-bold italic py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
            Chưa có {isProducts ? "sản phẩm" : "bài viết"} nào được chọn. Nhấn biểu tượng bút chì để chỉnh sửa.
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
