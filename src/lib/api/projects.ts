import { apiClient } from "./client";
import { Project } from "./types";

export const projectApi = {
  // 관리자의 프로젝트 목록 조회
  getManagedProjects: (userId: string) => {
    return apiClient.get<Project[]>(`/api/users/${userId}/managed-projects`);
  },

  // 프로젝트 상세 조회
  getProject: (projectId: string) => {
    return apiClient.get<Project>(`/api/projects/${projectId}`);
  },

  // 프로젝트 생성
  createProject: (data: Partial<Project>) => {
    return apiClient.post<Project>("/api/projects", data);
  },

  // 프로젝트 수정
  updateProject: (projectId: string, data: Partial<Project>) => {
    return apiClient.put<Project>(`/api/projects?type=register`, data);
  },

  // 프로젝트 삭제
  deleteProject: (projectId: string) => {
    return apiClient.delete<void>(`/api/projects/${projectId}`);
  },
};
