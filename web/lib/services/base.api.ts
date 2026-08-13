const baseUrl = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const baseAPI = async <T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await fetch(`${baseUrl}/user${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data: unknown;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error('Invalid JSON response from server');
    }

    const responseData = data as Partial<ApiResponse> | null;

    if (!res.ok) {
      throw new Error(responseData?.message || `Request failed with status ${res.status}`);
    }
    return {
      success: true,
      message: responseData?.message ?? 'Request successful',
      data: (responseData?.data ?? responseData) as T,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong';

    return {
      success: false,
      message,
    };
  }
};
