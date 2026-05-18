import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setToken(response.token);
      const from = (location.state as { from?: string } | null)?.from ?? "/products";
      navigate(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto mt-10 max-w-xl rounded-3xl">
      <CardContent className="space-y-4 p-6">
        <Typography variant="h4" fontWeight={800}>
          Bienvenido de nuevo
        </Typography>
        <Typography color="text.secondary">Inicia sesión para continuar con tu carrito y pedidos.</Typography>
        <Box component="form" onSubmit={onSubmit} className="space-y-3">
          <TextField label="Correo" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Iniciar sesión"}
          </Button>
        </Box>
        <Typography>
          <Button component={Link} to="/forgot-password" variant="outlined" size="small">
            ¿Olvidaste tu contraseña?
          </Button>
        </Typography>
        <Typography>
          <Button component={Link} to="/register" variant="outlined" size="small">
            Regístrate
          </Button>
        </Typography>
      </CardContent>
    </Card>
  );
}
