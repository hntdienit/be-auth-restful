import { awsLambdaFastify } from "@fastify/aws-lambda";
import init from "..";

const proxy = awsLambdaFastify(init());

export const handler = async (event: any, context: any) => {
  const res = await proxy(event, context);
  return res;
};