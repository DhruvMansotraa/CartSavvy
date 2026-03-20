import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart, ArrowLeft, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Saved() {
  const { isAuthenticated } = useAuth();

  // Fetch saved products
  const savedQuery = trpc.saved.getList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const removeSavedMutation = trpc.saved.remove.useMutation();

  const saved = savedQuery.data || [];

  const handleRemove = async (productId: number) => {
    try {
      await removeSavedMutation.mutateAsync({ productId });
      savedQuery.refetch();
      toast.success("Removed from saved");
    } catch (error) {
      toast.error("Failed to remove product");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your saved products
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-foreground">Saved Products</h1>
        </div>
      </nav>

      <div className="container py-8">
        {savedQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : saved.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No Saved Products
            </h2>
            <p className="text-muted-foreground mb-6">
              Save products to track prices and get notifications
            </p>
            <Link href="/">
              <Button className="bg-[oklch(0.65_0.25_25)] hover:bg-[oklch(0.60_0.25_25)] text-white font-bold">
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {saved.length} Saved Product{saved.length !== 1 ? "s" : ""}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground mb-2">
                        Product #{item.productId}
                      </h3>
                      {item.notifyOnPriceDrop && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-[oklch(0.75_0.20_80)]">
                          <TrendingDown className="w-3 h-3" />
                          Price alerts enabled
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removeSavedMutation.isPending}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Heart className="w-5 h-5 text-[oklch(0.65_0.25_25)] fill-current" />
                    </button>
                  </div>

                  {item.lastKnownPrice && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Last Known Price
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        ₹{(item.lastKnownPrice / 100).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {item.notifyOnPriceDrop
                          ? "You'll be notified on price drops"
                          : "Notifications disabled"}
                      </span>
                    </div>
                  </div>

                  <Link href={`/product/${item.productId}`}>
                    <Button className="w-full bg-[oklch(0.65_0.15_150)] hover:bg-[oklch(0.60_0.15_150)] text-white font-bold">
                      View Product
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
