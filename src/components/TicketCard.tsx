import QRCode from "react-qr-code";
import type { ticket } from "../types/ticketType";
import dayjs from "dayjs";
import { Calendar, MapPin, CheckCircle } from "lucide-react";

type TicketCardProps = {
  ticket: ticket;
};

function TicketCard({ ticket }: TicketCardProps) {
  const isScanned = !!ticket.scanDate;
  const eventDate = dayjs(ticket.event.dateStart).format("MMM D, YYYY • h:mm A");

  return (
    <div className="flex w-full max-w-2xl overflow-hidden rounded-md border border-stone-200 bg-white">
      {/* Left Section - Event Info */}
      <div className="relative flex flex-1 flex-col gap-3 p-5">
        {/* Scanned Overlay */}
        {isScanned && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle size={48} />
              <span className="text-lg font-semibold">Ticket Used</span>
              <span className="text-sm text-stone-500">
                Scanned on {dayjs(ticket.scanDate).format("MMM D, h:mm A")}
              </span>
            </div>
          </div>
        )}

        {/* Event Title */}
        <h3 className="text-xl font-bold text-stone-800">
          {ticket.event.name}
        </h3>

        {/* Event Details */}
        <div className="flex flex-col gap-2 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-orange-500" />
            <span>{ticket.event.location}</span>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="mt-auto pt-3 text-xs text-stone-400">
          <p>Ticket ID: {ticket.id.slice(0, 8)}...</p>
          <p>Issued: {dayjs(ticket.createdAt).format("MMM D, YYYY")}</p>
        </div>
      </div>

      {/* Divider with Circles */}
      <div className="relative flex w-6 flex-col items-center justify-center">
        <div className="absolute -top-3 h-6 w-6 rounded-full bg-stone-100"></div>
        <div className="h-full w-0 border-l-2 border-dashed border-stone-200"></div>
        <div className="absolute -bottom-3 h-6 w-6 rounded-full bg-stone-100"></div>
      </div>

      {/* Right Section - QR Code */}
      <div className="flex w-36 flex-col items-center justify-center gap-2 bg-stone-50 p-4">
        <div className={`rounded-md bg-white p-2 ${isScanned ? "opacity-30" : ""}`}>
          <QRCode value={ticket.id} size={100} />
        </div>
        <span className="text-center text-xs text-stone-500">
          Scan to enter
        </span>
      </div>
    </div>
  );
}

export default TicketCard;
