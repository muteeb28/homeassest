import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("visualizer/:id", "./routes/visualizer.$id.tsx"),
  route("design/:slug", "./routes/design.$slug.tsx"),
] satisfies RouteConfig;
