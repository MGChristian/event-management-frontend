import type { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
class ScanService {
  private axios: Axios;
  constructor(axios: Axios) {
    this.axios = axios;
  }

  async scanTicket(
    ticketId: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    const response = await this.axios.post("/scan", { ticketId }, config);
    return response.data;
  }
}

export default ScanService;
