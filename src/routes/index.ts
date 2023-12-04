import { FastifyInstance } from "fastify";
import authRouter from "./auth.js";

const routes: any = [
  { route: authRouter, prefix: "/auth" },
  {
    route: async (app: FastifyInstance) => {
      app.get("/", async () => "----- Server Run -----");
    },
    prefix: "/",
  },
];

export default routes;
