import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // Check auth token (Shared logic)
    const isAuthenticated = !!localStorage.getItem('access_token');

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
