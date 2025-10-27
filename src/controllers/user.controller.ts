import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import svgCaptcha from "svg-captcha";
import { v4 as uuidv4 } from "uuid";

import { responseHandler } from "../common/response";
import { getNowDate, setFunctionName } from "../common/utils";
import { setCaptcha } from "../core/captcha";
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
      setLog(LogLevel.INFO, LogMessage.SUCCESS, userLogin.name);
      responseHandler.success(response, { token });
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
      responseHandler.created(response);
    } catch (error) {
      baseController.errorHandler(response, error, userCreate.name);
    }
  },
  "userCreate"
);

export const userCapture = setFunctionName(
  async(_: Request, response: Response): Promise<void> => {
    try {
        const captcha = svgCaptcha.create({
          size: 4, // Length of the captcha text
          ignoreChars: "o01il", // Characters to ignore
          color: true, // Whether the captcha text has color
          background: "#fff", // Background color of the captcha image
          noise: 2 // Number of noise lines
        });

        const captchaId = uuidv4();
        setCaptcha(captchaId, captcha.text);

        setLog(LogLevel.INFO, LogMessage.SUCCESS, userCapture.name);

        const responseData = {
          captchaId,
          svg: captcha.data
        };
        responseHandler.success(response, responseData);
    } catch (error) {
      baseController.errorHandler(response, error, userCapture.name);
    }
  },
  "userCapture"
);