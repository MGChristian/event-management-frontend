import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  size?: number;
  message?: string;
};

function LoadingSpinner({ size = 32, message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={size} className="animate-spin text-orange-500" />
      {message && <p className="text-stone-500">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
