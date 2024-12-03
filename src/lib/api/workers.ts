import { OptionUser, ProjectResult } from './types';
import { apiClient } from "./client";

export const userApi = {
  getUser: (userId: string) => {
    return apiClient.get<OptionUser>(`/api/users/${userId}`);
  },

  // 작업 결과 올리기
  projectResult: (projectId: string, data: ProjectResult, images: File[]) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    return apiClient.post<ProjectResult>(`/api/projects/${projectId}?type=${data.type}`, formData);
  }
}