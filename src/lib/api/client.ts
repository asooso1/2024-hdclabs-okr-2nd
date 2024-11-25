// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  // private baseUrl: string;

  // constructor(baseUrl: string = API_BASE_URL) {
  //   this.baseUrl = baseUrl;
  // }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const { params, ...init } = config;

    // URL 파라미터 처리
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    const url = `${endpoint}${queryString}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  public get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  public post<T>(endpoint: string, data?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public put<T>(endpoint: string, data?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
