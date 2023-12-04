import { FastifyRequest } from "fastify";

export type LoginRequest = FastifyRequest<{
  Body: {
    username: string;
    password: string;
    isRemember: boolean;
  };
}>;

export type RegisterRequest = FastifyRequest<{
  Body: {
    username: string;
    password: string;
    email: string;
  };
}>;

export type ForgotPasswordRequest = FastifyRequest<{
  Body: {
    email: string;
  };
}>;

export type ResetPasswordRequest = FastifyRequest<{
  Body: {
    jwtResetPass: string;
    password: string;
  };
}>;

export type RefreshRequest = FastifyRequest<{
  Body: {
    jwtRefesh: string;
  };
}>;
