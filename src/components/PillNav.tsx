import { LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { userRoles } from "../types/userType";

type NavItem = {
  label: string;
  path: string;
};

function PillNav() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const guestMenus: NavItem[] = [
    { label: "Home", path: "/" },
    { label: "Login", path: "/login" },
  ];

  const userMenus: NavItem[] = [
    { label: "Browse Events", path: "/" },
    { label: "My Tickets", path: "/user" },
  ];

  const organizerMenus: NavItem[] = [
    { label: "My Events", path: "/organizer" },
    { label: "Scanner", path: "/organizer/scan" },
  ];

  const adminMenus: NavItem[] = [
    { label: "Events", path: "/" },
    { label: "Users", path: "/admin" },
  ];

  function getMenuItems(): NavItem[] {
    if (!auth) return guestMenus;

    switch (auth.user.role) {
      case userRoles.ADMIN:
        return adminMenus;
      case userRoles.ORGANIZER:
        return organizerMenus;
      case userRoles.USER:
        return userMenus;
      default:
        return guestMenus;
    }
  }

  function handleLogout() {
    setAuth(null);
    navigate("/");
  }

  const menuItems = getMenuItems();
  const isLoggedIn = !!auth;

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl bg-yellow-300 px-4 py-2">
      <div className="flex h-10 items-center justify-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <div className="h-6 w-6 rounded-full bg-orange-500"></div>
        </Link>

        {/* Navigation Items */}
        <ul className="flex items-center gap-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 font-medium transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-stone-700 hover:bg-orange-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}

          {/* Logout Button (when logged in) */}
          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-stone-700 transition-colors hover:bg-orange-100"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default PillNav;
