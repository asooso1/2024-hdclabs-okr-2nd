// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  isFormData?: boolean;
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
    const { params, isFormData, ...init } = config;

    // URL 파라미터 처리
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    const url = `${endpoint}${queryString}`;

    try {
      // FormData 요청의 경우 전달된 headers를 그대로 사용
      const headers = isFormData
        ? init.headers  // FormData 요청의 경우 전달된 headers만 사용
        : {
            "Content-Type": "application/json",
            ...init.headers,
          };

      const response = await fetch(url, {
        ...init,
        headers,
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
  public patch<T>(endpoint: string, data?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  public delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  public postFormData<T>(endpoint: string, formData: FormData) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: formData,
      headers: {
        'Accept': 'application/json'
      },
      isFormData: true
    });
  }
}

export const apiClient = new ApiClient();
