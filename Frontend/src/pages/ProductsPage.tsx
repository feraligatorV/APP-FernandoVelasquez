import { useEffect, useState } from "react";
import { Alert, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Grid, Typography } from "@mui/material";
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
      <Grid container spacing={2}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card className="h-full rounded-2xl">
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
          </Grid>
        ))}
      </Grid>
    </section>
  );
}
