import { AppHeader } from "./AppHeader";
import { Card } from "@/components/ui/card";
import { Car, Key, Users, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function VehicleList() {
  const { mode, token, isUserToken, selectedGroup } = useApp();

  const renderDevModeContent = () => {
    const hasToken = token && isUserToken;
    const hasGroup = Boolean(selectedGroup);
    const isComplete = hasToken && hasGroup;

    const steps = [
      {
        number: 1,
        title: "Zadajte API token",
        description: "Vložte platný token do poľa v hlavičke aplikácie",
        icon: Key,
        completed: hasToken,
        current: !hasToken,
      },
      {
        number: 2,
        title: "Vyberte skupinu",
        description: "Zvoľte skupinu zariadení z rozbaľovacieho menu",
        icon: Users,
        completed: hasGroup,
        current: hasToken && !hasGroup,
      },
      {
        number: 3,
        title: "Aplikácia pripravená",
        description: "Môžete začať implementovať GPS tracking funkcionalitu",
        icon: CheckCircle,
        completed: isComplete,
        current: false,
      },
    ];

    if (isComplete) {
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
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Nastavenie vývojového prostredia</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Postupujte podľa krokov pre správne nastavenie aplikácie
          </p>
        </div>

        <div className="w-full max-w-3xl space-y-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <Card 
                key={step.number} 
                className={`p-6 transition-all duration-300 ${
                  step.completed 
                    ? 'bg-primary/5 border-primary/20 shadow-soft' 
                    : step.current 
                      ? 'bg-gradient-primary/10 border-primary shadow-elegant ring-2 ring-primary/20' 
                      : 'bg-card/50 border-muted opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      step.completed 
                        ? 'bg-primary text-primary-foreground shadow-soft' 
                        : step.current 
                          ? 'bg-gradient-primary text-primary-foreground shadow-elegant animate-pulse' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                          step.completed 
                            ? 'bg-primary text-primary-foreground' 
                            : step.current 
                              ? 'bg-gradient-primary text-primary-foreground ring-2 ring-primary/30' 
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.completed ? <CheckCircle className="w-5 h-5" /> : step.number}
                      </div>
                      <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                        step.current ? 'text-foreground' : step.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className={`text-sm transition-colors duration-300 ${
                      step.current ? 'text-muted-foreground' : step.completed ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {step.completed && (
                    <div className="text-primary animate-in fade-in-50 duration-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
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