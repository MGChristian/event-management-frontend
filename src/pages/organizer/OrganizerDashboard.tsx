import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import dayjs from "dayjs";
import EventService from "../../services/eventService";
import TicketService from "../../services/ticketService";
import { privateAxios } from "../../api/axios";
import type { event } from "../../types/eventType";
import type { ticket } from "../../types/ticketType";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import EventFormModal from "../../components/EventFormModal";
import AttendeeList from "../../components/AttendeeList";
import { generateEventCsv, downloadCsv } from "../../utils/csvExport";

function OrganizerDashboard() {
  const eventService = new EventService(privateAxios);
  const ticketService = new TicketService(privateAxios);
  const [events, setEvents] = useState<event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // Edit Event Modal State
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<event | null>(null);

  // Attendees State
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Record<number, ticket[]>>({});
  const [attendeesLoading, setAttendeesLoading] = useState<number | null>(null);
  const [attendeesError, setAttendeesError] = useState<Record<number, string>>(
    {},
  );
  const [exportingEventId, setExportingEventId] = useState<number | null>(null);

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
  }, [refetchKey]);

  function handleEditClick(event: event) {
    setSelectedEvent(event);
    setEditModalOpened(true);
  }

  function handleEditSuccess() {
    // Refetch events to get fresh data from server
    setRefetchKey((prev) => prev + 1);
    // Also clear attendees cache since event data changed
    setAttendees({});
  }

  async function toggleAttendees(eventId: number) {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }

    setExpandedEventId(eventId);

    // If we already have the attendees cached, don't refetch
    if (attendees[eventId]) return;

    setAttendeesLoading(eventId);
    setAttendeesError((prev) => ({ ...prev, [eventId]: "" }));

    try {
      const tickets = await ticketService.getTicketsByEvent(eventId);
      setAttendees((prev) => ({ ...prev, [eventId]: tickets }));
    } catch (err) {
      setAttendeesError((prev) => ({
        ...prev,
        [eventId]: "Failed to load attendees",
      }));
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeesLoading(null);
    }
  }

  async function handleExportCsv(eventId: number) {
    setExportingEventId(eventId);
    try {
      // Use cached attendees if available, otherwise fetch
      let tickets = attendees[eventId];
      if (!tickets) {
        tickets = await ticketService.getTicketsByEvent(eventId);
        setAttendees((prev) => ({ ...prev, [eventId]: tickets }));
      }
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
                      Sales
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <React.Fragment key={event.id}>
                      <tr
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
                            {event.ticketsSold ?? 0} / {event.capacity}
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
                              onClick={() => handleEditClick(event)}
                              className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => toggleAttendees(event.id)}
                              className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                            >
                              <Users size={14} />
                              Attendees
                              {expandedEventId === event.id ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
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
                      {/* Expandable Attendees Row */}
                      {expandedEventId === event.id && (
                        <tr>
                          <td colSpan={5} className="bg-stone-50 px-4 py-4">
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="font-medium text-stone-700">
                                Attendee List
                              </h4>
                              <button
                                onClick={() => handleExportCsv(event.id)}
                                disabled={
                                  exportingEventId === event.id ||
                                  attendeesLoading === event.id
                                }
                                className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                              >
                                <Download size={14} />
                                {exportingEventId === event.id
                                  ? "Downloading..."
                                  : "Download CSV"}
                              </button>
                            </div>
                            <AttendeeList
                              tickets={attendees[event.id] || []}
                              loading={attendeesLoading === event.id}
                              error={attendeesError[event.id] || null}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      <EventFormModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

export default OrganizerDashboard;
