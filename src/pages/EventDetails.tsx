import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Calendar, MapPin, Users, ArrowLeft, Ticket } from "lucide-react";
import dayjs from "dayjs";
import EventService from "../services/eventService";
import TicketService from "../services/ticketService";
import { publicAxios, privateAxios } from "../api/axios";
import type { event } from "../types/eventType";
import LoadingSpinner from "../components/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import { AxiosError } from "axios";

function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const eventService = new EventService(publicAxios);
  const ticketService = new TicketService(privateAxios);

  const [event, setEvent] = useState<event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvent() {
      if (!eventId) return;

      setLoading(true);
      try {
        const data = await eventService.getEventById(Number(eventId), {
          signal: controller.signal,
        });
        setEvent(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to load event details");
          console.error("Error fetching event:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEvent();

    return () => {
      controller.abort();
    };
  }, [eventId]);

  async function handleGetTicket() {
    // If not logged in, redirect to login
    if (!auth) {
      navigate("/login", { state: { from: { pathname: `/events/${eventId}` } } });
      return;
    }

    if (!event) return;

    setTicketLoading(true);
    setTicketError(null);

    try {
      await ticketService.createTicket({ eventId: event.id });
      navigate("/user");
    } catch (err) {
      if (err instanceof AxiosError) {
        setTicketError(err.response?.data?.message || "Failed to get ticket");
      } else {
        setTicketError("An unexpected error occurred");
      }
    } finally {
      setTicketLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <LoadingSpinner message="Loading event..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-32">
        <div className="rounded-md border border-red-300 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error || "Event not found"}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const dateStart = dayjs(event.dateStart);
  const dateEnd = dayjs(event.dateEnd);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back Button */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft size={16} />
          Back to events
        </Link>

        {/* Event Image */}
        <div className="relative h-72 w-full overflow-hidden rounded-md bg-stone-100 md:h-96">
          {event.imageBase64 ? (
            <img
              src={event.imageBase64}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-400 to-yellow-300">
              <span className="text-8xl font-bold text-white">
                {event.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="mt-8 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-stone-800 md:text-4xl">
            {event.name}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-stone-600">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
              <div>
                <p className="font-medium">
                  {dateStart.format("MMM D, YYYY")}
                </p>
                <p className="text-sm text-stone-400">
                  {dateStart.format("h:mm A")} - {dateEnd.format("h:mm A")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-orange-500" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              <span>{event.capacity} spots available</span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="border-t border-stone-200 pt-6">
              <h2 className="mb-3 text-xl font-semibold text-stone-800">
                About this event
              </h2>
              <p className="leading-relaxed whitespace-pre-wrap text-stone-600">
                {event.description}
              </p>
            </div>
          )}

          {/* Organizer Info */}
          <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Organized by</p>
            <p className="font-medium text-stone-700">{event.organizer.name}</p>
            {event.organizer.company && (
              <p className="text-sm text-stone-500">{event.organizer.company}</p>
            )}
          </div>

          {/* Ticket Error */}
          {ticketError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{ticketError}</p>
            </div>
          )}

          {/* Get Ticket Button */}
          <button
            onClick={handleGetTicket}
            disabled={ticketLoading}
            className="flex items-center justify-center gap-2 rounded-md bg-orange-500 px-6 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Ticket size={20} />
            {ticketLoading ? "Getting Ticket..." : "Get Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
