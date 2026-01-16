import type { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import type { createEventDTO, event, updateEventDTO } from "../types/eventType";

class EventService {
  private axios: Axios;
  constructor(axios: Axios) {
    this.axios = axios;
  }

  async createEvent(
    eventData: createEventDTO,
    config: AxiosRequestConfig = {},
  ): Promise<event> {
    const response = await this.axios.post("/events", eventData, config);
    return response.data;
  }

  async getEvents(config: AxiosRequestConfig = {}): Promise<event[]> {
    const response = await this.axios.get("/events", config);
    return response.data;
  }

  async getEventById(
    eventId: number,
    config: AxiosRequestConfig = {},
  ): Promise<event> {
    const response = await this.axios.get(`/events/${eventId}`, config);
    return response.data;
  }

  async getEventsByOrganizer(
    config: AxiosRequestConfig = {},
  ): Promise<event[]> {
    const response = await this.axios.get(`/events/organizer`, config);
    return response.data;
  }

  async getEventsById(
    eventId: number,
    config: AxiosRequestConfig = {},
  ): Promise<event> {
    const response = await this.axios.get(`/events/${eventId}`, config);
    return response.data;
  }

  async updateEvent(
    eventId: number,
    eventData: updateEventDTO,
    config: AxiosRequestConfig = {},
  ): Promise<event> {
    const response = await this.axios.patch(
      `/events/${eventId}`,
      eventData,
      config,
    );
    return response.data;
  }

  async deleteEvent(
    eventId: number,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    return this.axios.delete(`/events/${eventId}`, config);
  }
}

export default EventService;
