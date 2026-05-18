import { http } from "./http";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from "../types/auth";

export const authApi = {
  login: (payload: LoginRequest) =>
    http<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  register: (payload: RegisterRequest) =>
    http<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    http<ForgotPasswordResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  resetPassword: (payload: ResetPasswordRequest) =>
    http<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
