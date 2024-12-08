import { apiClient } from "./client";
import { Project, User, AttendanceDashboard } from "./types";

export const adminApi = {
  // 관리자의 프로젝트 목록 조회
  getManagedProjects: (managerId: string) => {
    return apiClient.get<Project[]>(`/api/users/${managerId}/managed-projects`);
  },

  searchUsers: (userId: string) => {
    return apiClient.get<User[]>(`/api/users?type=all`);
    // return apiClient.get<User[]>(`/api/users/${userId}/managed-users`);
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
    return apiClient.put<Project>(`/api/projects/${projectId}`, data);
  },

  // 프로젝트 삭제
  deleteProject: (projectId: string) => {
    return apiClient.delete<void>(`/api/projects/${projectId}`);
  },

  createUser: (data: { name: string; phoneNumber: string; cost: number; role: string }) => {
    return apiClient.post<User>('/api/users/register', data);
  },
  
  // 대시보드 조회
  getAttendanceDashboard: (type: 'DAILY', startDate: string, endDate: string) => {
    return apiClient.get<AttendanceDashboard[]>(`/api/dashboards/projects?type=${type}&startDate=${startDate}&endDate=${endDate}`);
  },
};
