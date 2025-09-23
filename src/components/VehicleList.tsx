import { AppHeader } from "./AppHeader";
import { Card } from "@/components/ui/card";
import { Car, Key, Users, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function VehicleList() {
  const { mode, token, isUserToken, selectedGroup } = useApp();

  const renderDevModeContent = () => {
    // Krok 1: Zadať token
    if (!token || !isUserToken) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant mb-8">
            <Key className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Vložte token pre vývoj</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Pre pokračovanie vo vývoji je potrebné zadať platný API token v hlavičke aplikácie.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">1</div>
            <span>Zadajte token do poľa v hlavičke</span>
          </div>
        </div>
      );
    }

    // Krok 2: Vybrať skupinu
    if (!selectedGroup) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant mb-8">
            <Users className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Vyberte skupinu</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Token je platný! Teraz si vyberte skupinu zariadení z rozbaľovacieho menu v hlavičke.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground/60">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span>Token zadaný ✓</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">2</div>
              <span>Vyberte skupinu z rozbaľovacieho menu</span>
            </div>
          </div>
        </div>
      );
    }

    // Krok 3: Všetko nastavené - zobrazovať šablónu
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">GPS Dozor Dashboard</h1>
              <p className="text-muted-foreground">
                Template pre GPS tracking aplikáciu
              </p>
            </div>
          </div>
        </div>

        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">GPS Dozor Template</h2>
          <p className="text-muted-foreground mb-4">
            Šablóna je pripravená pre implementáciu GPS tracking funkcionalít.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80">
            <CheckCircle className="w-4 h-4" />
            <span>Skupina: {selectedGroup}</span>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <AppHeader />
      <div className="p-6">
        {mode === 'dev' ? renderDevModeContent() : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">GPS Dozor Dashboard</h1>
                  <p className="text-muted-foreground">
                    Template pre GPS tracking aplikáciu
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
              <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">GPS Dozor Template</h2>
              <p className="text-muted-foreground">
                Šablóna je pripravená pre implementáciu GPS tracking funkcionalít.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}