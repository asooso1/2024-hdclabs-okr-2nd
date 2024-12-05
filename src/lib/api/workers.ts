import { OptionUser, ProjectResult } from './types';
import { apiClient } from "./client";

export const userApi = {
  getUser: (userId: string) => {
    return apiClient.get<OptionUser>(`/api/users/${userId}`);
  },

  // 작업 결과 올리기
  projectResult: (projectId: string, data: ProjectResult, images: File[]) => {
    const formData = new FormData();
    const dataBlob = new Blob([JSON.stringify(data)], {
      type: 'application/json'
    });
    formData.append('data', dataBlob);
    
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    return apiClient.postFormData<ProjectResult>(`/api/projects/${projectId}?type=result`, formData);
  }
}