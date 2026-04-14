"use client";

import { useState } from "react";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  FolderTree, 
  Settings, 
  ChevronDown, 
  MessageCircle, 
  Sparkles,
  Zap,
  ShieldCheck,
  PlayCircle
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "Khởi động cho người mới",
    description: "Checklist 15 phút đầu: cần nhập gì trước, thao tác nào bắt buộc, và thứ tự làm nhanh nhất.",
    icon: <Zap className="text-orange-500" size={24} />,
    color: "bg-orange-50",
    link: "#setup"
  },
  {
    title: "Soạn & xuất bản bài viết",
    description: "Hướng dẫn đi từ bản nháp đến xuất bản an toàn, gồm mode editor và quy tắc trước khi bấm Publish.",
    icon: <FileText className="text-blue-500" size={24} />,
    color: "bg-blue-50",
    link: "#blogs"
  },
  {
    title: "Tiện ích editor & media",
    description: "Slash command, dịch tự động, media picker, bảng biểu và các mẹo để soạn nội dung nhanh hơn.",
    icon: <ImageIcon className="text-purple-500" size={24} />,
    color: "bg-purple-50",
    link: "#tools"
  },
  {
    title: "Danh mục & bài Legal",
    description: "Vị trí sửa bài legal, cách tìm đúng danh mục pháp lý, và lưu ý tránh sai link trang policy.",
    icon: <FolderTree className="text-green-500" size={24} />,
    color: "bg-green-50",
    link: "#legal"
  }
];

const faqs = [
  {
    question: "Người mới cần nhập tối thiểu những gì để lưu bài?",
    answer: "Tối thiểu bạn nên có: tiêu đề, tác giả, danh mục, ảnh đại diện và ít nhất 1 section có nội dung. Slug có thể tự sinh từ tiêu đề nhưng vẫn cần kiểm tra lại trước khi publish."
  },
  {
    question: "Có thể dùng tiện ích gì để viết bài nhanh hơn?",
    answer: "Trong editor, gõ '/' để mở menu công cụ nhanh (heading, list, table, image...). Bạn có thể dùng dịch tự động VI <-> EN, media picker, và mode Edit/Preview/Split theo từng section để kiểm tra bố cục ngay khi soạn."
  },
  {
    question: "Muốn sửa bài Legal thì vào đâu?",
    answer: "Vào Danh mục (Information), tìm nhánh Legal/Pháp lý, xác nhận đúng danh mục con rồi mở danh sách bài tương ứng để chỉnh sửa. Khi sửa policy, hạn chế đổi slug nếu trang đang được liên kết ở footer/public."
  },
  {
    question: "Khi nào nên bấm Publish thay vì Draft?",
    answer: "Chỉ publish khi đã rà đủ: nội dung song ngữ chính, ảnh hiển thị đúng, link không lỗi, và preview không vỡ layout. Nếu còn chờ duyệt hoặc thiếu bản dịch, nên để Draft."
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = categories.filter((cat) => {
    if (!normalizedQuery) return true;
    return (`${cat.title} ${cat.description}`).toLowerCase().includes(normalizedQuery);
  });

  const filteredFaqs = faqs.filter((faq) => {
    if (!normalizedQuery) return true;
    return (`${faq.question} ${faq.answer}`).toLowerCase().includes(normalizedQuery);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-primary-900 p-12 md:p-20 text-white shadow-2xl shadow-primary-900/20">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Support Portal v2.0</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-normal">
              Chào mừng đến với <br /> <span className="text-primary-300">Trung tâm Hỗ trợ</span>
            </h1>
            <p className="text-primary-100/70 max-w-2xl mx-auto text-sm md:text-base font-medium">
              Khám phá các hướng dẫn chi tiết và tài liệu kỹ thuật để tối ưu hóa quy trình quản lý hệ thống Pharma của bạn.
            </p>
          </div>

          {/* <div className="w-full max-w-2xl relative group">
            <div className="absolute inset-0 bg-white/20 blur-xl group-focus-within:bg-primary-400/30 transition-all rounded-3xl" />
            <div className="relative flex items-center bg-white rounded-3xl p-2 shadow-inner">
              <div className="pl-6 pr-4 text-gray-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm hướng dẫn..." 
                className="flex-1 bg-transparent py-4 text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="px-8 py-4 bg-primary-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg active:scale-95">
                Tìm kiếm
              </button>
            </div>
          </div> */}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((cat, idx) => (
          <a
            key={idx} 
            href={cat.link}
            className="group admin-card p-8 border border-gray-100 hover:border-primary-900/20 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full rounded-[32px]"
          >
            <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-3 group-hover:text-primary-900 transition-colors uppercase">
              {cat.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 flex-1">
              {cat.description}
            </p>
            <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary-900 uppercase tracking-widest group-hover:gap-4 transition-all">
              Khám phá <PlayCircle size={14} />
            </div>
          </a>
        ))}
      </section>

      {/* Main content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Detailed Guides Section */}
          <div className="admin-card p-10 border border-gray-100 rounded-[40px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-900 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Hướng dẫn Chi tiết</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tài liệu vận hành thực thể</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <article id="setup" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">01</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Người mới bắt đầu trong 15 phút</h4>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Làm theo thứ tự này để bắt đầu nhanh và tránh thiếu dữ liệu khi xuất bản bài đầu tiên.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-green-500" /> Bước 1 - Tạo cấu trúc danh mục
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium">Vào Information, tạo danh mục gốc và danh mục con trước khi viết bài để tránh phải đổi lại category hàng loạt.</p>
                    </li>
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Settings size={12} className="text-blue-500" /> Bước 2 - Điền thông tin bài cơ bản
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium">Các trường cần có trước khi publish: Tiêu đề, Tác giả, Danh mục, Ảnh đại diện, và tối thiểu 1 section có nội dung.</p>
                    </li>
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <FileText size={12} className="text-indigo-500" /> Bước 3 - Kiểm tra slug và preview
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium">Slug có thể tự sinh từ tiêu đề nhưng cần kiểm tra thủ công. Dùng Preview để rà bố cục mobile và desktop trước khi xuất bản.</p>
                    </li>
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Zap size={12} className="text-orange-500" /> Bước 4 - Xuất bản an toàn
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium">Nếu còn thiếu bản dịch hoặc chưa được duyệt, lưu Draft. Chỉ chọn Publish khi nội dung và link đã kiểm tra đầy đủ.</p>
                    </li>
                  </ul>
                </div>
              </article>

              <article id="blogs" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">02</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Soạn và quản lý bài viết chuẩn quy trình</h4>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Mỗi section có thể chỉnh ở mode Edit/Preview/Split. Hãy chia nội dung thành section nhỏ để dễ kiểm soát bản dịch và bố cục.
                  </p>
                  <div className="p-6 bg-primary-50/50 rounded-3xl border border-primary-100 border-dashed">
                    <h5 className="text-xs font-black text-primary-900 uppercase tracking-tight mb-2">Checklist trước khi Publish</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Đã chọn đúng danh mục",
                        "Ảnh đại diện hiển thị đúng",
                        "Section đầu có nội dung thực",
                        "Slug dễ đọc và không sai chính tả",
                        "Nội dung EN/VI đã rà",
                        "Preview desktop + mobile ổn"
                      ].map((item) => (
                        <span key={item} className="px-3 py-2 bg-white rounded-lg text-[10px] font-black border border-primary-200 text-primary-900">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <article id="tools" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">03</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Tiện ích soạn thảo có thể sử dụng</h4>
                </div>
                <div className="pl-11 space-y-4 text-sm text-gray-500 leading-relaxed font-medium">
                  <p>Những công cụ giúp làm bài nhanh và ít lỗi hơn khi thao tác hàng ngày:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      "Gõ / để mở slash command",
                      "Chèn bảng, ảnh, heading, list nhanh",
                      "Dịch tự động VI <-> EN",
                      "Media picker + upload trực tiếp",
                      "Mode Edit/Preview/Split theo section",
                      "Token RELATED_PRODUCTS / RELATED_ARTICLES"
                    ].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-600 uppercase border border-gray-200">{tag}</span>
                    ))}
                  </div>
                </div>
              </article>

              <article id="legal" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">04</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Sửa bài Legal vào đâu?</h4>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Với nội dung pháp lý (Privacy, Terms, Policy...), luôn đi theo đúng danh mục Legal để tránh sửa nhầm bài thường.
                  </p>
                  <ol className="space-y-3">
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 font-medium">
                      <span className="font-black text-gray-900">Bước 1:</span> Vào <span className="font-black">Information</span>, tìm nhánh danh mục <span className="font-black">Legal / Pháp lý</span>.
                    </li>
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 font-medium">
                      <span className="font-black text-gray-900">Bước 2:</span> Mở đúng danh mục con cần chỉnh (ví dụ privacy, terms...) rồi xác nhận lại tên bài trước khi vào edit.
                    </li>
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 font-medium">
                      <span className="font-black text-gray-900">Bước 3:</span> Chỉnh nội dung tại Blogs, lưu Draft để kiểm tra, sau đó mới Publish.
                    </li>
                    <li className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 text-[11px] text-yellow-800 font-medium">
                      <span className="font-black">Lưu ý quan trọng:</span> Không đổi slug bài legal nếu đường dẫn đang được gắn ở footer/public, trừ khi bạn cập nhật lại toàn bộ link liên quan.
                    </li>
                  </ol>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* FAQ Accordion */}
          <div className="admin-card p-10 border border-gray-100 rounded-[40px] bg-white">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8">Câu hỏi thường gặp</h2>
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-100 last:border-0 pb-4">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left py-2 group"
                  >
                    <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${openFaq === idx ? "text-primary-900" : "text-gray-600 group-hover:text-gray-900"}`}>
                      {faq.question}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-primary-900" : "text-gray-400"}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="mt-2 text-[10px] text-gray-400 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="admin-card p-8 bg-gradient-to-br from-gray-900 to-black text-white rounded-[40px] shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
               <MessageCircle size={120} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <MessageCircle size={24} className="text-primary-300" />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Cần hỗ trợ?</h3>
                   <p className="text-[10px] text-gray-400 font-medium tracking-widest mt-1">ĐỘI NGŨ KỸ THUẬT LUÔN SẴN SÀNG</p>
                </div>
                <button className="w-full py-4 bg-primary-900 hover:bg-white hover:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/50">
                  Liên hệ hỗ trợ kỹ thuật
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-10 border-t border-gray-100 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
        <span>© 2026 Pharma Editorial System</span>
        <div className="flex gap-10">
          <Link href="/admin" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
