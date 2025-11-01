import * as albumController from "../controllers/album.controller";
import authMiddleware from "../middleware/authenticate";

import { createRoute, RouteConfig } from "./route.utils";

export const albumRoutes = (): RouteConfig => {
  return createRoute("/album", (router) => {
    router.get("/:userName", authMiddleware("jwt-basic"), albumController.getAlbum);
    router.patch("/folder/:folderId", authMiddleware("jwt-basic"), albumController.updateFolder);
  });
};