interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  isFormData?: boolean;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data: any;

  constructor(status: number, statusText: string, data: any) {
    super(`API Error: ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;

    // TypeScript에서 Error 클래스를 상속할 때
    // 인스턴스의 prototype을 명시적으로 설정하는 것이 권장됩니다.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiClient {
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

    // FormData 요청의 경우 전달된 headers를 그대로 사용
    const headers = isFormData
      ? init.headers
      : {
          "Content-Type": "application/json",
          ...init.headers,
        };

    try {
      const response = await fetch(url, {
        ...init,
        headers,
      });

      if (!response.ok) {
        // 응답의 JSON을 파싱하여 에러 정보를 담는다.
        const errorData = await response.json().catch(() => null);
        // JSON 파싱 실패 시 null로 처리

        throw new ApiError(response.status, response.statusText, errorData);
      }

      return await response.json();
    } catch (error) {
      // console.log((error as ApiError).data.message)
      // console.error("API request failed:", error);
      throw error as ApiError;
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
        Accept: "application/json",
      },
      isFormData: true,
    });
  }
}

export const apiClient = new ApiClient();
