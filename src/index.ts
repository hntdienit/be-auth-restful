import { FastifyInstance, FastifyServerOptions } from "fastify";
import { envLib } from "@lib/env";
import App from "@/app";

function init() {
  const options: FastifyServerOptions = {
    logger: true,
  };

  const app: FastifyInstance = App(options);
  return app;
}

if (require.main === module) {
  const PORT: string | number = +envLib.port;
  init().listen({ port: PORT }, (err) => {
    if (err) console.error(err);
    console.log(`server listening on ${PORT}`);
  });
}

export default init;
