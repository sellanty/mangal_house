
import api from "./api";
import type { AuthResponse } from "../types/auth.types";

export type ProfileUser = NonNullable<AuthResponse["user"]>;

type ProfileResponse = {
  success: boolean;
  user: ProfileUser;
  message?: string;
};

export type UpdateProfileData = {
  name: string;
  address: string;
};

export const getProfile = async (): Promise<ProfileUser> => {
  const { data } = await api.get<ProfileResponse>("/auth/me");

  return data.user;
};

export const updateProfile = async (
  values: UpdateProfileData
): Promise<ProfileUser> => {
  const { data } = await api.patch<ProfileResponse>(
    "/auth/me",
    values
  );

  return data.user;
};
