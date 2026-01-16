import { PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Sticker } from "lucide-react";
import { Link } from "react-router";
import AuthService from "../services/authService";
import { publicAxios } from "../api/axios";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { AxiosError } from "axios";

function Login() {
  const { setAuth } = useAuth();
  const authService = new AuthService(publicAxios);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setError(null);
    try {
      setLoading(true);
      const data = await authService.login(values);
      setAuth(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-4 p-4">
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <Sticker size={48} />
        <p className="text-lg font-medium">TicketUp</p>
      </div>
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex w-md flex-col gap-4 p-4 text-center"
      >
        <h1 className="text-4xl font-medium">Login</h1>
        <p>Hello! please enter your credentials to continue.</p>
        {error && (
          <div className="rounded-md border border-red-500 bg-red-50 px-4 py-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="text-left">
          <TextInput
            withAsterisk
            label="Email"
            placeholder="your@email.com"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
        </div>
        <div className="text-left">
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-md bg-orange-500 px-4 py-2 hover:bg-orange-600"
        >
          <p className="text-sm font-medium text-white">
            {loading ? "LOADING..." : "LOGIN"}
          </p>
        </button>
      </form>
      <div>
        <p className="text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-500 hover:text-orange-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
