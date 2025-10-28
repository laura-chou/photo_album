import * as albumController from "../controllers/album.controller";
import authMiddleware from "../middleware/authenticate";

import { createRoute, RouteConfig } from "./route.utils";

export const albumRoutes = (): RouteConfig => {
  return createRoute("/album", (router) => {
    router.get("/file/:name", authMiddleware("jwt-basic"), albumController.readPhoto);
  });
};