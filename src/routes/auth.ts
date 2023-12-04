import { FastifyInstance } from "fastify";
import * as authController from "@/controllers/auth";
import { verifyToken } from "../middlewares/auth";

const authRouter = async (app: FastifyInstance) => {
  app.post("/login", authController.handleLogin);
  app.post("/signup", authController.handleSignup);
  app.post("/logout", { preHandler: verifyToken }, authController.handleLogout);
  app.post("/forgot-password", authController.handleForgotPassword);
  app.post("/reset-password", authController.handleResetPassword);
  app.post("/refresh", authController.handleRefresh);
};

export default authRouter;
