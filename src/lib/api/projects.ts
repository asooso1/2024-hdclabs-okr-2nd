import { apiClient } from "./client";
import { Project, WorkResult } from "./types";

export const projectApi = {
  // 관리자의 프로젝트 목록 조회
  getManagedProjects: (userId: string) => {
    return apiClient.get<Project[]>(`/api/users/${userId}/managed-projects`);
  },

  // 프로젝트 상세 조회
  getProject: (userId: string, projectId: string) => {
    return apiClient.get<Project>(
      `/api/users/${userId}/allocated-project/${projectId}`,
    );
  },

  // 프로젝트 생성
  createProject: (data: Partial<Project>) => {
    return apiClient.post<Project>("/api/projects", data);
  },

  // 프로젝트 수정
  updateProject: async (projectId: string, projectData: any) => {
    const response = await apiClient.put(
      `/api/projects/${projectId}`,
      projectData,
    );
    return response;
  },

  // 프로젝트 상세 조회(작업자용)
  getProjectForWorker: (projectId: string) => {
    return apiClient.get<Project>(`/api/projects/${projectId}`);
  },

  // 작업자용 프로젝트 목록 조회
  getWorkerProjects: (userId: string) => {
    return apiClient.get<WorkResult>(`/api/users/${userId}`);
  },
  // 작업 수락
  acceptProject: (
    projectId: string,
    data: { userId: string; schedules: string[] },
  ) => {
    return apiClient.post(`/api/projects/${projectId}?type=accept`, data);
  },

  // 작업 결과 올리기
  uploadWorkResult: (projectId: string, data: any) => {
    return apiClient.post(`/api/projects/${projectId}?type=result`, data);
  },
};
