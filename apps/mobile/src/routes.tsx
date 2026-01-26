import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import OrdersPage from './pages/Orders';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import AboutPage from './pages/AboutPage';
import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="about" element={<AboutPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
