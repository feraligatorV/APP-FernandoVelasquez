import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { cartApi } from "../api/cartApi";
import { clearGuestCart, getGuestCart, setGuestCart } from "../api/guestCart";
import { useAuth } from "../context/AuthContext";
import type { CartSummary } from "../types/cart";

type GuestView = {
  items: Array<{ id: number; productId: number; name: string; unitPrice: number; quantity: number; lineTotal: number }>;
  totalAmount: number;
};

export function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [guestItemsVersion, setGuestItemsVersion] = useState(0);

  const guestView: GuestView = useMemo(() => {
    const guest = getGuestCart();
    const items = guest.map((g) => ({
      id: g.productId,
      productId: g.productId,
      name: g.name,
      unitPrice: g.unitPrice,
      quantity: g.quantity,
      lineTotal: g.unitPrice * g.quantity
    }));
    const totalAmount = items.reduce((acc, i) => acc + i.lineTotal, 0);
    return { items, totalAmount };
  }, [guestItemsVersion]);

  async function syncGuestToServer(authToken: string) {
    const guest = getGuestCart();
    if (guest.length === 0) return;
    for (const item of guest) {
      await cartApi.add(authToken, item.productId, item.quantity);
    }
    clearGuestCart();
    setGuestItemsVersion((x) => x + 1);
  }

  async function load() {
    setError("");
    setMessage("");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      await syncGuestToServer(token);
      const data = await cartApi.get(token);
      setCart(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function removeItem(id: number) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (token) {
        const data = await cartApi.remove(token, id);
        setCart(data);
      } else {
        const filtered = getGuestCart().filter((i) => i.productId !== id);
        setGuestCart(filtered);
        setGuestItemsVersion((x) => x + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el producto");
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!token) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      const response = await cartApi.checkout(token);
      setMessage(`Pedido creado: #${response.orderId}`);
      const data = await cartApi.get(token);
      setCart(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la compra");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  const source = token ? cart : (guestView as unknown as CartSummary);
  const items = source?.items ?? [];

  return (
    <section className="space-y-3">
      <Typography variant="h4" fontWeight={800}>
        Carrito
      </Typography>
      {!token && <Alert severity="info">Estás usando carrito invitado. Debes iniciar sesión para completar el pedido.</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {items.length === 0 ? (
        <Typography color="text.secondary">Tu carrito está vacío.</Typography>
      ) : (
        <>
          <Stack spacing={1}>
            {items.map((item) => (
              <Card key={item.id} className="rounded-2xl">
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <Typography fontWeight={700}>{item.name}</Typography>
                  <Typography color="text.secondary">
                    {item.quantity} x ${item.unitPrice.toFixed(2)}
                  </Typography>
                  <Typography fontWeight={800}>${item.lineTotal.toFixed(2)}</Typography>
                  <Button color="error" variant="outlined" onClick={() => removeItem(item.id)} disabled={busy}>
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Typography variant="h5" fontWeight={900}>
            Total: ${(source?.totalAmount ?? 0).toFixed(2)}
          </Typography>
          <Button variant="contained" onClick={checkout} disabled={busy}>
            {busy ? "Procesando..." : token ? "Finalizar compra" : "Iniciar sesión para comprar"}
          </Button>
        </>
      )}
    </section>
  );
}
