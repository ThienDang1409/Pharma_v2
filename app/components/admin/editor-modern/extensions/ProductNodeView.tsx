import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { ShoppingCart, ExternalLink, Trash2 } from "lucide-react";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ProductNodeView(props: any) {
  const { node, deleteNode } = props;
  const { productName, price, image } = node.attrs;

  return (
    <NodeViewWrapper className="product-embed-wrapper my-8 group relative">
      <div className="flex bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all overflow-hidden max-w-2xl mx-auto group">
        {/* Product Image */}
        <div className="w-1/3 aspect-square bg-gray-50 flex items-center justify-center p-4 border-r-2 border-gray-50">
           {image ? (
             <img src={image} alt={productName} className="max-w-full max-h-full object-contain rounded-lg" />
           ) : (
             <div className="w-full h-full bg-primary-50 rounded-xl flex items-center justify-center">
                <ShoppingCart size={40} className="text-primary-200" />
             </div>
           )}
        </div>

        {/* Product Details */}
        <div className="w-2/3 p-6 flex flex-col justify-between">
           <div>
             <div className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">
               Sản phẩm nổi bật
             </div>
             <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
               {productName}
             </h3>
             <div className="text-2xl font-black text-rose-500">
               {price}
             </div>
           </div>

           <div className="flex items-center gap-3 mt-4">
              <button className="flex-1 bg-gray-900 text-white rounded-xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
                <ShoppingCart size={16} />
                Mua ngay
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all">
                 <ExternalLink size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* Delete Overlay for Admin */}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
           onClick={() => deleteNode()}
           className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all transform active:scale-95"
         >
           <Trash2 size={18} />
         </button>
      </div>
    </NodeViewWrapper>
  );
}
