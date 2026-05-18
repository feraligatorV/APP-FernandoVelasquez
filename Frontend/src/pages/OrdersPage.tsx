import { useEffect, useState } from "react";
import { Alert, Avatar, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { cartApi } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/order";

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    cartApi
      .listOrders(token)
      .then(setOrders)
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

  return (
    <section className="space-y-3">
      <Typography variant="h4" fontWeight={800}>
        Historial de pedidos
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {orders.length === 0 ? (
        <Typography color="text.secondary">Aún no tienes pedidos.</Typography>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card key={order.id} className="rounded-2xl">
              <CardContent className="space-y-2">
                <Typography variant="h6" fontWeight={800}>
                  Pedido #{order.id}
                </Typography>
                <Typography color="text.secondary">Fecha: {new Date(order.createdAt).toLocaleString()}</Typography>
                <Typography fontWeight={800}>Total: ${order.totalAmount.toFixed(2)}</Typography>
                <Stack spacing={1} className="pt-2">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.productId}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-100 bg-white p-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={item.imageUrl} alt={item.name} variant="rounded" sx={{ width: 44, height: 44 }} />
                        <Typography fontWeight={700}>{item.name}</Typography>
                      </div>
                      <Typography color="text.secondary">
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                      </Typography>
                      <Typography fontWeight={800}>${item.lineTotal.toFixed(2)}</Typography>
                    </div>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </section>
  );
}
