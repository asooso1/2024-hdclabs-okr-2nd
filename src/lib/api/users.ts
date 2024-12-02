import { OptionUser } from './types';
import { apiClient } from "./client";

export const userApi = {
  getUser: (userId: string) => {
    return apiClient.get<OptionUser>(`/api/users/${userId}`);
  }
}