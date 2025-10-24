import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/hook";

const ProtectedRoute = () => {
  const { user, initialized } = useAppSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
