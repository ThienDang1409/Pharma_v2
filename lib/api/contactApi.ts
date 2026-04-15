import { API_ENDPOINTS } from "../constants/api";
import { http } from "./http";
import type {
  ApiResponse,
  ContactSubmitResultDto,
  SubmitContactDto,
} from "../types";

export const contactApi = {
  submit: (data: SubmitContactDto) => {
    return http.post<ApiResponse<ContactSubmitResultDto>>(
      API_ENDPOINTS.CONTACT_SUBMIT,
      data
    );
  },
};
