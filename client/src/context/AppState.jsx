import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../api/http";
import { ToastProvider } from "./ToastContext";

const Ctx = createContext(null);
export const useAppState = () => useContext(Ctx);

export function AppStateProvider({ children }) {
  const [me, setMe] = useState(null);

  const loadMe = async () => {
    if (!tokenStore.accessToken) return setMe(null);
    try {
      const r = await api.get("/auth/me");
      setMe(r.data);
    } catch {
      setMe(null);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <Ctx.Provider value={{ me, setMe, loadMe }}>
      <ToastProvider>{children}</ToastProvider>
    </Ctx.Provider>
  );
}