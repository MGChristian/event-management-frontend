export const userRoles = {
  ADMIN: "admin",
  USER: "user",
  ORGANIZER: "organizer",
} as const;

export type userRolesType = (typeof userRoles)[keyof typeof userRoles];

export type user = {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  isActive: boolean;
};

export type createUserDTO = {
  name: string;
  email: string;
  password: string;
  role: userRolesType;
  company?: string;
};

export type updateUserDTO = Partial<createUserDTO> & { isActive?: boolean };
