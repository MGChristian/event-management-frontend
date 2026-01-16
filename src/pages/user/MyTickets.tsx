import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import TicketCard from "../../components/TicketCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import TicketService from "../../services/ticketService";
import { privateAxios } from "../../api/axios";
import type { ticket } from "../../types/ticketType";
import { Link } from "react-router";

function MyTickets() {
  const ticketService = new TicketService(privateAxios);
  const [tickets, setTickets] = useState<ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTickets() {
      setLoading(true);
      try {
        const data = await ticketService.getMyTickets({
          signal: controller.signal,
        });
        setTickets(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to load tickets");
          console.error("Error fetching tickets:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTickets();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <PageHeader
          title="My Tickets"
          subtitle="Your event tickets and QR codes"
        />

        <div className="mt-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner message="Loading your tickets..." />
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={<Ticket size={40} />}
              title="No Tickets Yet"
              description="You haven't gotten any tickets yet. Browse events to find something exciting!"
              action={
                <Link
                  to="/"
                  className="rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
                >
                  Browse Events
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTickets;
