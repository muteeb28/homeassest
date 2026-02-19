import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "./ui/Button";

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  variant = "default",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const isDestructive = variant === "destructive";

  return (
    <div className="confirm-modal animate-in fade-in duration-200">
      <div className="panel">
        <div className={`icon ${isDestructive ? "destructive" : ""}`}>
          {isDestructive ? (
            <Trash2 className="alert" />
          ) : (
            <AlertTriangle className="alert" />
          )}
        </div>

        <h3>{title}</h3>
        <p>{description}</p>

        <div className="actions">
          <Button
            onClick={onConfirm}
            fullWidth
            className={`confirm ${isDestructive ? "destructive" : ""}`}
          >
            {confirmLabel}
          </Button>

          <button onClick={onCancel} className="cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
