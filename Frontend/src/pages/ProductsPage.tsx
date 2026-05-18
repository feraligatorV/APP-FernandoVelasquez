import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Typography } from "@mui/material";
import { cartApi } from "../api/cartApi";
import { addGuestItem } from "../api/guestCart";
import { productApi } from "../api/productApi";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types/product";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    productApi
      .list()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function add(product: Product) {
    setAddingProductId(product.id);
    setError("");
    setSuccess("");
    try {
      if (token) {
        await cartApi.add(token, product.id, 1);
        setSuccess("Producto agregado al carrito.");
      } else {
        addGuestItem(product, 1);
        setSuccess("Producto guardado en carrito invitado. Inicia sesión luego para completar la compra.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar el producto");
    } finally {
      setAddingProductId(null);
    }
  }

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
        Productos
      </Typography>
      {!token && <Alert severity="info">Puedes navegar y agregar productos sin iniciar sesión. Solo necesitas iniciar sesión para completar la compra.</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))"
          }
        }}
      >
        {products.map((p) => (
          <Card key={p.id} className="h-full rounded-2xl">
            <CardMedia component="img" image={p.imageUrl} alt={p.name} className="h-44" />
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                {p.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="line-clamp-3">
                {p.description}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={900} className="mt-2">
                ${p.price.toFixed(2)}
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={() => add(p)} disabled={addingProductId === p.id}>
                {addingProductId === p.id ? "Agregando..." : "Agregar al carrito"}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </section>
  );
}
