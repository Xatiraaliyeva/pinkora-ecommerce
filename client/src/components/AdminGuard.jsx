import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminGuard() {
  const loc = useLocation();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role"); 

  if (!token) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (role !== "admin") return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;

  return <Outlet />;
}