import { apiClient } from "./client";

interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authApi = {
  signIn: (data: SignInRequest) => {
    return apiClient.post<SignInResponse>("/auth/signin", data);
  },

  signOut: () => {
    return apiClient.post("/auth/signout");
  },

  // 다른 인증 관련 API 함수들...
};
