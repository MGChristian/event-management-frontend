import type { event } from "./eventType";
import type { user } from "./userType";

export type ticket = {
  id: string;
  scanDate?: Date;
  createdAt: Date;
  user: user;
  event: event;
};

export type createTicketDTO = {
  eventId: number;
};
