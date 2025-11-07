import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { responseHandler } from "../common/response";
import { getNowDate, isProductionEnv, setFunctionName } from "../common/utils";
import { createCaptcha } from "../core/captcha";
import { LogLevel, LogMessage, setLog } from "../core/logger";
import User, { IUser } from "../models/user.model";

import * as baseController from "./base.controller";

export const userLogin = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = request.user!;
      const token = jwt.sign(
        { user: user.userName },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.JWT_SECRET!, 
        { expiresIn: "1h" }
      );

      await User.findByIdAndUpdate(
        user._id,
        { token }
      );

      response.cookie("token", token, {
        httpOnly: true,
        secure: isProductionEnv(),
        sameSite: isProductionEnv() ? "none" : "lax",
        maxAge: 60 * 60 * 1000
      });

      setLog(LogLevel.INFO, LogMessage.SUCCESS, userLogin.name);
      responseHandler.success(response);
    } catch (error) {
      baseController.errorHandler(response, error, userLogin.name);
    }
  },
  "userLogin"
);

export const userCreate = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    try {
      const userName = request.body.account;
      const password = request.body.password;
      const captchaId = request.body.captchaId;
      const isUserExist = await User.findOne({ userName });
      if (isUserExist) {
        const logMsg = `${LogMessage.ERROR.USEREXISTS}, userName: ${userName}`;
        setLog(LogLevel.ERROR, logMsg, userCreate.name);
        responseHandler.conflict(response);
        return;
      }
      const data: IUser = {
        userName: userName,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        password: await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS!)),
        createDate: getNowDate()
      };
      await User.create(data);
      setLog(LogLevel.INFO, LogMessage.SUCCESS, userCreate.name);
      responseHandler.created(response, createCaptcha(captchaId));
    } catch (error) {
      baseController.errorHandler(response, error, userCreate.name);
    }
  },
  "userCreate"
);

export const userCapture = setFunctionName(
  async(_: Request, response: Response): Promise<void> => {
    try {
      setLog(LogLevel.INFO, LogMessage.SUCCESS, userCapture.name);
      responseHandler.success(response, createCaptcha());
    } catch (error) {
      baseController.errorHandler(response, error, userCapture.name);
    }
  },
  "userCapture"
);