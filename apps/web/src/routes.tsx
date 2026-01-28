import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Shipments } from './pages/Shipments';
import { Transactions } from './pages/Transactions';

import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="shipments" element={<Shipments />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default AppRoutes;
