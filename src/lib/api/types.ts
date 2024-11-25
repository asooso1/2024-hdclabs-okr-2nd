// 프로젝트 관련 타입
export interface Project {
  createdAt: string;
  updatedAt: string;
  id: string;
  name: string;
  description: string;
  workType: string;
  address: string;
  latitude: number;
  longitude: number;
  from: string;
  to: string;
  projectStatuses?: [];
}

// 사용자 관련 타입
export interface User {
  id: string;
  role: string;
  snsId: string | null;
  name: string;
  phoneNumber: string;
  cost: number;
  projectIds: string[];
}

// 인증 관련 타입
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: User;
}
