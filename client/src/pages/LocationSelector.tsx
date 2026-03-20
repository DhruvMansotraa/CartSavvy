import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Check } from "lucide-react";
import { toast } from "sonner";

interface City {
  id: number;
  name: string;
  code: string;
  state: string;
}

interface DeliveryZone {
  id: number;
  pincode: string;
  areaName: string;
  deliveryTimeMinutes: number;
  isServiceable: boolean;
}

export default function LocationSelector() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"city" | "zone">("city");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [address, setAddress] = useState("");

  // Fetch cities
  const { data: cities, isLoading: citiesLoading } = trpc.location.getCities.useQuery();

  // Search cities
  const { data: searchResults } = trpc.location.searchCities.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Fetch delivery zones
  const { data: zones, isLoading: zonesLoading } = trpc.location.getDeliveryZones.useQuery(
    { cityId: selectedCity?.id || 0 },
    { enabled: !!selectedCity }
  );

  // Set location mutation
  const setLocationMutation = trpc.location.setUserLocation.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set location");
    },
  });

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setStep("zone");
  };

  const handleZoneSelect = (zone: DeliveryZone) => {
    setSelectedZone(zone);
  };

  const handleConfirmLocation = () => {
    if (!selectedCity || !selectedZone) {
      toast.error("Please select both city and delivery zone");
      return;
    }

    setLocationMutation.mutate({
      cityId: selectedCity.id,
      deliveryZoneId: selectedZone.id,
      pincode: selectedZone.pincode,
      address,
    });
  };

  const displayCities = searchQuery ? searchResults : cities;

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-100 to-peach-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-black drop-shadow-lg">
              Select Your Location
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            We'll show you prices based on your delivery area
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-4 mb-8">
          <div
            className={`flex-1 h-2 rounded-full transition-all ${
              step === "city" || selectedCity ? "bg-coral-500" : "bg-gray-300"
            }`}
          />
          <div
            className={`flex-1 h-2 rounded-full transition-all ${
              step === "zone" && selectedCity ? "bg-coral-500" : "bg-gray-300"
            }`}
          />
        </div>

        {/* City Selection */}
        {step === "city" && (
          <Card className="p-6 mb-6 border-2 border-white shadow-lg">
            <h2 className="text-xl font-bold text-black mb-4">Choose Your City</h2>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 border-2 border-gray-300 rounded-lg focus:border-coral-500 focus:outline-none"
              />
            </div>

            {/* City List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {citiesLoading ? (
                <div className="text-center py-8 text-gray-600">Loading cities...</div>
              ) : displayCities && displayCities.length > 0 ? (
                displayCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-coral-500 hover:bg-coral-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-black group-hover:text-coral-600">
                          {city.name}
                        </p>
                        <p className="text-sm text-gray-600">{city.state}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-coral-500" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">No cities found</div>
              )}
            </div>
          </Card>
        )}

        {/* Zone Selection */}
        {step === "zone" && selectedCity && (
          <Card className="p-6 mb-6 border-2 border-white shadow-lg">
            <div className="mb-6">
              <button
                onClick={() => {
                  setStep("city");
                  setSelectedCity(null);
                }}
                className="text-coral-600 hover:text-coral-700 font-semibold flex items-center gap-2"
              >
                ← Change City
              </button>
            </div>

            <h2 className="text-xl font-bold text-black mb-2">
              Select Delivery Zone in {selectedCity.name}
            </h2>
            <p className="text-gray-600 mb-6">Choose your area for accurate pricing</p>

            {/* Zone List */}
            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              {zonesLoading ? (
                <div className="text-center py-8 text-gray-600">Loading zones...</div>
              ) : zones && zones.length > 0 ? (
                zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneSelect(zone)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedZone?.id === zone.id
                        ? "border-coral-500 bg-coral-50"
                        : "border-gray-200 hover:border-coral-500 hover:bg-coral-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-black">{zone.areaName}</p>
                        <p className="text-sm text-gray-600">
                          Pincode: {zone.pincode} • {zone.deliveryTimeMinutes} mins delivery
                        </p>
                      </div>
                      {selectedZone?.id === zone.id && (
                        <Check className="w-5 h-5 text-coral-600" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">No zones available</div>
              )}
            </div>

            {/* Address Input */}
            {selectedZone && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Full Address (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="py-2 border-2 border-gray-300 rounded-lg focus:border-coral-500 focus:outline-none"
                />
              </div>
            )}

            {/* Confirm Button */}
            {selectedZone && (
              <Button
                onClick={handleConfirmLocation}
                disabled={setLocationMutation.isPending}
                className="w-full bg-coral-600 hover:bg-coral-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                {setLocationMutation.isPending ? "Setting Location..." : "Confirm Location"}
              </Button>
            )}
          </Card>
        )}

        {/* Floating Geometric Elements */}
        <div className="fixed top-10 right-10 w-24 h-24 bg-mint-300 rounded-full opacity-30 blur-xl" />
        <div className="fixed bottom-20 left-10 w-32 h-32 bg-lilac-300 rounded-3xl opacity-20 blur-2xl transform rotate-45" />
        <div className="fixed top-1/2 right-1/4 w-20 h-20 bg-yellow-300 opacity-25 blur-lg transform -rotate-12" />
      </div>
    </div>
  );
}
