import { http } from "./http";
import type { UpdateUserProfileRequest, UserProfile } from "../types/user";

export const userApi = {
  me: (token: string) => http<UserProfile>("/api/users/me", { token }),

  updateMe: (token: string, payload: UpdateUserProfileRequest) =>
    http<UserProfile>("/api/users/me", {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    })
};
