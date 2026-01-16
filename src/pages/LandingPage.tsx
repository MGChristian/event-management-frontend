import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import EventService from "../services/eventService";
import { publicAxios } from "../api/axios";
import type { event } from "../types/eventType";
import { Calendar } from "lucide-react";

function LandingPage() {
  const eventService = new EventService(publicAxios);
  const [events, setEvents] = useState<event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      setLoading(true);
      try {
        const data = await eventService.getEvents({ signal: controller.signal });
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
    <div className="relative w-full">
      <Hero />

      {/* Events Section */}
      <div id="events" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold text-stone-800">Upcoming Events</h2>
        <p className="mt-2 text-stone-500">
          Discover and join the hottest events happening on campus
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner message="Loading events..." />
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Calendar size={40} />}
              title="No Events Yet"
              description="There are no upcoming events at the moment. Check back later!"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
