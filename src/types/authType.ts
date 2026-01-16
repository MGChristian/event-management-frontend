export type authData = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export type loginCredentials = {
  email: string;
  password: string;
};

export type signupCredentials = {
  name: string;
  email: string;
  company: string;
  password: string;
};
