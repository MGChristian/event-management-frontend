import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Calendar, MapPin, Users, Eye } from "lucide-react";
import dayjs from "dayjs";
import EventService from "../../services/eventService";
import { privateAxios } from "../../api/axios";
import type { event } from "../../types/eventType";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

function OrganizerDashboard() {
  const eventService = new EventService(privateAxios);
  const [events, setEvents] = useState<event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      setLoading(true);
      try {
        const data = await eventService.getEventsByOrganizer({
          signal: controller.signal,
        });
        setEvents(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to load events");
          console.error("Error fetching events:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="My Events"
            subtitle="Manage your events and track attendance"
          />
          <Link
            to="/organizer/create"
            className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Create Event
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner message="Loading your events..." />
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Calendar size={40} />}
              title="No Events Created"
              description="You haven't created any events yet. Start by creating your first event!"
              action={
                <Link
                  to="/organizer/create"
                  className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
                >
                  <Plus size={18} />
                  Create Event
                </Link>
              }
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
                      Date
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Location
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Capacity
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
                                {event.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-stone-800">
                            {event.name}
                          </span>
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
                          <span className="max-w-32 truncate">
                            {event.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Users size={14} className="text-orange-500" />
                          {event.capacity}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/events/${event.id}`}
                          className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
