import { useState, useMemo } from "react";
import { TextInput } from "@mantine/core";
import { Search, Users, Mail, Ticket, CheckCircle, Clock } from "lucide-react";
import type { ticket } from "../types/ticketType";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

type AttendeeListProps = {
  tickets: ticket[];
  loading: boolean;
  error: string | null;
};

function AttendeeList({ tickets, loading, error }: AttendeeListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filtering by user name or email
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;

    const query = searchQuery.toLowerCase().trim();
    return tickets.filter(
      (ticket) =>
        ticket.user.name.toLowerCase().includes(query) ||
        ticket.user.email.toLowerCase().includes(query),
    );
  }, [tickets, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <LoadingSpinner message="Loading attendees..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Users size={40} />}
        title="No Attendees Yet"
        description="No one has registered for this event yet."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="flex items-center gap-4">
        <TextInput
          placeholder="Search by name or email..."
          leftSection={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <div className="text-sm text-stone-500">
          {filteredTickets.length} of {tickets.length} attendees
        </div>
      </div>

      {/* Attendees Table */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-md border border-stone-200 bg-stone-50 p-8 text-center">
          <p className="text-stone-500">No attendees match your search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-stone-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    Name
                  </div>
                </th>
                <th className="px-4 py-3 text-sm font-medium text-stone-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    Email
                  </div>
                </th>
                <th className="px-4 py-3 text-sm font-medium text-stone-600">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} />
                    Ticket ID
                  </div>
                </th>
                <th className="px-4 py-3 text-sm font-medium text-stone-600">
                  Scan Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className={`border-b border-stone-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-stone-800">
                      {ticket.user.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-stone-600">
                      {ticket.user.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-stone-500">
                      {ticket.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {ticket.scanDate ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-green-300 bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <CheckCircle size={12} />
                        Scanned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendeeList;
