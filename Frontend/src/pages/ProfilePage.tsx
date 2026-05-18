import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import type { UpdateUserProfileRequest, UserProfile } from "../types/user";

export function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UpdateUserProfileRequest>({
    firstName: "",
    lastName: "",
    shippingAddress: "",
    birthDate: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    userApi
      .me(token)
      .then((data) => {
        setProfile(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          shippingAddress: data.shippingAddress,
          birthDate: data.birthDate
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!profile) return <Alert severity="error">{error || "Perfil no disponible"}</Alert>;

  async function saveProfile() {
    if (!token) return;
    setError("");
    setSuccess("");

    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
      setError("Nombre y apellido deben tener al menos 2 caracteres.");
      return;
    }
    if (form.shippingAddress.trim().length < 8) {
      setError("La dirección de envío debe tener al menos 8 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const updated = await userApi.updateMe(token, form);
      setProfile(updated);
      setSuccess("Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    if (!profile) return;
    setIsEditing(false);
    setError("");
    setSuccess("");
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      shippingAddress: profile.shippingAddress,
      birthDate: profile.birthDate
    });
  }

  return (
    <section>
      <Card className="rounded-3xl">
        <CardContent className="space-y-4">
          <Typography variant="h4" fontWeight={800}>
            Mi perfil
          </Typography>
          <Typography color="text.secondary">Correo: {profile.email}</Typography>

          {!isEditing ? (
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Editar perfil
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={saveProfile} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button variant="outlined" onClick={cancelEdit} disabled={saving}>
                Cancelar
              </Button>
            </Stack>
          )}

          <Box className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Nombre"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={!isEditing}
            />
            <TextField
              label="Apellido"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={!isEditing}
            />
            <TextField
              label="Dirección de envío"
              value={form.shippingAddress}
              onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              disabled={!isEditing}
              className="md:col-span-2"
            />
            <TextField
              label="Fecha de nacimiento"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              disabled={!isEditing}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </CardContent>
      </Card>
    </section>
  );
}
