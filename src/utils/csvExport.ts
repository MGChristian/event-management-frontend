import dayjs from "dayjs";
import type { ticket } from "../types/ticketType";

/**
 * Downloads data as a CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a CSV field value (handles quotes and commas)
 */
function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates CSV content from ticket data
 */
export function generateEventCsv(tickets: ticket[]): string {
  const headers = [
    "Ticket ID",
    "Attendee Name",
    "Email",
    "Registration Date",
    "Scanned",
  ];

  const rows = tickets.map((ticket) => [
    escapeCsvField(ticket.id),
    escapeCsvField(ticket.user.name),
    escapeCsvField(ticket.user.email),
    escapeCsvField(dayjs(ticket.createdAt).format("YYYY-MM-DD HH:mm:ss")),
    ticket.scanDate ? "Yes" : "No",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Fetches tickets for an event and triggers CSV download
 */
export async function exportEventAttendeesCsv(
  eventId: number,
  fetchTickets: () => Promise<ticket[]>,
): Promise<void> {
  const tickets = await fetchTickets();
  const csvContent = generateEventCsv(tickets);
  downloadCsv(csvContent, `attendees-${eventId}.csv`);
}
