import type { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import type { createTicketDTO, ticket } from "../types/ticketType";

class TicketService {
  private axios: Axios;
  constructor(axios: Axios) {
    this.axios = axios;
  }

  async createTicket(
    ticketData: createTicketDTO,
    config: AxiosRequestConfig = {},
  ): Promise<ticket> {
    const response = await this.axios.post("/tickets", ticketData, config);
    return response.data;
  }

  async getTicketById(
    ticketId: string,
    config: AxiosRequestConfig = {},
  ): Promise<ticket> {
    const response = await this.axios.get(`/tickets/${ticketId}`, config);
    return response.data;
  }

  async getMyTickets(config: AxiosRequestConfig = {}): Promise<ticket[]> {
    const response = await this.axios.get("/tickets/mine", config);
    return response.data;
  }

  async getTicketsByEvent(
    eventId: number,
    config: AxiosRequestConfig = {},
  ): Promise<ticket[]> {
    const response = await this.axios.get(`/tickets/${eventId}`, config);
    return response.data;
  }

  async deleteTicket(
    ticketId: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    return this.axios.delete(`/tickets/${ticketId}`, config);
  }
}

export default TicketService;
