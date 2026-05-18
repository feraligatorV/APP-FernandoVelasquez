import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    shippingAddress: "",
    email: "",
    birthDate: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
      setError("Nombre y apellido deben tener al menos 2 caracteres.");
      return;
    }
    if (form.shippingAddress.trim().length < 8) {
      setError("La dirección de envío debe tener al menos 8 caracteres.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (!PASSWORD_RULE.test(form.password)) {
      setError("La contraseña debe tener 8-72 caracteres e incluir mayúscula, minúscula y número.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register(form);
      setToken(response.token);
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto mt-8 max-w-2xl rounded-3xl">
      <CardContent className="space-y-4 p-6">
        <Typography variant="h4" fontWeight={800}>
          Crear cuenta
        </Typography>
        <Box component="form" onSubmit={onSubmit} className="grid gap-3">
          <TextField label="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} fullWidth required />
          <TextField label="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} fullWidth required />
          <TextField
            label="Dirección de envío"
            value={form.shippingAddress}
            onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
            fullWidth
            required
          />
          <TextField label="Correo" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth required />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth
            required
            helperText="8+ caracteres, mayúscula, minúscula y número."
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Crear cuenta"}
          </Button>
        </Box>
        <Typography>
          <Button component={Link} to="/login" variant="outlined" size="small">
            Inicia sesión
          </Button>
        </Typography>
      </CardContent>
    </Card>
  );
}
