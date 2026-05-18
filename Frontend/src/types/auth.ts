export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  shippingAddress: string;
  email: string;
  birthDate: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken: string | null;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
