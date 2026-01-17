import { useState, useEffect } from "react";
import { Modal, TextInput, PasswordInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AxiosError } from "axios";
import UserService from "../services/userService";
import { privateAxios } from "../api/axios";
import type {
  user,
  createUserDTO,
  updateUserDTO,
  userRolesType,
} from "../types/userType";
import { userRoles } from "../types/userType";

type UserFormModalProps = {
  opened: boolean;
  onClose: () => void;
  user?: user | null;
  onSuccess: () => void;
  mode: "create" | "edit";
};

type FormValues = {
  name: string;
  email: string;
  password: string;
  role: string;
  company: string;
};

const roleOptions = [
  { value: userRoles.USER, label: "User" },
  { value: userRoles.ORGANIZER, label: "Organizer" },
  { value: userRoles.ADMIN, label: "Admin" },
];

function UserFormModal({
  opened,
  onClose,
  user,
  onSuccess,
  mode,
}: UserFormModalProps) {
  const userService = new UserService(privateAxios);
  const isEditing = mode === "edit" && !!user;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: userRoles.USER,
      company: "",
    },
    validate: {
      name: (value) => {
        if (mode === "create" && value.length < 2)
          return "Name must be at least 2 characters";
        return null;
      },
      email: (value) => {
        if (mode === "create" && !/^\S+@\S+\.\S+$/.test(value))
          return "Invalid email address";
        return null;
      },
      password: (value) => {
        if (mode === "create" && value.length < 6)
          return "Password must be at least 6 characters";
        return null;
      },
      role: (value) => (!value ? "Role is required" : null),
    },
  });

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (opened) {
      if (user && mode === "edit") {
        form.setValues({
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
          company: user.company || "",
        });
      } else {
        form.reset();
      }
      setError(null);
    }
  }, [opened, user, mode]);

  async function handleSubmit(values: FormValues) {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && user) {
        // Build update DTO with only changed fields
        const updateData: updateUserDTO = {};

        if (values.role !== user.role)
          updateData.role = values.role as userRolesType;

        await userService.updateUser(user.id, updateData);
      } else {
        const createData: createUserDTO = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role as userRolesType,
          company: values.company || undefined,
        };

        await userService.createUser(createData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            `Failed to ${isEditing ? "update" : "create"} user`,
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit User Role" : "Create User"}
      size="md"
      centered
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {mode === "create" && (
          <>
            <TextInput
              withAsterisk
              label="Name"
              placeholder="Enter full name"
              key={form.key("name")}
              {...form.getInputProps("name")}
            />

            <TextInput
              withAsterisk
              label="Email"
              placeholder="Enter email address"
              key={form.key("email")}
              {...form.getInputProps("email")}
            />

            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="Enter password"
              key={form.key("password")}
              {...form.getInputProps("password")}
            />

            <TextInput
              label="Company"
              placeholder="Enter company name (optional)"
              key={form.key("company")}
              {...form.getInputProps("company")}
            />
          </>
        )}

        {mode === "edit" && user && (
          <div className="mb-2 rounded-md border border-stone-200 bg-stone-50 p-3">
            <p className="text-sm text-stone-500">Editing user:</p>
            <p className="font-medium text-stone-700">{user.name}</p>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
        )}

        <Select
          withAsterisk
          label="Role"
          placeholder="Select role"
          data={roleOptions}
          key={form.key("role")}
          {...form.getInputProps("role")}
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 px-4 py-2 text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Role"
                : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
