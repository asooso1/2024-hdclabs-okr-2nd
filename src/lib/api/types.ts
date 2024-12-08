export interface WorkResult {
  projects?: Project[];
  users?: User[];
}

// 프로젝트 관련 타입
export interface ProjectStatus {
  userId: string;
  userName: string | null;
  schedule: string;
  before: string | null;
  after: string | null;
  confirmation: string | null;
}

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
  preferences: [];
  projectStatuses: [
    {
      userId?: string;
      userName?: string;
      schedule?: string;
      before?: {
        createdAt?: string;
        updatedAt?: string;
        imageUrls?: string[];
        description?: string;
      } | null;
      after?: {
        createdAt?: string;
        updatedAt?: string;
        imageUrls?: string[];
        description?: string;
      } | null;
      confirmation?: null;
    },
  ];
}

// 사용자 관련 타입
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  cost?: number;
  role: "WORKER" | "MANAGER";
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

export interface ProjectResult {
  division: "BEFORE" | "AFTER" | "CONFIRM";
  userId: string;
  schedule: string;
  description: string;
  latitude: string;
  longitude: string;
}

export interface AttendanceDashboard {
  projectId: string;
  projectName: string;
  users: {
    userId: string;
    userName: string;
    normals: number;
    absents: number;
    details: [
      {
        schedule: string;
        day: string;
        type: string;
        classification: string;
        before: boolean;
        after: boolean;
        confirmation: boolean;
      },
    ];
  }[];
}


export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
