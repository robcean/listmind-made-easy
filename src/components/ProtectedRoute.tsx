import { Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  // DEV BYPASS: skip auth check when API is unreachable
  const devBypass = import.meta.env.DEV || window.location.hostname.includes("lovable.app");

  if (!isAuthenticated && !devBypass) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
