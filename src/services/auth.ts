import { FastifyReply, FastifyRequest } from "fastify";
import {
  MSG_ERR_CREDENTIAL_IS_INCORRECT,
  MSG_ERR_EMAIL_IS_NOT_EXIST,
  MSG_ERR_INVALID_TOKEN,
  MSG_ERR_USER_IS_NOT_EXIST,
  MSG_ERR_USERNAME_WAS_EXIST,
  MSG_LOGIN_SUCCESSFULLY,
  MSG_LOGOUT_SUCCESSFULLY,
  MSG_NEW_TOKEN,
  MSG_REGISTER_SUCCESSFULLY,
  MSG_RESET_PASS_SUCCESSFULLY,
  MSG_SEND_RESET_PASS_EMAIL_SUCCESSFULLY,
} from "../constants/message.js";
import {
  ForgotPasswordRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/controllers/auth.js";
import { tokenEnum } from "../constants/enum.js";
import request from "../libs/request.js";
import { compareString, createToken, hashString } from "../libs/encode.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { envLib } from "@/libs/env.js";
import { resetPassMail } from "@/libs/mails/templates/resetPassword.js";

export const login = async (req: LoginRequest, reply: FastifyReply) => {
  const { username, password, isRemember } = req.body;

  const foundUserQuery = `
    query MyQuery {
      users(where: {username: {_eq: "${username}"}}) {
        id
        email
        is_admin
        password
        username
      }
    }
  `;

  const reqUser = await request.post("", {
    query: foundUserQuery,
  });

  const foundUser = reqUser.data.data.users[0];
  if (!foundUser) {
    reply.status(400).send(MSG_ERR_USER_IS_NOT_EXIST);
    return;
  }

  const isMatch = await compareString(password, foundUser.password);
  if (!isMatch) {
    reply.status(400).send(MSG_ERR_CREDENTIAL_IS_INCORRECT);
    return;
  }

  const accessToken = createToken(foundUser);

  let refreshToken: string = "";
  if (isRemember) {
    refreshToken = createToken(foundUser, tokenEnum.RefreshToken);

    const newRefreshToken = refreshToken.slice(refreshToken.lastIndexOf("."));
    const refreshTokenHash = await hashString(newRefreshToken);

    const UpdateUserMutation = `
      mutation MyMutation {
        update_users_by_pk(pk_columns: {id: "${foundUser.id}"}, _set: {refresh_token: "${refreshTokenHash}"}) {
          id
        }
      }
    `;

    await request.post("", { query: UpdateUserMutation });
  }

  return {
    msg: MSG_LOGIN_SUCCESSFULLY,
    id: foundUser.id,
    username: foundUser.username,
    is_admin: foundUser.is_admin,
    accessToken,
    refreshToken,
  };
};

export const signup = async (req: RegisterRequest, reply: FastifyReply) => {
  const { username, password, email } = req.body;

  const foundUserQuery = `
    query MyQuery {
      users(where: {username: {_eq: "${username}"}}) {
        id
        email
        username
      }
    }
  `;
  const foundUser = await request.post("", {
    query: foundUserQuery,
  });

  if (foundUser.data.data.users.length !== 0) {
    reply.status(400).send(MSG_ERR_USERNAME_WAS_EXIST);
    return;
  }

  const hashPassword = await hashString(password);

  const SignupMutation = `
    mutation MyMutation($object: users_insert_input = {}) {
      insert_users_one(object: $object) {
        id
        email
        username
      }
    }
  `;

  const signup = await request.post("", {
    query: SignupMutation,
    variables: {
      object: {
        id: uuidv4(),
        email,
        username,
        password: hashPassword,
      },
    },
  });
  const resData = signup.data.data.insert_users_one;

  return {
    msg: MSG_REGISTER_SUCCESSFULLY,
    id: resData.id,
    username: resData.username,
  };
};

export const logout = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = req.user.id;

  const foundUserQuery = `
      query MyQuery {
        users_by_pk(id: "${userId}") {
          id
          refresh_token
        }
      }
    `;

  const reqUser = await request.post("", {
    query: foundUserQuery,
  });

  const foundUser = reqUser.data.data.users_by_pk;
  if (!foundUser) {
    reply.status(400).send(MSG_ERR_USER_IS_NOT_EXIST);
    return;
  }

  if (foundUser.refresh_token !== null) {
    const UpdateUserMutation = `
      mutation MyMutation($_set: users_set_input = {}, $pk_columns: users_pk_columns_input = {}) {
        update_users_by_pk(pk_columns: $pk_columns, _set: $_set) {
          id
        }
      }
    `;

    await request.post("", {
      query: UpdateUserMutation,
      variables: {
        pk_columns: {
          id: foundUser.id,
        },
        _set: {
          refresh_token: null,
        },
      },
    });
  }

  return { msg: MSG_LOGOUT_SUCCESSFULLY };
};

export const forgotPassword = async (req: ForgotPasswordRequest, reply: FastifyReply) => {
  const { email } = req.body;

  const foundUserQuery = `
    query MyQuery {
      users(where: {email: {_eq: "${email}"}}) {
        id
        email
        is_admin
        password
        username
      }
    }
  `;

  const reqUser = await request.post("", {
    query: foundUserQuery,
  });

  const foundUser = reqUser.data.data.users[0];
  if (!foundUser) {
    reply.status(400).send(MSG_ERR_EMAIL_IS_NOT_EXIST);
    return;
  }

  const jwtResetToken = createToken(foundUser, tokenEnum.ResetPasswordToken);
  const newjwtResetToken = jwtResetToken.slice(jwtResetToken.lastIndexOf("."));
  const hash = await hashString(newjwtResetToken);

  const UpdateUserMutation = `
    mutation MyMutation {
      update_users_by_pk(pk_columns: {id: "${foundUser.id}"}, _set: {reset_token: "${hash}"}) {
        id
      }
    }
  `;

  await request.post("", { query: UpdateUserMutation });

  resetPassMail({
    email: foundUser.email,
    url: `${envLib.client.host}/reset-password?jwt=${jwtResetToken}`,
  });

  return { msg: MSG_SEND_RESET_PASS_EMAIL_SUCCESSFULLY };
};

export const resetPassword = async (req: ResetPasswordRequest, reply: FastifyReply) => {
  const { jwtResetPass, password } = req.body;

  let verify: any;
  try {
    verify = jwt.verify(jwtResetPass, envLib.jwt.resetPasswordToken as string);
  } catch (err) {
    reply.status(400).send(MSG_ERR_INVALID_TOKEN);
    return;
  }

  const foundUserQuery = `
    query MyQuery {
      users_by_pk(id: "${verify.aud}") {
        id
        reset_token
        email
        is_admin
        username
      }
    }
  `;

  const reqUser = await request.post("", {
    query: foundUserQuery,
  });

  const foundUser = reqUser.data.data.users_by_pk;
  if (!foundUser) {
    reply.status(400).send(MSG_ERR_USER_IS_NOT_EXIST);
    return;
  }

  const jwtResetPassSlice = jwtResetPass.slice(jwtResetPass.lastIndexOf("."));

  const isMatch = await compareString(jwtResetPassSlice, foundUser.reset_token);

  if (!isMatch) {
    reply.status(400).send(MSG_ERR_CREDENTIAL_IS_INCORRECT);
    return;
  }
  const hashPassword = await hashString(password);

  const UpdateUserMutation = `
    mutation MyMutation($_set: users_set_input = {}, $pk_columns: users_pk_columns_input = {}) {
      update_users_by_pk(pk_columns: $pk_columns, _set: $_set) {
        id
      }
    }
  `;

  await request.post("", {
    query: UpdateUserMutation,
    variables: {
      pk_columns: {
        id: foundUser.id,
      },
      _set: {
        password: hashPassword,
        reset_token: null,
      },
    },
  });

  return { msg: MSG_RESET_PASS_SUCCESSFULLY };
};

export const refresh = async (req: RefreshRequest, reply: FastifyReply) => {
  const { jwtRefesh } = req.body;

  let verify: any;
  try {
    verify = jwt.verify(jwtRefesh, envLib.jwt.refreshToken as string);
  } catch (err) {
    reply.status(400).send(MSG_ERR_INVALID_TOKEN);
    return;
  }

  const foundUserQuery = `
    query MyQuery {
      users_by_pk(id: "${verify.aud}") {
        id
        refresh_token
        email
        is_admin
        username
      }
    }
  `;

  const reqUser = await request.post("", {
    query: foundUserQuery,
  });

  const foundUser = reqUser.data.data.users_by_pk;
  if (!foundUser) {
    reply.status(400).send(MSG_ERR_USER_IS_NOT_EXIST);
    return;
  }

  const jwtRefeshSlice = jwtRefesh.slice(jwtRefesh.lastIndexOf("."));

  const isMatch = await compareString(jwtRefeshSlice, foundUser.refresh_token);

  if (!isMatch) {
    reply.status(400).send(MSG_ERR_CREDENTIAL_IS_INCORRECT);
    return;
  }

  const accessToken = createToken(foundUser);

  const refreshToken = createToken(foundUser, tokenEnum.RefreshToken);

  const newRefreshToken = refreshToken.slice(refreshToken.lastIndexOf("."));

  const refreshTokenHash = await hashString(newRefreshToken);

  const UpdateUserMutation = `
    mutation MyMutation {
      update_users_by_pk(pk_columns: {id: "${foundUser.id}"}, _set: {refresh_token: "${refreshTokenHash}"}) {
        id
      }
    }
  `;

  await request.post("", { query: UpdateUserMutation });

  return {
    msg: MSG_NEW_TOKEN,
    AccessToken: accessToken,
    RefreshToken: refreshToken,
  };
};

export default {
  login,
  signup,
  logout,
  forgotPassword,
  resetPassword,
  refresh,
};
