import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Search, ShoppingCart, Zap, TrendingUp, Heart } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // Fetch data
  const categoriesQuery = trpc.products.getCategories.useQuery();
  const trendingQuery = trpc.products.getTrending.useQuery({ limit: 6 });
  const dealsQuery = trpc.products.getBestDeals.useQuery({ limit: 6 });
  const searchQuery_trpc = trpc.products.search.useQuery(
    { query: searchQuery, category: selectedCategory, limit: 12 },
    { enabled: searchQuery.length > 0 }
  );

  const categories = categoriesQuery.data || [];
  const trending = trendingQuery.data || [];
  const deals = dealsQuery.data || [];
  const searchResults = searchQuery_trpc.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by the query above
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[oklch(0.96_0.01_40)] relative overflow-hidden">
      {/* Memphis Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[oklch(0.65_0.15_150)] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-5 w-40 h-40 rounded-full bg-[oklch(0.70_0.18_270)] opacity-15 animate-pulse" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-[oklch(0.75_0.20_80)] opacity-15 rotate-45 animate-pulse" style={{ animationDelay: "2s" }}></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.70_0.18_270)] rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-foreground">QuickCompare</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </Button>
                </Link>
                <Link href="/saved">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-5 h-5" />
                    Saved
                  </Button>
                </Link>
                <div className="text-sm text-muted-foreground">
                  {user?.name}
                </div>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container py-12 md:py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            Find the Cheapest Groceries Instantly
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Compare prices across Blinkit, Zepto, and Swiggy Instamart. Save money on every purchase.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for milk, bread, eggs, fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-base"
              />
            </div>
            <Button type="submit" className="bg-[oklch(0.65_0.25_25)] hover:bg-[oklch(0.60_0.25_25)] text-white font-bold">
              Search
            </Button>
          </form>

          {/* Category Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  !selectedCategory
                    ? "bg-[oklch(0.65_0.25_25)] text-white"
                    : "bg-muted text-foreground hover:bg-border"
                }`}
              >
                All
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-[oklch(0.65_0.25_25)] text-white"
                      : "bg-muted text-foreground hover:bg-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-6">Search Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                    <div className="p-4">
                      <div className="w-full h-40 bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(product.name)}`;
                          }}
                        />
                      </div>
                      <h4 className="font-bold text-foreground mb-2">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.standardQuantity}{product.unit}
                      </p>
                      <Button className="w-full bg-[oklch(0.65_0.15_150)] hover:bg-[oklch(0.60_0.15_150)] text-white font-bold">
                        Compare Prices
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending Products */}
        {trending.length > 0 && searchResults.length === 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-[oklch(0.65_0.25_25)]" />
              <h3 className="text-2xl font-bold text-foreground">Trending Now</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                    <div className="p-4">
                      <div className="w-full h-40 bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(product.name)}`;
                          }}
                        />
                      </div>
                      <h4 className="font-bold text-foreground mb-2">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.standardQuantity}{product.unit}
                      </p>
                      <Button className="w-full bg-[oklch(0.65_0.15_150)] hover:bg-[oklch(0.60_0.15_150)] text-white font-bold">
                        Compare Prices
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Best Deals */}
        {deals.length > 0 && searchResults.length === 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-[oklch(0.75_0.20_80)]" />
              <h3 className="text-2xl font-bold text-foreground">Best Deals Today</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <Link key={deal.productId} href={`/product/${deal.productId}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-[oklch(0.75_0.20_80)]">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white bg-[oklch(0.75_0.20_80)] px-3 py-1 rounded-full">
                          {deal.reason}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground mb-2">{deal.productName}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        on {deal.platform}
                      </p>
                      <Button className="w-full bg-[oklch(0.75_0.20_80)] hover:bg-[oklch(0.70_0.20_80)] text-white font-bold">
                        View Deal
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {searchResults.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[oklch(0.65_0.25_25)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Quick Search</h4>
              <p className="text-sm text-muted-foreground">
                Find any product instantly across all platforms
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[oklch(0.65_0.15_150)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Smart Cart</h4>
              <p className="text-sm text-muted-foreground">
                Compare your entire cart across platforms
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[oklch(0.70_0.18_270)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Save Money</h4>
              <p className="text-sm text-muted-foreground">
                Get instant savings recommendations
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16 relative z-10">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 QuickCompare. Compare prices. Save money. Shop smart.</p>
        </div>
      </footer>
    </div>
  );
}
