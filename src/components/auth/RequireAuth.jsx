import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "@/utils/auth";
import { ROUTES } from "@/data/data";

export default function RequireAuth() {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
