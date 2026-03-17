import { createContext, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

function ToastViewport({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            minWidth: 290,
            maxWidth: 380,
            background: "rgba(17, 24, 39, 0.96)",
            color: "#fff",
            borderRadius: 18,
            padding: "14px 16px",
            boxShadow: "0 20px 45px rgba(0, 0, 0, 0.22)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            pointerEvents: "auto",
            animation: "toast-slide-in 220ms ease-out",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background:
                toast.type === "success"
                  ? "rgba(34, 197, 94, 0.18)"
                  : toast.type === "error"
                  ? "rgba(239, 68, 68, 0.18)"
                  : "rgba(59, 130, 246, 0.18)",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i"}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{toast.title}</div>
            {toast.description ? (
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
                {toast.description}
              </div>
            ) : null}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            style={{
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ title, description = "", type = "info", duration = 2600 }) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, title, description, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
  };

  const value = useMemo(
    () => ({
      toast: pushToast,
      success: (title, description = "") => pushToast({ title, description, type: "success" }),
      error: (title, description = "") =>
        pushToast({ title, description, type: "error", duration: 3200 }),
      info: (title, description = "") => pushToast({ title, description, type: "info" }),
    }),
    []
  );

  return (
    <ToastCtx.Provider value={value}>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {children}
      <ToastViewport toasts={toasts} removeToast={removeToast} />
    </ToastCtx.Provider>
  );
}