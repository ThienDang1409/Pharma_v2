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
    title: "Làm quen với hệ thống",
    description: "Bắt đầu hành trình của bạn với những kiến thức cơ bản về giao diện, đăng nhập và các tính năng cốt lõi.",
    icon: <Zap className="text-orange-500" size={24} />,
    color: "bg-orange-50",
    link: "#setup"
  },
  {
    title: "Quản lý bài viết",
    description: "Quy trình biên tập, kiểm duyệt và xuất bản nội dung chuyên nghiệp với trình soạn thảo Tiptap.",
    icon: <FileText className="text-blue-500" size={24} />,
    color: "bg-blue-50",
    link: "#blogs"
  },
  {
    title: "Quản lý hình ảnh",
    description: "Hướng dẫn tối ưu hóa dung lượng và quản lý thư viện đa phương tiện hiệu quả.",
    icon: <ImageIcon className="text-purple-500" size={24} />,
    color: "bg-purple-50",
    link: "#images"
  },
  {
    title: "Quản lý danh mục",
    description: "Cấu trúc hóa dữ liệu và phân loại nội dung một cách khoa học để cải thiện trải nghiệm người dùng.",
    icon: <FolderTree className="text-green-500" size={24} />,
    color: "bg-green-50",
    link: "#categories"
  }
];

const faqs = [
  {
    question: "Làm thế nào để khôi phục mật khẩu admin?",
    answer: "Bạn có thể truy cập trang đăng nhập và chọn 'Quên mật khẩu'. Hệ thống sẽ gửi một liên kết xác nhận đến email đã đăng ký của bạn. Hãy làm theo hướng dẫn trong email để đặt lại mật khẩu mới."
  },
  {
    question: "Làm cách nào để thay đổi vai trò của người dùng?",
    answer: "Truy cập mục Cài đặt hệ thống > Quản lý người dùng. Tại đây bạn có thể chọn người dùng muốn chỉnh sửa và thay đổi phân quyền giữa 'Admin' hoặc 'Editor'."
  },
  {
    question: "Kích thước hình ảnh tối ưu cho bài viết là bao nhiêu?",
    answer: "Chúng tôi khuyến khích sử dụng hình ảnh có tỷ lệ 16:9, độ phân giải tối thiểu 1200x675px. Hệ thống sẽ tự động nén và resize qua Cloudinary để đảm bảo tốc độ tải trang."
  },
  {
    question: "Làm thế nào để xuất báo cáo hoạt động hàng tháng?",
    answer: "Tại Dashboard, bạn sẽ thấy nút 'Xuất báo cáo' ở góc trên bên phải. Bạn có thể chọn khoảng thời gian và định dạng tệp (PDF/Excel) mong muốn."
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Chào mừng đến với <br /> <span className="text-primary-300">Trung tâm Hỗ trợ</span>
            </h1>
            <p className="text-primary-100/70 max-w-2xl mx-auto text-sm md:text-base font-medium">
              Khám phá các hướng dẫn chi tiết và tài liệu kỹ thuật để tối ưu hóa quy trình quản lý hệ thống Pharma của bạn.
            </p>
          </div>

          <div className="w-full max-w-2xl relative group">
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
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div 
            key={idx} 
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
          </div>
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
              <article id="categories" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">01</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Quản lý Danh mục (Information)</h4>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Hệ thống danh mục được thiết kế theo dạng cây (Tree structure). Bạn có thể tạo vô số cấp độ con để tổ chức bài viết.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-green-500" /> Chức năng thêm mới
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium">Click "Danh mục gốc mới" hoặc biểu tượng "+" trên card để tạo danh mục con. Yêu cầu ảnh đại diện và tên song ngữ.</p>
                    </li>
                    <li className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Settings size={12} className="text-blue-500" /> Sắp xếp (D&D)
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium">Kéo thả icon 6 chấm để sắp xếp thứ tự hiển thị của các danh mục trong cùng một cấp độ.</p>
                    </li>
                  </ul>
                </div>
              </article>

              <article id="blogs" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">02</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Quản lý Bài viết (Blogs)</h4>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Trình soạn thảo hiện đại hỗ trợ WYSIWYG, kéo thả hình ảnh và quản lý SEO mạnh mẽ.
                  </p>
                  <div className="p-6 bg-primary-50/50 rounded-3xl border border-primary-100 border-dashed">
                    <h5 className="text-xs font-black text-primary-900 uppercase tracking-tight mb-2">Editor Slash Commands</h5>
                    <p className="text-[10px] text-primary-700/70 font-medium mb-4">Gõ "/" trong trình soạn thảo để mở menu công cụ nhanh: Chèn bảng, chèn ảnh, tiêu đề, danh sách...</p>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black border border-primary-200">TỰ ĐỘNG DỊCH (GEMINI AI)</span>
                       <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black border border-primary-200">MEDIA PICKER</span>
                    </div>
                  </div>
                </div>
              </article>

              <article id="images" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-black">03</span>
                  <h4 className="text-lg font-black uppercase text-gray-900 tracking-tight">Thư viện Hình ảnh (Images)</h4>
                </div>
                <div className="pl-11 space-y-4 text-sm text-gray-500 leading-relaxed font-medium">
                  <p>Mọi hình ảnh khi tải lên đều được lưu trữ trên Cloudinary. Bạn có thể:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Gắn thẻ (Tags)", "Lọc theo thực thể", "Tự động nén", "Theo dõi tham chiếu"].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-600 uppercase border border-gray-200">{tag}</span>
                    ))}
                  </div>
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
              {faqs.map((faq, idx) => (
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
