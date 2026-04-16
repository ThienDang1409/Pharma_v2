import { dashboardApi } from "@/lib/api";

export interface AdminOverview {
  totalCategories: number;
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalImages: number;
  unusedImages: number;
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const response = await dashboardApi.getOverview();
    const overview = response.data?.overview;

    return {
      totalCategories: overview?.totalCategories || 0,
      totalBlogs: overview?.totalBlogs || 0,
      publishedBlogs: overview?.publishedBlogs || 0,
      draftBlogs: overview?.draftBlogs || 0,
      totalImages: overview?.totalImages || 0,
      unusedImages: overview?.unusedImages || 0,
    };
  },
};
