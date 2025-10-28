import { albumRoutes } from "./album.route";
import { RouteConfig } from "./route.utils";
import { userRoutes } from "./user.route";

const protectedRoutes: Array<RouteConfig> = [
  userRoutes(),
  albumRoutes()
];

export default protectedRoutes;
