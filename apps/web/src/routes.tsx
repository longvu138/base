import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/index";
import { Login } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { OrderDetail } from "./pages/OrderDetail";
import { Shipments } from "./pages/Shipments";
import { ShipmentDetail } from "./pages/ShipmentDetail";
import { DeliveryRequests } from "./pages/DeliveryRequests";
import { CreateDelivery } from "./pages/CreateDelivery";
import { DeliveryNotes } from "./pages/DeliveryNotes";
import { Waybills } from "./pages/Waybills";
import Claims from "./pages/Claims";
import CreateClaim from "./pages/CreateClaim";
import WithdrawalSlips from "./pages/WithdrawalSlips";
import { Packages } from "./pages/Packages";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import ThemeConfigurator from "./pages/ThemeConfigurator";

import PrivateRoute from "./components/PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:code" element={<OrderDetail />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="shipments/:code" element={<ShipmentDetail />} />
          <Route
            path="transactions"
            element={<Navigate to="/profile?tab=transactions" replace />}
          />
          <Route path="delivery/create" element={<CreateDelivery />} />
          <Route path="delivery-requests" element={<DeliveryRequests />} />
          <Route path="delivery-notes" element={<DeliveryNotes />} />
          <Route path="waybills" element={<Waybills />} />
          <Route path="claims" element={<Claims />} />
          <Route path="tickets/create" element={<CreateClaim />} />
          <Route path="withdrawal-slips" element={<WithdrawalSlips />} />
          <Route path="packages" element={<Packages />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="vouchers"
            element={<Navigate to="/profile?tab=vouchers" replace />}
          />
          <Route
            path="wishlist"
            element={<Navigate to="/profile?tab=saved-products" replace />}
          />

          <Route
            path="faqs"
            element={<Navigate to="/profile?tab=faqs" replace />}
          />
          <Route path="notifications" element={<Notifications />} />
          <Route path="theme-configurator" element={<ThemeConfigurator />} />

          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
