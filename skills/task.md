# SEO Implementation Checklist

## 1) Mục tiêu

- [ ] Tăng khả năng crawl/index của toàn bộ trang public.
- [ ] Chuẩn hóa metadata và structured data theo từng loại trang.
- [ ] Nâng điểm chất lượng SEO kỹ thuật trước khi mở rộng content/off-page.

## 2) Quy ước thực thi

- [ ] Mỗi task phải có owner, deadline, và trạng thái rõ ràng.
- [ ] Mọi thay đổi SEO phải có kiểm tra lint/build trước khi merge.
- [ ] Không merge khi chưa cập nhật checklist trạng thái tương ứng.

## 3) Definition Of Done

- [ ] Route liên quan build pass và không có lỗi TS/ESLint.
- [ ] Có xác nhận canonical/noindex/schema hoạt động trên môi trường dev.
- [ ] Có ghi chú kiểm thử và bằng chứng (URL kiểm tra hoặc ảnh chụp).

## 4) P0 - Bắt buộc, làm trước

### P0.1 Crawl & Index Foundation

- [x] Tạo robots.txt chuẩn App Router.
- [x] Tạo sitemap.xml động cho route tĩnh + blog + category.
- [x] Chặn index các route không phục vụ SEO (search/auth/admin/profile).
- [x] Khai báo host/sitemap trong robots.

### P0.2 Metadata Theo Từng Trang

- [x] Có metadata/canonical riêng cho home.
- [x] Có metadata/canonical riêng cho blog list.
- [x] Có metadata/canonical riêng cho blog detail.
- [x] Có metadata/canonical riêng cho category detail.
- [x] Có metadata/canonical riêng cho events.
- [x] Search đặt noindex.

### P0.3 Heading Semantics

- [x] Sửa lỗi 2 H1 tại blog detail, đảm bảo 1 H1/trang.
- [ ] Rà soát thêm H2/H3 toàn bộ route public.

### P0.4 Structured Data Cơ Bản

- [x] Thêm Organization JSON-LD site-wide.
- [x] Thêm Article JSON-LD cho blog detail.
- [x] Bổ sung Breadcrumb JSON-LD cho blog/category detail.
- [x] Bổ sung Product JSON-LD cho bài dạng sản phẩm.

### P0.5 Metadata Đa Ngôn Ngữ (vi/en)

- [x] Tạo nguồn language server-side bằng cookie.
- [x] Đồng bộ language client -> cookie/localStorage/html lang.
- [x] Metadata title/description/og đổi theo language hiện tại.
- [x] OpenGraph locale/alternateLocale theo vi/en.

### P0.6 Kiểm tra kỹ thuật sau triển khai

- [x] Lint pass.
- [x] Build production pass.
- [ ] Kiểm tra robots/sitemap thực tế trên môi trường staging.
- [ ] Kiểm tra snippet metadata/schema bằng Rich Results Test.

## 5) P1 - Quan trọng, làm ngay sau P0

### P1.1 Core Web Vitals

- [ ] Đo LCP/CLS/INP cho URL chính bằng Lighthouse mobile + PSI.
- [ ] Tối ưu theo số liệu thực tế (không tối ưu cảm tính).
- [ ] Thiết lập cảnh báo tránh regress CWV.

### P1.2 Internal Linking & Content Structure

- [ ] Tăng liên kết chéo blog <-> sản phẩm theo anchor có ngữ nghĩa.
- [ ] Chuẩn hóa intro paragraph chứa keyword chính một cách tự nhiên.
- [ ] Tối ưu phân trang/category để giảm duplicate content.

### P1.3 Search Console & Analytics

- [ ] Gắn xác minh GSC.
- [ ] Submit sitemap lên GSC.
- [ ] Gắn GA4 và chuẩn hóa event cơ bản (ưu tiên cao khi quay lại SEO).

## 6) P2 - Mở rộng

### P2.1 Off-page SEO

- [ ] Lập danh sách nguồn backlink chất lượng theo ngành.
- [ ] Xây quy trình phân phối social cho bài mới.

### P2.2 Content Scale

- [ ] Xây cụm chủ đề long-tail theo từng nhóm sản phẩm.
- [ ] Lập lịch xuất bản theo cụm và intent tìm kiếm.

### P2.3 Rich Result Nâng Cao

- [ ] FAQ schema cho trang phù hợp.
- [ ] Review schema chỉ khi có dữ liệu thật và policy hợp lệ.

## 7) Trình tự thực thi khuyến nghị

- [ ] Chốt toàn bộ P0.1 -> P0.6.
- [ ] Đo CWV, ưu tiên các trang traffic cao.
- [ ] Hoàn tất P1.2 và P1.3.
- [ ] Mở rộng P2 theo nguồn lực content/off-page.

## 8) Trạng thái quyết định hiện tại (2026-04-27)

- [x] Có thể tạm dừng nhánh SEO kỹ thuật để ưu tiên phát triển tính năng sản phẩm.
- [x] Nền tảng SEO cốt lõi đã có: robots, sitemap, metadata theo route, canonical/noindex, structured data chính.
- [ ] Chưa hoàn tất xác nhận ngoài môi trường dev (staging + Rich Results Test).
- [ ] Chưa triển khai analytics/search console (GA4, GSC).

## 9) Điều kiện quay lại SEO (Resume Trigger)

- [ ] Release tính năng lớn mới lên staging hoặc production.
- [ ] Có thay đổi cấu trúc URL, layout, hoặc điều hướng chính.
- [ ] Lưu lượng organic bắt đầu tăng và cần đo lường conversion theo kênh SEO.

## 10) Backlog tối thiểu cần chốt khi quay lại

- [ ] Hoàn tất P0.6: kiểm tra robots/sitemap trên staging và Rich Results Test.
- [ ] Rà soát thêm H2/H3 trên toàn bộ route public (P0.3 còn thiếu).
- [ ] Hoàn tất P1.3: GSC verify + submit sitemap + GA4 events cơ bản.
- [ ] Đo baseline CWV cho các URL chính trước khi tối ưu sâu.

## 11) Runbook quay lại SEO (chi tiết, 1 buổi 2-3 giờ)

### 11.1 Chuẩn bị trước khi chạy (10-15 phút)

- [ ] Xác nhận URL staging chính thức và đảm bảo robots/sitemap có thể truy cập public.
- [ ] Chuẩn bị 3 URL mẫu để test schema:
	- [ ] 1 URL blog detail thường (Article).
	- [ ] 1 URL blog detail dạng product (Article + Product).
	- [ ] 1 URL category detail (Breadcrumb).
- [ ] Xác nhận có quyền truy cập Search Console và GA4 của domain.

### 11.2 Sprint A - Chốt P0.6 kỹ thuật (35-45 phút)

- [ ] Kiểm tra robots trên staging:
	- [ ] Có `Allow: /`.
	- [ ] Có `Disallow` cho `/admin`, `/auth`, `/profile`.
	- [ ] Có `Sitemap` trỏ đúng domain staging/production mong muốn.
- [ ] Kiểm tra sitemap trên staging:
	- [ ] Có route tĩnh: `/`, `/blog`, `/events`.
	- [ ] Có route động: `/blog/[slug]`, `/category/[slug]` (không rỗng bất thường).
	- [ ] Không có URL trùng lặp rõ ràng.
- [ ] Kiểm tra metadata/noindex:
	- [ ] `/search` có `noindex`.
	- [ ] Blog/category detail có canonical hợp lệ.
	- [ ] `html lang` phản ánh đúng ngôn ngữ hiện tại (vi/en).

### 11.3 Sprint B - Rich Results validation (30-40 phút)

- [ ] Chạy Rich Results Test cho 3 URL mẫu.
- [ ] Kỳ vọng kết quả:
	- [ ] Blog thường: nhận Article + Breadcrumb.
	- [ ] Blog product: nhận Article + Breadcrumb + Product.
	- [ ] Category detail: nhận Breadcrumb.
- [ ] Lưu bằng chứng:
	- [ ] Link kết quả test hoặc screenshot cho từng URL.
	- [ ] Ghi lại warning/error cần xử lý sau.

### 11.4 Sprint C - GSC + GA4 baseline (45-60 phút)

- [ ] Search Console:
	- [ ] Verify property domain.
	- [ ] Submit sitemap URL chính thức.
	- [ ] Kiểm tra trạng thái crawl ban đầu (không lỗi nghiêm trọng).
- [ ] GA4:
	- [ ] Kết nối measurement ID cho môi trường production.
	- [ ] Chuẩn hóa event baseline:
		- [ ] `page_view` (tự động).
		- [ ] `search` (từ trang search).
		- [ ] `generate_lead` (submit form contact).
		- [ ] `view_item` (xem blog dạng product).
		- [ ] `language_switch` (đổi vi/en).
	- [ ] Xác thực Realtime có dữ liệu nhận đủ event mẫu.

### 11.5 Tiêu chí hoàn tất lần quay lại (DoD rút gọn)

- [ ] P0.6 được tick hoàn toàn.
- [ ] P1.3 được tick hoàn toàn.
- [ ] Có log bằng chứng kiểm thử (URL + ảnh/link kết quả).
- [ ] `npm run lint` và `npm run build` pass sau thay đổi.

## 12) Nhật ký cập nhật

- [x] 2026-04-18: Hoàn thành robots/sitemap, metadata theo route, fix duplicate H1, Organization + Article schema, metadata đa ngôn ngữ theo cookie.
- [x] 2026-04-18: Hoàn thành Breadcrumb JSON-LD cho blog/category detail và Product JSON-LD cho bài product.
- [x] 2026-04-27: Đánh giá lại trạng thái SEO, chốt quyết định có thể tạm dừng để ưu tiên phát triển tính năng; định nghĩa trigger và backlog khi quay lại.
