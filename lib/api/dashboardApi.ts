import { API_ENDPOINTS } from "../constants/api";
import { http } from "./http";
import type { ApiResponse, DashboardOverview } from "../types";

export const dashboardApi = {
  /**
   * Get aggregated admin dashboard overview stats
   */
  getOverview: () => {
    return http.get<ApiResponse<{ overview: DashboardOverview }>>(
      API_ENDPOINTS.DASHBOARD_OVERVIEW
    );
  },
};
