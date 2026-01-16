import { PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Sticker } from "lucide-react";
import { Link } from "react-router";
import AuthService from "../services/authService";
import { publicAxios } from "../api/axios";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { AxiosError } from "axios";

function SignUp() {
  const { setAuth } = useAuth();
  const authService = new AuthService(publicAxios);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      name: "",
      company: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      name: (value) => (value.length > 0 ? null : "Name is required"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setError(null);
    try {
      setLoading(true);
      const data = await authService.signup(values);
      setAuth(data);
      form.reset();
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
        <h1 className="text-4xl font-medium">Sign Up</h1>
        <p>Welcome! Please enter your details to create an account.</p>
        {error && (
          <div className="rounded-md border border-red-500 bg-red-50 px-4 py-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="text-left">
          <TextInput
            withAsterisk
            label="Full Name"
            placeholder="Your name"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
        </div>
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
          <TextInput
            label="Company"
            placeholder="Your company"
            key={form.key("company")}
            {...form.getInputProps("company")}
            description="This field is optional"
            inputWrapperOrder={["label", "input", "description", "error"]}
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
        <div className="text-left">
          <PasswordInput
            withAsterisk
            label="Confirm Password"
            placeholder="Confirm your password"
            key={form.key("confirmPassword")}
            {...form.getInputProps("confirmPassword")}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-md bg-orange-500 px-4 py-2 hover:bg-orange-600"
        >
          <p className="text-sm font-medium text-white">
            {loading ? "LOADING..." : "Sign Up"}
          </p>
        </button>
      </form>
      <div>
        <p className="text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:text-orange-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
