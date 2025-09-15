import { useState, useEffect } from "react";
import { VehicleCard } from "./VehicleCard";
import { AppHeader } from "./AppHeader";
import { gpsService, type Vehicle, type Group } from "@/services/gpsService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, Car, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

export function VehicleList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { isTokenValid } = useApp();

  const fetchGroups = async () => {
    if (!isTokenValid) {
      setError("Token nie je nastavený");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const groupData = await gpsService.getGroups();
      setGroups(groupData);
      
      // Auto-select first group if available
      if (groupData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupData[0].code);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Neočekávaná chyba";
      setError(errorMessage);
      toast({
        title: "Chyba",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async (groupCode: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingVehicles(true);
      }
      setError(null);

      const vehicleData = await gpsService.getVehiclesByGroup(groupCode);
      setVehicles(vehicleData);
      
      if (isRefresh) {
        toast({
          title: "Aktualizováno",
          description: `Načteno ${vehicleData.length} vozidel`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Neočekávaná chyba";
      setError(errorMessage);
      toast({
        title: "Chyba",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingVehicles(false);
      setRefreshing(false);
    }
  };

  const handleGroupSelect = (groupCode: string) => {
    setSelectedGroup(groupCode);
    setVehicles([]);
  };

  useEffect(() => {
    if (isTokenValid) {
      fetchGroups();
    }
  }, [isTokenValid]);

  useEffect(() => {
    if (selectedGroup) {
      fetchVehicles(selectedGroup);
    }
  }, [selectedGroup]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">Načítám skupiny...</h2>
          <p className="text-muted-foreground">Připojuji se k GPS Dozor API</p>
        </Card>
      </div>
    );
  }

  if (error && groups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">Chyba připojení</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchGroups()} className="bg-gradient-primary hover:opacity-90">
            Zkusit znovu
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <AppHeader />
      <div className="flex">
        {/* Sidebar with groups */}
        <div className="w-80 bg-card/80 backdrop-blur-sm border-r border-border/50 min-h-screen p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Skupiny</h2>
          </div>

          {groups.length === 0 ? (
            <Card className="p-6 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Žádné skupiny k dispozici</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <Button
                  key={group.code}
                  variant={selectedGroup === group.code ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => handleGroupSelect(group.code)}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-muted-foreground">{group.code}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Main content with vehicles */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">GPS Dozor Dashboard</h1>
                <p className="text-muted-foreground">
                  {selectedGroup ? `Skupina: ${selectedGroup} • ${vehicles.length} vozidel` : "Vyberte skupinu"}
                </p>
              </div>
            </div>
            
            {selectedGroup && (
              <Button
                onClick={() => fetchVehicles(selectedGroup, true)}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2 hover:bg-secondary/80"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Aktualizovat
              </Button>
            )}
          </div>

          {!selectedGroup ? (
            <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Vyberte skupinu</h2>
              <p className="text-muted-foreground">
                Vyberte skupinu ze seznamu vlevo pro zobrazení vozidel.
              </p>
            </Card>
          ) : loadingVehicles ? (
            <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Načítám vozidla...</h2>
              <p className="text-muted-foreground">Skupina: {selectedGroup}</p>
            </Card>
          ) : vehicles.length === 0 ? (
            <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
              <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Žádná vozidla</h2>
              <p className="text-muted-foreground">
                Ve skupině {selectedGroup} nejsou k dispozici žádná vozidla.
              </p>
            </Card>
          ) : (
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-3 pr-2">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.code} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}