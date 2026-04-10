import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image,
  Code,
  Minus,
  MessageSquare,
  AlertCircle,
  Table as TableIcon,
  CheckSquare,
} from 'lucide-react';

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  const getIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'heading 1': return <Heading1 size={18} />;
      case 'heading 2': return <Heading2 size={18} />;
      case 'heading 3': return <Heading3 size={18} />;
      case 'text': return <Type size={18} />;
      case 'bullet list': return <List size={18} />;
      case 'numbered list': return <ListOrdered size={18} />;
      case 'blockquote': return <Quote size={18} />;
      case 'image': return <Image size={18} />;
      case 'code': return <Code size={18} />;
      case 'divider': return <Minus size={18} />;
      case 'callout': return <AlertCircle size={18} />;
      case 'table': return <TableIcon size={18} />;
      case 'checklist': return <CheckSquare size={18} />;
      default: return <Type size={18} />;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[280px] animate-in fade-in zoom-in duration-200 p-2">
      <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 rounded-lg mb-2">
         Chèn nội dung
      </div>
      <div className="flex flex-col gap-0.5">
        {props.items.length ? (
          props.items.map((item: any, index: number) => (
            <button
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                index === selectedIndex
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              key={index}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div
                className={`p-1.5 rounded-md ${
                  index === selectedIndex
                    ? 'bg-white/20'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}
              >
                {getIcon(item.title)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  {item.title}
                </span>
                <span
                  className={`text-[10.5px] mt-0.5 ${
                    index === selectedIndex ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {item.description}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500 italic">
            Không tìm thấy lệnh nào...
          </div>
        )}
      </div>
    </div>
  );
});

CommandList.displayName = 'CommandList';
