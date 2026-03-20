import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  TrendingDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [expandedComparison, setExpandedComparison] = useState<number | null>(null);

  // Fetch cart and comparison data
  const cartQuery = trpc.cart.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const comparisonQuery = trpc.comparison.compareCart.useQuery(undefined, {
    enabled: isAuthenticated && (cartQuery.data?.items.length ?? 0) > 0,
  });

  // Mutations
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation();
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const clearCartMutation = trpc.cart.clear.useMutation();

  const cart = cartQuery.data;
  const comparison = comparisonQuery.data || [];

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      await updateQuantityMutation.mutateAsync({
        cartItemId,
        quantity: newQuantity,
      });
      cartQuery.refetch();
      comparisonQuery.refetch();
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeItemMutation.mutateAsync({ cartItemId });
      cartQuery.refetch();
      comparisonQuery.refetch();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      await clearCartMutation.mutateAsync();
      cartQuery.refetch();
      comparisonQuery.refetch();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your cart
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (cartQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading cart...</div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[oklch(0.96_0.01_40)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          {!isEmpty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              disabled={clearCartMutation.isPending}
            >
              Clear Cart
            </Button>
          )}
        </div>
      </nav>

      <div className="container py-8">
        {isEmpty ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to compare prices across platforms
            </p>
            <Link href="/">
              <Button className="bg-[oklch(0.65_0.25_25)] hover:bg-[oklch(0.60_0.25_25)] text-white font-bold">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Items in Cart ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.product?.imageUrl || ""}
                          alt={item.product?.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.product?.name || "Product")}`;
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {item.product?.standardQuantity} {item.product?.unit}
                        </p>

                        {/* Cheapest Price */}
                        {item.prices && item.prices.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-1">
                              Cheapest Price
                            </p>
                            <p className="text-lg font-bold text-[oklch(0.65_0.25_25)]">
                              ₹
                              {(
                                Math.min(...item.prices.map((p) => p.finalPrice)) / 100
                              ).toFixed(2)}
                            </p>
                          </div>
                        )}

                        {/* Quantity Control */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-semibold text-foreground">
                            Qty:
                          </label>
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={updateQuantityMutation.isPending}
                              className="px-3 py-1 hover:bg-muted transition-colors"
                            >
                              −
                            </button>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.id,
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              className="w-12 text-center border-0"
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={updateQuantityMutation.isPending}
                              className="px-3 py-1 hover:bg-muted transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="ml-auto p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Platform Comparison */}
            {comparison.length > 0 && (
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Platform Prices
                </h2>
                <div className="space-y-4">
                  {comparison
                    .sort((a, b) => a.totalWithDelivery - b.totalWithDelivery)
                    .map((platform, index) => (
                      <Card
                        key={platform.platformId}
                        className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                          index === 0
                            ? "border-2 border-[oklch(0.65_0.25_25)] bg-[oklch(0.65_0.25_25)]/5"
                            : ""
                        }`}
                        onClick={() =>
                          setExpandedComparison(
                            expandedComparison === platform.platformId
                              ? null
                              : platform.platformId
                          )
                        }
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-foreground mb-1">
                              {platform.platformName}
                            </h3>
                            {index === 0 && (
                              <div className="flex items-center gap-1 text-xs font-bold text-[oklch(0.65_0.25_25)]">
                                <TrendingDown className="w-3 h-3" />
                                Best Price
                              </div>
                            )}
                          </div>
                          {index === 0 && (
                            <Check className="w-5 h-5 text-[oklch(0.65_0.25_25)]" />
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold text-foreground">
                              ₹{(platform.totalPrice / 100).toFixed(2)}
                            </span>
                          </div>
                          {platform.deliveryFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Delivery</span>
                              <span className="font-semibold text-foreground">
                                ₹{(platform.deliveryFee / 100).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-border pt-2 flex justify-between">
                            <span className="font-bold text-foreground">Total</span>
                            <span className="text-2xl font-black text-[oklch(0.65_0.25_25)]">
                              ₹{(platform.totalWithDelivery / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {platform.savings !== undefined && platform.savings > 0 && (
                          <div className="bg-[oklch(0.75_0.20_80)]/10 border border-[oklch(0.75_0.20_80)] rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                              Save up to
                            </p>
                            <p className="text-lg font-black text-[oklch(0.75_0.20_80)]">
                              ₹{(platform.savings / 100).toFixed(2)}
                            </p>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedComparison === platform.platformId && (
                          <div className="mt-4 pt-4 border-t border-border space-y-2">
                            {platform.items.map((item) => (
                              <div
                                key={item.productId}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {item.productName} x{item.quantity}
                                </span>
                                <span className="font-semibold text-foreground">
                                  ₹{(item.totalPrice / 100).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button className="w-full mt-4 bg-[oklch(0.65_0.15_150)] hover:bg-[oklch(0.60_0.15_150)] text-white font-bold">
                          Buy on {platform.platformName}
                        </Button>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
