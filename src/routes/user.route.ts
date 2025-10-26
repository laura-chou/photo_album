import * as userController from "../controllers/user.controller";
import authMiddleware from "../middleware/authenticate";
import validateLoginRequest from "../middleware/validateLoginRequest";
import validateRateLimit from "../middleware/validateRateLimit";

import { createRoute, RouteConfig } from "./route.utils";

export const userRoutes = (): RouteConfig => {
  return createRoute("/user", (router) => {
    router.get("/captcha", validateRateLimit, userController.userCapture);
    router.post("/login", validateLoginRequest, authMiddleware("login"), userController.userLogin);
    router.post("/create", userController.userCreate);
  });
};