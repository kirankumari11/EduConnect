import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((store) => store.auth);

  // ⛔ WAIT until auth is resolved
  if (isLoading) {
    return <h1>Checking authentication...</h1>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AuthenticatedUser = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((store) => store.auth);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((store) => store.auth);

  if (isLoading) {
    return <h1>Checking admin access...</h1>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "instructor") {
    return <Navigate to="/" replace />;
  }

  return children;
};
