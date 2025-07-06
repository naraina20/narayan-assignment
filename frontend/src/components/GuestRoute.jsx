import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const GuestRoute = () => {
  return (isAuthenticated() ? <Navigate to="/" replace /> : <Outlet />)
};

export default GuestRoute;
