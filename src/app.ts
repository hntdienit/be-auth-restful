import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import routes from "./routes";

const App = (options: FastifyServerOptions) => {
  const app: FastifyInstance = fastify(options);

  app.register(cors, {
    origin: "*",
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  });

  for (let i = 0; i < routes.length; i++) {
    app.register(routes[i].route, { prefix: routes[i].prefix });
  }

  return app;
};
export default App;
