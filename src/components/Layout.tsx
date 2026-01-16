import { Outlet } from "react-router";
import PillNav from "./PillNav";

function Layout() {
  return (
    <div className="text-stone-700">
      <PillNav />
      <Outlet />
    </div>
  );
}

export default Layout;
