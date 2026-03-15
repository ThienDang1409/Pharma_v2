import { blogApi, informationApi } from "@/lib/api";

export interface AdminOverview {
  totalBlogs: number;
  totalPublishedBlogs: number;
  totalDraftBlogs: number;
  totalCategories: number;
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const [blogsResponse, categoriesResponse] = await Promise.all([
      blogApi.getAll({ page: 1, limit: 1_000 }),
      informationApi.getAll({ page: 1, limit: 1_000 }),
    ]);

    const blogs = blogsResponse.data?.items ?? [];
    const totalBlogs = blogsResponse.data?.total ?? 0;
    const totalCategories = categoriesResponse.data?.total ?? 0;

    const published = blogs.filter((item) => item.status === "published").length;
    const draft = blogs.filter((item) => item.status === "draft").length;

    return {
      totalBlogs,
      totalPublishedBlogs: published,
      totalDraftBlogs: draft,
      totalCategories,
    };
  },
};
