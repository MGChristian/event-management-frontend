import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-stone-700">{title}</h3>
      <p className="max-w-sm text-stone-500">{description}</p>
      {action}
    </div>
  );
}

export default EmptyState;
