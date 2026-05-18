import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { authApi } from "../api/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  async function onRequestToken(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoadingRequest(true);
    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.message);
      if (response.resetToken) {
        setToken(response.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo solicitar recuperación");
    } finally {
      setLoadingRequest(false);
    }
  }

  async function onResetPassword(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoadingReset(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña");
    } finally {
      setLoadingReset(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-3xl">
        <CardContent className="space-y-4">
          <Typography variant="h5" fontWeight={800}>
            Recuperar contraseña
          </Typography>
          <Typography color="text.secondary">
            Ingresa tu correo para generar un token de recuperación.
          </Typography>
          <Box component="form" onSubmit={onRequestToken} className="space-y-3">
            <TextField
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" fullWidth disabled={loadingRequest}>
              {loadingRequest ? <CircularProgress size={22} color="inherit" /> : "Generar token"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="space-y-4">
          <Typography variant="h5" fontWeight={800}>
            Restablecer contraseña
          </Typography>
          <Typography color="text.secondary">
            Usa el token generado y define tu nueva contraseña.
          </Typography>
          <Box component="form" onSubmit={onResetPassword} className="space-y-3">
            <TextField
              label="Token de recuperación"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              helperText="8+ caracteres, mayúscula, minúscula y número."
            />
            <Button type="submit" variant="contained" fullWidth disabled={loadingReset}>
              {loadingReset ? <CircularProgress size={22} color="inherit" /> : "Actualizar contraseña"}
            </Button>
          </Box>
          <Typography>
            <Link to="/login">Volver a iniciar sesión</Link>
          </Typography>
        </CardContent>
      </Card>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
}
