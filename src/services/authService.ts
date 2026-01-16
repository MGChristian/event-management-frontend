import type { Axios, AxiosRequestConfig } from "axios";
import type {
  authData,
  loginCredentials,
  signupCredentials,
} from "../types/authType";

class AuthService {
  private axios: Axios;
  constructor(axios: Axios) {
    this.axios = axios;
  }

  async login(
    payload: loginCredentials,
    config: AxiosRequestConfig = {},
  ): Promise<authData> {
    const response = await this.axios.post("/auth/login", payload, config);
    return response.data;
  }

  async signup(
    payload: signupCredentials,
    config: AxiosRequestConfig = {},
  ): Promise<authData> {
    const response = await this.axios.post("/auth/signup", payload, config);
    return response.data;
  }
}

export default AuthService;
