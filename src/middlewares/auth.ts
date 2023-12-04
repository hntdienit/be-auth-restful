import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { envLib } from "@/libs/env";

declare module "fastify" {
  export interface FastifyRequest {
    user: any;
  }
}

export const validateHeadersAuth = (req: FastifyRequest, reply: FastifyReply): string => {
  const header: string | undefined = req.headers.authorization;

  if (!header) {
    reply.status(400).send("not header");
  }
  const accessToken: string = header!.split(" ")[1];  // Bearer
  if (!accessToken) {
    reply.status(400).send("not header");
  }
  return accessToken;
};

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply): Promise<boolean> => {
  try {
    const token = validateHeadersAuth(request, reply);
    const decoded = Object(jwt.verify(token, envLib.jwt.accessToken as string));

    request.user = { id: decoded.sub };

    return true;
  } catch (err) {
    reply.status(400).send(err);
    return false;
  }
};

export default { verifyToken };
