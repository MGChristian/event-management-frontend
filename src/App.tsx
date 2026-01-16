import { Routes, Route } from "react-router";
import { MantineProvider } from "@mantine/core";
import AuthProvider from "./contexts/AuthProvider";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import RequireAuth from "./components/RequireAuth";
import { userRoles } from "./types/userType";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import EventDetails from "./pages/EventDetails";
import Layout from "./components/Layout";

// User Pages
import MyTickets from "./pages/user/MyTickets";

// Organizer Pages
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import CreateEvent from "./pages/organizer/CreateEvent";
import Scanner from "./pages/organizer/Scanner";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <Routes>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/events/:eventId" element={<EventDetails />} />

            {/* ADMIN ROUTES */}
            <Route element={<RequireAuth allowedRoles={[userRoles.ADMIN]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* ORGANIZER ROUTES */}
            <Route
              element={<RequireAuth allowedRoles={[userRoles.ORGANIZER]} />}
            >
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="/organizer/create" element={<CreateEvent />} />
              <Route path="/organizer/scan" element={<Scanner />} />
            </Route>

            {/* USER ROUTES */}
            <Route element={<RequireAuth allowedRoles={[userRoles.USER]} />}>
              <Route path="/user" element={<MyTickets />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
