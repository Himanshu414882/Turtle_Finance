import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Add Navigate here

import LoginPage from "./pages/LoginPage";
import AdminPrivateRoutes from "../ProtectedRoutes/AdminPrivateRoutes";
import ClientPrivateRoute from "../ProtectedRoutes/ClientPrivateRoutes";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";

const App = () => {
  return (
    <Routes>
      {/* Redirect from root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/adminautharized/*"
        element={
          <AdminPrivateRoutes>
            <AdminLayout />
          </AdminPrivateRoutes>
        }
      />

<Route
  path="/clientautharized/*"
  element={
    <ClientPrivateRoute>
      <ClientLayout />
    </ClientPrivateRoute>
  }
/>
    </Routes>


  );
};

export default App;
