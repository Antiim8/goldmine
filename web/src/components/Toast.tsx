import { useEffect } from "react";

export default function Toast({
  message,
  show,
  onClose,
  duration = 1500,
}: {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [show, duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 transition-opacity ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-tertiary border border-custom rounded-lg px-3 py-2 text-primary shadow">
        {message}
      </div>
    </div>
  );
}
