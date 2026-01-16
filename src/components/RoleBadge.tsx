import { userRoles } from "../types/userType";

type RoleBadgeProps = {
  role: string;
};

function RoleBadge({ role }: RoleBadgeProps) {
  const styles: Record<string, string> = {
    [userRoles.ADMIN]: "bg-orange-100 text-orange-700 border-orange-300",
    [userRoles.ORGANIZER]: "bg-yellow-100 text-yellow-700 border-yellow-300",
    [userRoles.USER]: "bg-stone-100 text-stone-600 border-stone-300",
  };

  const labels: Record<string, string> = {
    [userRoles.ADMIN]: "Admin",
    [userRoles.ORGANIZER]: "Organizer",
    [userRoles.USER]: "User",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-medium ${styles[role] || styles[userRoles.USER]}`}
    >
      {labels[role] || role}
    </span>
  );
}

export default RoleBadge;
