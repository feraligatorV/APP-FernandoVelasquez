export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  email: string;
  birthDate: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  shippingAddress: string;
  birthDate: string;
}
