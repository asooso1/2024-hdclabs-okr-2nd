import { User } from './types';
import { apiClient } from "./client";

export const userApi = {
  getUser: (userId: string) => {
    return apiClient.get<User>(`/api/users/${userId}`);
  }
}