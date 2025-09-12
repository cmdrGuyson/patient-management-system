export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface JwtUser {
  userId: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}
