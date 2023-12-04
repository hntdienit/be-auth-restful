import axios from "axios";
import { envLib } from "./env";

const request = axios.create({
  baseURL: envLib.hasura.api,
  withCredentials: true,
  headers: {
    "x-hasura-admin-secret": envLib.hasura.secret_admin_key,
  },
});

export default request;
