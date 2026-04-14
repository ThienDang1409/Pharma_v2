import React from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LucideIcon,
  ChevronDown,
} from "lucide-react";
/* eslint-disable @typescript-eslint/no-explicit-any */

const icons: Record<string, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
};

const styles: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/50",
  warning: "bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100/50",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100/50",
  error: "bg-rose-50 border-rose-200 text-rose-900 shadow-rose-100/50",
};

const iconStyles: Record<string, string> = {
  info: "text-blue-600 bg-blue-100",
  warning: "text-amber-600 bg-amber-100",
  success: "text-emerald-600 bg-emerald-100",
  error: "text-rose-600 bg-rose-100",
};

export default function CalloutNodeView(props: any) {
  const { node, updateAttributes } = props;
  const type = node.attrs.type || "info";
  const Icon = icons[type] || Info;

  const handleTypeChange = (newType: string) => {
    updateAttributes({ type: newType });
  };

  return (
    <NodeViewWrapper className="callout-wrapper my-6 transition-all duration-200 group">
      <div
        className={`relative flex items-start gap-4 p-5 rounded-xl border-2 shadow-sm transition-all ${styles[type]}`}
      >
        {/* Icon & Selector */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`p-2.5 rounded-lg shadow-inner flex items-center justify-center ${iconStyles[type]}`}
          >
            <Icon size={22} strokeWidth={2.5} />
          </div>
          
          {/* Subtle type selector for admin only */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex flex-col gap-1.5 p-1 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
            {Object.keys(icons).map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`w-4 h-4 rounded-full border border-gray-300 transition-transform hover:scale-125 ${
                  t === 'info' ? 'bg-blue-400' :
                  t === 'warning' ? 'bg-amber-400' :
                  t === 'success' ? 'bg-emerald-400' :
                  'bg-rose-400'
                } ${t === type ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pt-1 min-h-[40px]">
          <NodeViewContent className="prose-sm sm:prose focus:outline-none" />
        </div>

        {/* Dynamic Decoration */}
        <div className={`absolute top-0 right-0 h-full w-1.5 rounded-r-lg opacity-30 ${
           type === 'info' ? 'bg-blue-500' :
           type === 'warning' ? 'bg-amber-500' :
           type === 'success' ? 'bg-emerald-500' :
           'bg-rose-500'
        }`} />
      </div>
    </NodeViewWrapper>
  );
}
