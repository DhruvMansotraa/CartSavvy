import { useState } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Check,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { productId } = useParams<{ productId?: string }>();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);

  const id = productId ? parseInt(productId, 10) : 0;

  // Fetch product details
  const productQuery = trpc.products.getDetails.useQuery(
    { productId: id },
    { enabled: id > 0 }
  );

  // Mutations
  const addToCartMutation = trpc.cart.addItem.useMutation();
  const saveProductMutation = trpc.saved.save.useMutation();
  const removeSavedMutation = trpc.saved.remove.useMutation();

  const product = productQuery.data;

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Product Not Found
          </h2>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const prices = product.prices || [];
  const cheapestPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.finalPrice)) : 0;
  const mostExpensivePrice = prices.length > 0 ? Math.max(...prices.map((p) => p.finalPrice)) : 0;
  const savings = mostExpensivePrice - cheapestPrice;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      toast.success(`Added ${quantity} to cart`);
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleSaveProduct = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save products");
      return;
    }

    try {
      if (isSaved) {
        await removeSavedMutation.mutateAsync({ productId: product.id });
        setIsSaved(false);
        toast.success("Removed from saved");
      } else {
        await saveProductMutation.mutateAsync({ productId: product.id });
        setIsSaved(true);
        toast.success("Added to saved");
      }
    } catch (error) {
      toast.error("Failed to update saved products");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[oklch(0.96_0.01_40)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Product Details</h1>
        </div>
      </nav>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div>
            <Card className="p-8 flex items-center justify-center h-96 bg-muted">
              <img
                src={product.imageUrl || ""}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(product.name)}`;
                }}
              />
            </Card>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <span className="inline-block bg-[oklch(0.65_0.15_150)] text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl font-black text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {product.standardQuantity} {product.unit}
              </p>
              <p className="text-base text-foreground">{product.description}</p>
            </div>

            {/* Pricing Summary */}
            {prices.length > 0 && (
              <Card className="p-6 mb-6 bg-gradient-to-br from-[oklch(0.65_0.25_25)]/10 to-[oklch(0.65_0.15_150)]/10 border-2 border-[oklch(0.65_0.25_25)]/30">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cheapest</p>
                    <p className="text-2xl font-bold text-[oklch(0.65_0.25_25)]">
                      ₹{(cheapestPrice / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Most Expensive</p>
                    <p className="text-2xl font-bold text-destructive">
                      ₹{(mostExpensivePrice / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Save Up To</p>
                    <p className="text-2xl font-bold text-[oklch(0.75_0.20_80)]">
                      ₹{(savings / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <label className="font-semibold text-foreground">Quantity:</label>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  −
                </button>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 bg-[oklch(0.65_0.25_25)] hover:bg-[oklch(0.60_0.25_25)] text-white font-bold py-6 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleSaveProduct}
                variant={isSaved ? "default" : "outline"}
                disabled={removeSavedMutation.isPending || saveProductMutation.isPending}
                className="px-6"
              >
                <Heart
                  className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Pricing Comparison */}
        {prices.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Prices Across Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prices
                .sort((a, b) => a.finalPrice - b.finalPrice)
                .map((price, index) => (
                  <Card
                    key={price.platformId}
                    className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${
                      index === 0 ? "border-2 border-[oklch(0.65_0.25_25)]" : ""
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute top-4 right-4 bg-[oklch(0.65_0.25_25)] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Best Price
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {price.platformName}
                    </h3>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-3xl font-black text-foreground">
                        ₹{(price.finalPrice / 100).toFixed(2)}
                      </p>
                      {price.discountPercent > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm line-through text-muted-foreground">
                            ₹{(price.price / 100).toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-[oklch(0.75_0.20_80)]">
                            {price.discountPercent}% off
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Delivery</p>
                      <p className="font-semibold text-foreground">
                        {price.deliveryTime} mins
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2">
                        {price.stockStatus === "in_stock" && (
                          <>
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-semibold text-green-600">
                              In Stock
                            </span>
                          </>
                        )}
                        {price.stockStatus === "low_stock" && (
                          <>
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-semibold text-yellow-600">
                              Low Stock
                            </span>
                          </>
                        )}
                        {price.stockStatus === "out_of_stock" && (
                          <>
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <span className="text-sm font-semibold text-destructive">
                              Out of Stock
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button className="w-full bg-[oklch(0.65_0.15_150)] hover:bg-[oklch(0.60_0.15_150)] text-white font-bold">
                      Buy on {price.platformName}
                    </Button>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
