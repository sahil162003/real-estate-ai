
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import MyProfile from "../pages/customer/MyProfile";
import PropertySearch from "../pages/customer/PropertySearch";
import PropertyDetails from "../pages/customer/PropertyDetails";
import Favorites from "../pages/customer/Favorites";
import MyInquiries from "../pages/customer/MyInquiries";
import InquiryDetails from "../pages/customer/InquiryDetails";
import BecomeAgent from "../pages/customer/BecomeAgent";

import AdminApplications from "../pages/admin/AdminApplications";

import ProtectedRoute from "../components/common/ProtectedRoute";
import PublicRoute from "../components/common/PublicRoute";
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentProperties from "../pages/agent/AgentProperties";
import AgentAddProperty from "../pages/agent/AgentAddProperty";
import AgentEditProperty from "../pages/agent/AgentEditProperty";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Authenticated customer routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/customer/search" element={<PropertySearch />} />
        <Route path="/customer/profile" element={<MyProfile />} />
        <Route path="/customer/properties/:id" element={<PropertyDetails />} />
        <Route path="/customer/favorites" element={<Favorites />} />
        <Route path="/customer/inquiries" element={<MyInquiries />} />
        <Route
          path="/customer/inquiries/:inquiryId"
          element={<InquiryDetails />}
        />
        <Route path="/customer/become-agent" element={<BecomeAgent />} />
      </Route>

      {/* Admin-only routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route
          path="/admin/applications"
          element={<AdminApplications />}
        />
      </Route>

      {/* Existing placeholders */}
    

{/* Agent-only routes */}
<Route element={<ProtectedRoute allowedRoles={["AGENT"]} />}>
  <Route
    path="/agent/dashboard"
    element={<AgentDashboard />}
  />

  <Route
    path="/agent/properties"
    element={<AgentProperties />}
  />

  <Route
    path="/agent/properties/new"
    element={<AgentAddProperty />}
  />
</Route>
<Route path="/agent/properties/edit/:id" element={<AgentEditProperty />} />



      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
