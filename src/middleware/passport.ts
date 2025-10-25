import bcrypt from "bcrypt";
import passport from "passport";
import passportJWT, { Strategy as JwtStrategy, ExtractJwt as ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";

import { RESPONSE_MESSAGE } from "../common/constants";
import { isNullOrEmpty } from "../common/utils";
import User from "../models/user.model";

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

interface JWTPayload {
  user: string;
  iat: number;
  exp: number;
}

interface UserQuery {
  userName: string;
}

const createJwtStrategy = (): JwtStrategy => 
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      secretOrKey: process.env.JWT_SECRET!
    },
    async(jwtPayload: JWTPayload, done: passportJWT.VerifiedCallback) => {
      try {
        const query: UserQuery = { userName: jwtPayload.user };

        const user = await User.findOne(query);

        if (!user) {
          return done(null, false, { message: RESPONSE_MESSAGE.USER_NOT_EXIST });
        }

        if (isNullOrEmpty(user.token)) {
          return done(null, false, { message: RESPONSE_MESSAGE.TOKEN_EXPIRED });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false, { message: RESPONSE_MESSAGE.SERVER_ERROR });
      }
    }
  );

passport.use("jwt-basic", createJwtStrategy());

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "account",
      passwordField: "password"
    },
    async(account: string, password: string, done) => {
      try {
        const user = await User.findOne({ userName: account });

        if (!user) {
          return done(null, false, { message: RESPONSE_MESSAGE.WRONG_PASSWORD });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: RESPONSE_MESSAGE.WRONG_PASSWORD });
        }
        return done(null, user, { message: RESPONSE_MESSAGE.SUCCESS });
      } catch (error) {
        return done(error, false, { message: RESPONSE_MESSAGE.SERVER_ERROR });
      }
    }
  )
);

export default passport;