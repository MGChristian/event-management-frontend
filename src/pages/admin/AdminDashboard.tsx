import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  MapPin,
  Edit,
  Eye,
  UserPlus,
  Download,
} from "lucide-react";
import { Switch, Tabs } from "@mantine/core";
import dayjs from "dayjs";
import { Link } from "react-router";
import { AxiosError } from "axios";
import UserService from "../../services/userService";
import EventService from "../../services/eventService";
import TicketService from "../../services/ticketService";
import { privateAxios } from "../../api/axios";
import type { user } from "../../types/userType";
import type { event } from "../../types/eventType";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import RoleBadge from "../../components/RoleBadge";
import UserFormModal from "../../components/UserFormModal";
import EventFormModal from "../../components/EventFormModal";
import { generateEventCsv, downloadCsv } from "../../utils/csvExport";

function AdminDashboard() {
  const userService = new UserService(privateAxios);
  const eventService = new EventService(privateAxios);
  const ticketService = new TicketService(privateAxios);

  // Users State
  const [users, setUsers] = useState<user[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Events State
  const [events, setEvents] = useState<event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [ticketCounts, setTicketCounts] = useState<Record<number, number>>({});

  // User Modal State
  const [userModalOpened, setUserModalOpened] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedUser, setSelectedUser] = useState<user | null>(null);

  // Event Modal State
  const [eventModalOpened, setEventModalOpened] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<event | null>(null);
  const [exportingEventId, setExportingEventId] = useState<number | null>(null);

  // Refetch triggers
  const [usersRefetchKey, setUsersRefetchKey] = useState(0);
  const [eventsRefetchKey, setEventsRefetchKey] = useState(0);

  // Fetch Users
  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setUsersLoading(true);
      try {
        const data = await userService.getUsers({
          signal: controller.signal,
        });
        setUsers(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setUsersError("Failed to load users");
          console.error("Error fetching users:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      controller.abort();
    };
  }, [usersRefetchKey]);

  // Fetch Events
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      setEventsLoading(true);
      try {
        const data = await eventService.getEvents({
          signal: controller.signal,
        });
        setEvents(data);

        // Fetch ticket counts for each event safely
        const counts: Record<number, number> = {};

        // We use allSettled so one failure doesn't stop the whole page
        await Promise.allSettled(
          data.map(async (event) => {
            try {
              const tickets = await ticketService.getTicketsByEvent(event.id, {
                signal: controller.signal,
              });
              counts[event.id] = tickets.length;
            } catch {
              counts[event.id] = 0;
            }
          }),
        );

        if (!controller.signal.aborted) {
          setTicketCounts(counts);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setEventsError("Failed to load events");
          console.error("Error fetching events:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setEventsLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, [eventsRefetchKey]);

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    setUpdatingUserId(userId);

    try {
      const updatedUser = await userService.updateUser(userId, {
        isActive: !currentStatus,
      });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, isActive: updatedUser.isActive }
            : user,
        ),
      );
    } catch (err) {
      let message = "Failed to update user";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      console.error(message, err);
    } finally {
      setUpdatingUserId(null);
    }
  }

  function handleCreateUser() {
    setUserModalMode("create");
    setSelectedUser(null);
    setUserModalOpened(true);
  }

  function handleEditUserRole(user: user) {
    setUserModalMode("edit");
    setSelectedUser(user);
    setUserModalOpened(true);
  }

  function handleUserSuccess() {
    setUsersRefetchKey((prev) => prev + 1);
  }

  function handleEditEvent(event: event) {
    setSelectedEvent(event);
    setEventModalOpened(true);
  }

  function handleEventSuccess() {
    setEventsRefetchKey((prev) => prev + 1);
  }

  async function handleExportCsv(eventId: number) {
    setExportingEventId(eventId);
    try {
      const tickets = await ticketService.getTicketsByEvent(eventId);
      const csvContent = generateEventCsv(tickets);
      downloadCsv(csvContent, `attendees-${eventId}.csv`);
    } catch (err) {
      console.error("Error exporting CSV:", err);
    } finally {
      setExportingEventId(null);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage users and oversee all platform events"
        />

        <div className="mt-8">
          <Tabs defaultValue="users" color="orange">
            <Tabs.List>
              <Tabs.Tab value="users" leftSection={<Users size={16} />}>
                User Management
              </Tabs.Tab>
              <Tabs.Tab value="events" leftSection={<Calendar size={16} />}>
                All Events
              </Tabs.Tab>
            </Tabs.List>

            {/* Users Tab */}
            <Tabs.Panel value="users" pt="md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-stone-700">
                  Platform Users ({users.length})
                </h3>
                <button
                  onClick={handleCreateUser}
                  className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
                >
                  <UserPlus size={18} />
                  Create User
                </button>
              </div>

              {usersLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <LoadingSpinner message="Loading users..." />
                </div>
              ) : usersError ? (
                <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
                  {usersError}
                </div>
              ) : users.length === 0 ? (
                <EmptyState
                  icon={<Users size={40} />}
                  title="No Users Found"
                  description="There are no users registered on the platform yet."
                />
              ) : (
                <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-left">
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Name
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Company
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Role
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Active
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b border-stone-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-medium text-stone-800">
                              {user.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-stone-600">
                              {user.email}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-stone-600">
                              {user.company || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-md border px-2 py-1 text-xs font-medium ${
                                user.isActive
                                  ? "border-green-300 bg-green-100 text-green-700"
                                  : "border-stone-300 bg-stone-100 text-stone-600"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Switch
                              checked={user.isActive}
                              onChange={() =>
                                handleToggleActive(user.id, user.isActive)
                              }
                              disabled={updatingUserId === user.id}
                              color="orange"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEditUserRole(user)}
                              className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                            >
                              <Edit size={14} />
                              Edit Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tabs.Panel>

            {/* Events Tab */}
            <Tabs.Panel value="events" pt="md">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-stone-700">
                  All Platform Events ({events.length})
                </h3>
              </div>

              {eventsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <LoadingSpinner message="Loading events..." />
                </div>
              ) : eventsError ? (
                <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
                  {eventsError}
                </div>
              ) : events.length === 0 ? (
                <EmptyState
                  icon={<Calendar size={40} />}
                  title="No Events Found"
                  description="There are no events on the platform yet."
                />
              ) : (
                <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-left">
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Event Name
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Organizer
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Date
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Location
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Sales
                        </th>
                        <th className="px-4 py-3 text-sm font-medium text-stone-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => (
                        <tr
                          key={event.id}
                          className={`border-b border-stone-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {event.imageBase64 ? (
                                <img
                                  src={event.imageBase64}
                                  alt={event.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-linear-to-br from-orange-400 to-yellow-300">
                                  <span className="text-sm font-bold text-white">
                                    {event.name
                                      ? event.name.charAt(0).toUpperCase()
                                      : "?"}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium text-stone-800">
                                {event.name || "Unnamed Event"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              {/* SAFE ACCESS: Using ?. operator and fallback */}
                              <span className="text-sm font-medium text-stone-700">
                                {event.organizer?.name || "Unknown Organizer"}
                              </span>
                              {event.organizer?.company && (
                                <p className="text-xs text-stone-500">
                                  {event.organizer.company}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                              <Calendar size={14} className="text-orange-500" />
                              {dayjs(event.dateStart).format("MMM D, YYYY")}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                              <MapPin size={14} className="text-orange-500" />
                              <span className="max-w-24 truncate">
                                {event.location}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-orange-500" />
                              <span className="text-sm font-medium text-stone-700">
                                {event.ticketsSold ??
                                  ticketCounts[event.id] ??
                                  "..."}{" "}
                                / {event.capacity}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/events/${event.id}`}
                                className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
                              >
                                <Eye size={14} />
                                View
                              </Link>
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleExportCsv(event.id)}
                                disabled={exportingEventId === event.id}
                                className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 disabled:opacity-50"
                              >
                                <Download size={14} />
                                {exportingEventId === event.id
                                  ? "Exporting..."
                                  : "Export"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>

      <UserFormModal
        opened={userModalOpened}
        onClose={() => {
          setUserModalOpened(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        mode={userModalMode}
        onSuccess={handleUserSuccess}
      />

      <EventFormModal
        opened={eventModalOpened}
        onClose={() => {
          setEventModalOpened(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={handleEventSuccess}
      />
    </div>
  );
}

export default AdminDashboard;
