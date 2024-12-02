export interface WorkResult {
  projects?: Project[];
  users?: User[];
}

type ProjectStatus = {
  userId: string;
  userName: string;
  schedule: string;
  before: string | null;
  after: string | null;
  confirmation: string | null;
  status: string;
};
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
  projectStatuses?: ProjectStatus[];
  preferences?: string[];
}

// 사용자 관련 타입
export interface User {
  id: number;
  name: string;
  phoneNumber: string;
  role: "WORKER" | "MANAGER";
  cost: number;
  projectIds: string[];
  snsId: string | null;
}

export interface OptionUser {
  user: {
    id: number;
    name: string;
    phoneNumber: string;
    role: "WORKER" | "MANAGER";
    cost: number;
    projectIds: string[];
    snsId: string | null;
  };
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
