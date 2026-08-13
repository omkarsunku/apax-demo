import { baseAPI } from './base.api';

export interface LoginResponse {
  token: string;
  user: { _id: string; name: string; email: string; role: string };
}

export const loginApi = (data: { email: string; password: string }) => (
  baseAPI<LoginResponse>('/login', 'POST', data)
)
