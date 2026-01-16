import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router";
import type { event } from "../types/eventType";
import dayjs from "dayjs";

type EventCardProps = {
  event: event;
};

function EventCard({ event }: EventCardProps) {
  const formattedDate = dayjs(event.dateStart).format("MMM D, YYYY • h:mm A");

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-stone-200 bg-white transition-all hover:border-orange-300"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        {event.imageBase64 ? (
          <img
            src={event.imageBase64}
            alt={event.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-400 to-yellow-300">
            <span className="text-4xl font-bold text-white">
              {event.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Capacity Badge */}
        <div className="absolute top-3 right-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-stone-700">
          {event.capacity} spots
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-stone-800 group-hover:text-orange-600">
          {event.name}
        </h3>

        <div className="flex flex-col gap-2 text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-orange-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-orange-500" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {event.description && (
          <p className="line-clamp-2 text-sm text-stone-400">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <span className="text-sm font-medium text-orange-500 group-hover:text-orange-600">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;
