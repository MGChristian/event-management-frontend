import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Switch } from "@mantine/core";
import UserService from "../../services/userService";
import { privateAxios } from "../../api/axios";
import type { user } from "../../types/userType";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import RoleBadge from "../../components/RoleBadge";
import { AxiosError } from "axios";

function AdminDashboard() {
  const userService = new UserService(privateAxios);
  const [users, setUsers] = useState<user[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await userService.getUsers({
          signal: controller.signal,
        });
        setUsers(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to load users");
          console.error("Error fetching users:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      controller.abort();
    };
  }, []);

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    setUpdatingUserId(userId);

    try {
      const updatedUser = await userService.updateUser(userId, {
        isActive: !currentStatus,
      });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, isActive: updatedUser.isActive }
            : user
        )
      );
    } catch (err) {
      let message = "Failed to update user";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      console.error(message, err);
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <PageHeader
          title="User Management"
          subtitle="Manage platform users and their access"
        />

        <div className="mt-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner message="Loading users..." />
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="No Users Found"
              description="There are no users registered on the platform yet."
            />
          ) : (
            <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Email
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Company
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Role
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-stone-600">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-stone-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-stone-800">
                          {user.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-stone-600">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-stone-600">
                          {user.company || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${
                            user.isActive
                              ? "border-green-300 bg-green-100 text-green-700"
                              : "border-stone-300 bg-stone-100 text-stone-600"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={user.isActive}
                          onChange={() =>
                            handleToggleActive(user.id, user.isActive)
                          }
                          disabled={updatingUserId === user.id}
                          color="orange"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
