import type { SupportedLanguage } from "@/lib/constants/language";

interface LocalizedText {
  vi: string;
  en: string;
}

const SEO_COPY = {
  homeTitle: {
    vi: "VietAnh Instruments - Từ PharmaTest - Thiết bị kiểm nghiệm giá trị cao",
    en: "VietAnh Instruments - From PharmaTest - High-Value Testing Equipment",
  },
  homeDescription: {
    vi: "Nhà sản xuất thiết bị kiểm nghiệm giá trị cao cho ngành dược phẩm, thực phẩm và mỹ phẩm trên toàn thế giới.",
    en: "Leading manufacturer of high-value testing equipment for the pharmaceutical, food and cosmetics industry worldwide.",
  },
  blogTitle: {
    vi: "Blog & Tin tức | VietAnh Instruments - Từ PharmaTest",
    en: "Blog & News | VietAnh Instruments - From PharmaTest",
  },
  blogDescription: {
    vi: "Khám phá các bài viết chuyên môn, thông báo mới và cập nhật công nghệ từ VietAnh Instruments.",
    en: "Discover expert articles, product updates, and technology insights from VietAnh Instruments.",
  },
  eventsTitle: {
    vi: "Sự kiện | VietAnh Instruments - Từ PharmaTest",
    en: "Events | VietAnh Instruments - From PharmaTest",
  },
  eventsDescription: {
    vi: "Theo dõi lịch hội thảo, triển lãm và các sự kiện nổi bật của VietAnh Instruments tại Việt Nam và quốc tế.",
    en: "Explore upcoming conferences, exhibitions, and major events where VietAnh Instruments is participating.",
  },
  searchTitle: {
    vi: "Tìm kiếm | VietAnh Instruments - Từ PharmaTest",
    en: "Search | VietAnh Instruments - From PharmaTest",
  },
  searchDescription: {
    vi: "Trang kết quả tìm kiếm nội dung trong hệ sinh thái VietAnh Instruments.",
    en: "Search results page for content across the VietAnh Instruments ecosystem.",
  },
  blogNotFoundTitle: {
    vi: "Không tìm thấy bài viết | VietAnh Instruments - Từ PharmaTest",
    en: "Article Not Found | VietAnh Instruments - From PharmaTest",
  },
  blogNotFoundDescription: {
    vi: "Nội dung bạn tìm không còn tồn tại hoặc đã được di chuyển.",
    en: "The article you are looking for no longer exists or has been moved.",
  },
  categoryNotFoundTitle: {
    vi: "Danh mục không tồn tại | VietAnh Instruments - Từ PharmaTest",
    en: "Category Not Found | VietAnh Instruments - From PharmaTest",
  },
  categoryNotFoundDescription: {
    vi: "Danh mục bạn tìm không tồn tại hoặc đã được cập nhật.",
    en: "The category you are looking for does not exist or has been updated.",
  },
  organizationDescription: {
    vi: "Tập đoàn Dược phẩm VietAnh Instruments - Từ PharmaTest - Chất lượng là trách nhiệm.",
    en: "VietAnh Instruments - From PharmaTest - Trusted provider of high-value pharmaceutical testing solutions.",
  },
} as const;

function pickText(language: SupportedLanguage, text: LocalizedText): string {
  return language === "en" ? text.en : text.vi;
}

export function getSeoRouteCopy(language: SupportedLanguage) {
  return {
    homeTitle: pickText(language, SEO_COPY.homeTitle),
    homeDescription: pickText(language, SEO_COPY.homeDescription),
    blogTitle: pickText(language, SEO_COPY.blogTitle),
    blogDescription: pickText(language, SEO_COPY.blogDescription),
    eventsTitle: pickText(language, SEO_COPY.eventsTitle),
    eventsDescription: pickText(language, SEO_COPY.eventsDescription),
    searchTitle: pickText(language, SEO_COPY.searchTitle),
    searchDescription: pickText(language, SEO_COPY.searchDescription),
    blogNotFoundTitle: pickText(language, SEO_COPY.blogNotFoundTitle),
    blogNotFoundDescription: pickText(language, SEO_COPY.blogNotFoundDescription),
    categoryNotFoundTitle: pickText(language, SEO_COPY.categoryNotFoundTitle),
    categoryNotFoundDescription: pickText(language, SEO_COPY.categoryNotFoundDescription),
    organizationDescription: pickText(language, SEO_COPY.organizationDescription),
  };
}
