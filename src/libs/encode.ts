import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envLib } from "./env";
import { tokenEnum } from "@/constants/enum";

export const createToken = (user: any, tokenKey?: tokenEnum): string => {
  if (tokenKey === tokenEnum.RefreshToken) {
    const token = jwt.sign({}, envLib.jwt.refreshToken as string, {
      expiresIn: 3600 * +envLib.jwt.refreshTokenExpiresin,
      audience: String(user.id),
    });
    return token;
  }

  if (tokenKey === tokenEnum.ResetPasswordToken) {
    const token = jwt.sign({}, envLib.jwt.resetPasswordToken as string, {
      expiresIn: 3600 * +envLib.jwt.resetPasswordTokenExpiresin,
      audience: String(user.id),
    });
    return token;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      name: user.username,
      email: user.email,
      iat: 3600 * +envLib.jwt.accessTokenExpiresin,
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["user", "admin"],
        "x-hasura-default-role": user.is_admin ? "admin" : "user",
        "x-hasura-user-id": `${user.id}`,
      },
    },
    envLib.jwt.accessToken as string
  );
  return token;
};

export const compareString = async (string: string, hash: string): Promise<boolean> => {
  const token = await bcrypt.compare(string, hash);
  return token;
};

export const hashString = async (string: string): Promise<string> => {
  const token = await bcrypt.hash(string, 10);
  return token;
};
