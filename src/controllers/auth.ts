import { FastifyReply, FastifyRequest } from "fastify";

import {
  ForgotPasswordRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/controllers/auth.js";
import * as authService from "@/services/auth"

export const handleLogin = async (req: LoginRequest, reply: FastifyReply) => {
  return authService.login(req, reply);
};

export const handleSignup = async (req: RegisterRequest, reply: FastifyReply) => {
  return authService.signup(req, reply);
};

export const handleLogout = async (req: FastifyRequest, reply: FastifyReply) => {
  return authService.logout(req, reply);
};

export const handleForgotPassword = async (req: ForgotPasswordRequest, reply: FastifyReply) => {
  return authService.forgotPassword(req, reply);
};

export const handleResetPassword = async (req: ResetPasswordRequest, reply: FastifyReply) => {
  return authService.resetPassword(req, reply);
};

export const handleRefresh = async (req: RefreshRequest, reply: FastifyReply) => {
  return authService.refresh(req, reply);
};

export default {
  handleLogin,
  handleSignup,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
  handleRefresh,
};
