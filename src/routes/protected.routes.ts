import { RouteConfig } from "./route.utils";
import { userRoutes } from "./user.route";

const protectedRoutes: Array<RouteConfig> = [
  userRoutes()
];

export default protectedRoutes;
