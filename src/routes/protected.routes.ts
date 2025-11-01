import { albumRoutes } from "./album.route";
import { fileRoutes } from "./file.route";
import { RouteConfig } from "./route.utils";
import { userRoutes } from "./user.route";

const protectedRoutes: Array<RouteConfig> = [
  userRoutes(),
  albumRoutes(),
  fileRoutes()
];

export default protectedRoutes;
