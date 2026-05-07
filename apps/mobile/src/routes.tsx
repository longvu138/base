import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import OrdersPage from './pages/Orders';
import ShipmentsPage from './pages/Shipments';
import ClaimsPage from './pages/Claims';
import DeliveryNotesPage from './pages/DeliveryNotes';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout/index';
import AboutPage from './pages/AboutPage';
import { WishlistPage } from './pages/Wishlist/WishlistPage';
import PackagesPage from './pages/Packages';
import TransactionsPage from './pages/Transactions';
import ProfilePage from './pages/Profile';
import AddressPage from './pages/Address';
import DeliveryRequestsPage from './pages/DeliveryRequests';
import WaybillsPage from './pages/Waybills';
import FaqsPage from './pages/Faqs';
import VouchersPage from './pages/Vouchers';
import WithdrawalSlipsPage from './pages/WithdrawalSlips';
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
                    <Route path="shipments" element={<ShipmentsPage />} />
                    <Route path="claims" element={<ClaimsPage />} />
                    <Route path="delivery-notes" element={<DeliveryNotesPage />} />
                    <Route path="packages" element={<PackagesPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="address" element={<AddressPage />} />
                    <Route path="delivery-requests" element={<DeliveryRequestsPage />} />
                    <Route path="waybills" element={<WaybillsPage />} />
                    <Route path="vouchers" element={<VouchersPage />} />
                    <Route path="withdrawal-slips" element={<WithdrawalSlipsPage />} />
                    <Route path="faqs" element={<FaqsPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="about" element={<AboutPage />} />
                </Route>
            </Route>




            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
