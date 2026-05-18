import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CartPage } from "./pages/CartPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
    isActive ? "bg-orange-500 text-white" : "text-slate-700 hover:bg-orange-100"
  }`;

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function Layout() {
  const { token, logout } = useAuth();

  return (
    <Box className="min-h-screen">
      <AppBar position="sticky" color="transparent" elevation={0} className="backdrop-blur-md border-b border-orange-200">
        <Toolbar className="mx-auto flex w-full max-w-6xl justify-between">
          <Typography variant="h6" className="font-black text-slate-900">
            Tienda Deportiva
          </Typography>
          <Box className="flex flex-wrap items-center gap-2">
            <NavLink to="/products" className={navClass}>
              Productos
            </NavLink>
            <NavLink to="/cart" className={navClass}>
              Carrito
            </NavLink>
            {token && (
              <>
                <NavLink to="/orders" className={navClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/profile" className={navClass}>
                  Perfil
                </NavLink>
              </>
            )}
            {!token ? (
              <Button component={RouterLink} to="/login" variant="contained" size="small">
                Iniciar sesión
              </Button>
            ) : (
              <Button variant="outlined" size="small" onClick={logout}>
                Cerrar sesión
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-5">
        <Outlet />
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
