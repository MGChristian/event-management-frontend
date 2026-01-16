import type { Axios, AxiosRequestConfig } from "axios";
import type { createUserDTO, updateUserDTO, user } from "../types/userType";

class UserService {
  private axios: Axios;
  constructor(axios: Axios) {
    this.axios = axios;
  }

  async getUsers(config: AxiosRequestConfig = {}): Promise<user[]> {
    const response = await this.axios.get("/users", config);
    return response.data;
  }

  async createUser(
    userData: createUserDTO,
    config: AxiosRequestConfig = {},
  ): Promise<user> {
    const response = await this.axios.post("/users", userData, config);
    return response.data;
  }

  async updateUser(
    userId: string,
    userData: updateUserDTO,
    config: AxiosRequestConfig = {},
  ): Promise<user> {
    const response = await this.axios.patch(
      `/users/${userId}`,
      userData,
      config,
    );
    return response.data;
  }
}

export default UserService;
