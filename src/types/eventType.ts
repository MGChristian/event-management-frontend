import type { user } from "./userType";

export type event = {
  id: number;
  name: string;
  dateStart: Date;
  dateEnd: Date;
  location: string;
  description?: string;
  capacity: number;
  ticketsSold?: number;
  imageBase64?: string;
  createdAt: Date;
  organizer: user;
};

export type createEventDTO = {
  name: string;
  dateStart: Date;
  dateEnd: Date;
  location: string;
  description?: string;
  capacity: number;
  imageBase64?: string;
};

export type updateEventDTO = Partial<createEventDTO>;
