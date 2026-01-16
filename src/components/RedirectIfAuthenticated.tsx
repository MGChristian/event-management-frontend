import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import { userRoles } from "../types/userType";

const RedirectIfAuthenticated = () => {
  const { auth } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  if (auth?.accessToken) {
    const role = auth.user.role;

    if (from) {
      return <Navigate to={from} replace />;
    }

    switch (role) {
      case userRoles.ADMIN:
        return <Navigate to="/admin" replace />;
      case userRoles.ORGANIZER:
        return <Navigate to="/organizer" replace />;
      case userRoles.USER:
        return <Navigate to="/user" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default RedirectIfAuthenticated;
