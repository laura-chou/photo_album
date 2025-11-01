import * as fileController from "../controllers/file.controller";
import upload from "../core/file-upload";
import authMiddleware from "../middleware/authenticate";

import { createRoute, RouteConfig } from "./route.utils";

export const fileRoutes = (): RouteConfig => {
  return createRoute("/file", (router) => {
    router.get("/:fileName", authMiddleware("jwt-basic"), fileController.readPhoto);
    router.post("/upload", authMiddleware("jwt-basic"), upload.array("file"), fileController.uploadPhoto);
  });
};