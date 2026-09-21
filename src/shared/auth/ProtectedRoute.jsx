import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import authStorage from "../storage/authStorage";
import { ROUTES } from "../constants/routes";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const user = useSelector((state) => state.user?.user);
  const storedUser = authStorage.getUser();
  const token = authStorage.getToken();
  const currentUser = user?.role ? user : storedUser;
  const hasAccess =
    Boolean(token && currentUser?.role) &&
    (allowedRoles.length === 0 || allowedRoles.includes(currentUser.role));

  if (!hasAccess) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default ProtectedRoute;
