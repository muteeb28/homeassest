import { AlertTriangle } from "lucide-react";

import { Button } from "./ui/Button";

const AuthRequiredModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Sign in required",
  description = "Sign in with your Puter account to continue.",
  confirmLabel = "Sign in with Puter",
}: AuthRequiredModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center border border-zinc-200">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-primary w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif font-bold text-black mb-2">
          {title}
        </h3>
        <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col space-y-3">
          <Button
            onClick={onConfirm}
            fullWidth
            className="bg-primary hover:bg-orange-600 text-white"
          >
            {confirmLabel}
          </Button>
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-black mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
