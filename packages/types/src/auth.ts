export type AuthUser = {
  id: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SignupBody = {
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};
