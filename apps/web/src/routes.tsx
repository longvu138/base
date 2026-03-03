import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/index';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Shipments } from './pages/Shipments';
import { Transactions } from './pages/Transactions';
import { DeliveryRequests } from './pages/DeliveryRequests';
import { DeliveryNotes } from './pages/DeliveryNotes';
import { Waybills } from './pages/Waybills';
import Claims from './pages/Claims';
import WithdrawalSlips from './pages/WithdrawalSlips';
import { Packages } from './pages/Packages';
import Profile from './pages/Profile';


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
                    <Route path="delivery-requests" element={<DeliveryRequests />} />
                    <Route path="delivery-notes" element={<DeliveryNotes />} />
                    <Route path="waybills" element={<Waybills />} />
                    <Route path="claims" element={<Claims />} />
                    <Route path="withdrawal-slips" element={<WithdrawalSlips />} />
                    <Route path="packages" element={<Packages />} />
                    <Route path="profile" element={<Profile />} />

                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default AppRoutes;
