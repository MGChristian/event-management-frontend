import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import type { userRolesType } from "../types/userType";

const RequireAuth = ({ allowedRoles }: { allowedRoles: userRolesType[] }) => {
  const { auth } = useAuth();
  const location = useLocation();
  if (auth?.accessToken) {
    const role = auth.user.role;
    if (allowedRoles.includes(role as userRolesType)) {
      return <Outlet />;
    } else {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return <Navigate to="/" state={{ from: location }} replace />;
};

export default RequireAuth;
