# GPS Vehicle Tracking - Iframe Integration Template

**Základná šablóna pre GPS vehicle tracking aplikáciu s iframe komunikáciou**

## 📋 Popis projektu

Táto aplikácia je navrhnutá ako iframe komponent, ktorý zobrazuje GPS vozidlá načítané cez API. Podporuje komunikáciu s parent window cez postMessage API pre získavanie autentifikačných tokenov a group kódov.

## 🚀 Začíname

### Predpoklady
- Node.js 18+ a npm
- Access token pre GPSGuard API
- Group code pre filtrovanie vozidiel

### Inštalácia

```bash
# 1. Klonuj repository
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>

# 2. Nainštaluj dependencies
npm install

# 3. Skopíruj environment súbor
cp .env.example .env

# 4. Spusti development server
npm run dev
```

## 🔧 Konfigurácia

### Environment Variables

Vytvor `.env` súbor v root adresári:

```env
# Supabase konfigurácia (voliteľné - pre budúce rozšírenia)
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
VITE_SUPABASE_URL="your_supabase_url"
```

### API Endpoints

Aplikácia používa GPSGuard API:
- **Groups**: `GET https://api-d.gpsguard.eu/api/v1/groups`
- **Vehicles**: `GET https://api-d.gpsguard.eu/api/v1/group/{groupCode}`

## 🖼️ Iframe Integration

### Základné použitie

```html
<!-- Minimálna implementácia -->
<iframe 
  src="https://your-app-url.com" 
  width="100%" 
  height="600"
  id="gps-tracker"
></iframe>
```

### PostMessage Komunikácia

Aplikácia komunikuje s parent window cez postMessage API:

```javascript
// Parent window - odoslanie dat do iframe
iframe.contentWindow.postMessage({
  type: 'GPS_SET_TOKEN',
  payload: { token: 'your-access-token' }
}, '*');

iframe.contentWindow.postMessage({
  type: 'GPS_SET_GROUP',
  payload: { groupCode: 'your-group-code' }
}, '*');

// Iframe - požiadavka o dáta
window.parent.postMessage({
  type: 'GPS_REQUEST_TOKEN'
}, '*');

window.parent.postMessage({
  type: 'GPS_REQUEST_GROUP'
}, '*');
```

### Vue.js Parent Example

```vue
<template>
  <div class="gps-container">
    <iframe 
      ref="gpsIframe"
      :src="iframeUrl"
      @load="handleIframeLoad"
      width="100%"
      height="600"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const gpsIframe = ref(null)
const iframeUrl = 'https://your-app-url.com'
const accessToken = 'your-gps-api-token'
const groupCode = 'your-group-code'

const handleIframeLoad = () => {
  // Pošli dáta do iframe po načítaní
  sendDataToIframe()
}

const sendDataToIframe = () => {
  if (gpsIframe.value?.contentWindow) {
    gpsIframe.value.contentWindow.postMessage({
      type: 'GPS_SET_TOKEN',
      payload: { token: accessToken }
    }, '*')
    
    gpsIframe.value.contentWindow.postMessage({
      type: 'GPS_SET_GROUP', 
      payload: { groupCode }
    }, '*')
  }
}

// Počúvanie správ z iframe
const handleMessage = (event) => {
  if (event.data.type === 'GPS_REQUEST_TOKEN') {
    event.source.postMessage({
      type: 'GPS_SET_TOKEN',
      payload: { token: accessToken }
    }, '*')
  }
  
  if (event.data.type === 'GPS_REQUEST_GROUP') {
    event.source.postMessage({
      type: 'GPS_SET_GROUP',
      payload: { groupCode }
    }, '*')
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>
```

## 🎮 Režimy aplikácie

### Development Mode
- Lokálne testovanie s manuálnym zadávaním tokenov
- Debug konzola a rozšírené logovanie
- Možnosť prepínania medzi skupinami

### Production Mode  
- Automatické získavanie tokenov z parent window
- Minimálne UI pre end-user
- Optimalizované pre iframe embedding

## 🏗️ Architektúra

```
src/
├── components/          # React komponenty
│   ├── ui/             # Shadcn/ui komponenty  
│   ├── AppHeader.tsx   # Header s mode switchom
│   ├── VehicleCard.tsx # Zobrazenie jednotlivého vozidla
│   └── VehicleList.tsx # Zoznam vozidiel
├── contexts/           # React contexts
│   └── AppContext.tsx  # Globálny state management
├── pages/             # Stránky
│   ├── Index.tsx      # Hlavná stránka
│   └── NotFound.tsx   # 404 stránka
├── services/          # API služby
│   └── gpsService.ts  # GPS API komunikácia
└── lib/               # Utility funkcie
    └── utils.ts       # Pomocné funkcie
```

## 🎨 Design System

Aplikácia používa konzistentný design system definovaný v:
- `src/index.css` - CSS premenné a farby
- `tailwind.config.ts` - Tailwind konfigurácia

### Farby (HSL formát)
- **Primary**: `hsl(200 100% 45%)` - Hlavná farba
- **Secondary**: `hsl(210 15% 95%)` - Sekundárna farba  
- **Success**: `hsl(140 70% 45%)` - Úspech
- **Warning**: `hsl(45 90% 55%)` - Upozornenie
- **Destructive**: `hsl(0 75% 55%)` - Chyba

## 📱 Responzívnosť

Aplikácia je plne responzívna s breakpointmi:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔒 Bezpečnosť

- Všetky API calls vyžadujú autentifikáciu
- CORS policy je nastavená pre iframe komunikáciu
- Validácia všetkých postMessage eventov

## 🚀 Deployment

### Lovable Platform
```bash
# Automatické deployment
# Klikni na "Publish" button v Lovable editore
```

### Manuálny Build
```bash
# Production build
npm run build

# Preview buildu
npm run preview

# Development build (s debug features)
npm run build:dev
```

## 🧪 Testing

### Mock Data

Pre testovanie bez API pripojenia:

```javascript
// Použij mock dáta v gpsService.ts
const mockVehicles = [
  {
    code: "VEHICLE001",
    name: "Test Vehicle 1", 
    spz: "BA123AB",
    speed: 45,
    batteryPercentage: 85,
    odometer: 125000,
    lastPosition: { lat: 48.1486, lng: 17.1077 },
    lastPositionTimestamp: new Date().toISOString()
  }
]
```

### E2E Testing Template

```javascript
// cypress/e2e/iframe-communication.cy.js
describe('Iframe Communication', () => {
  it('should receive token from parent', () => {
    cy.visit('/iframe-test.html')
    cy.get('#gps-iframe').should('be.visible')
    
    // Simulate parent sending token
    cy.window().then(win => {
      win.postMessage({
        type: 'GPS_SET_TOKEN',
        payload: { token: 'test-token' }
      }, '*')
    })
    
    cy.contains('Token received').should('be.visible')
  })
})
```

## 🛠️ Development Tools

### Odporúčané VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
- Prettier - Code formatter

### ESLint Configuration
```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 📞 API Dokumentácia

### GPS Service Methods

```typescript
// Načítanie skupín
const groups = await gpsService.getGroups()

// Načítanie vozidiel pre skupinu  
const vehicles = await gpsService.getVehiclesByGroup('GROUP_CODE')

// Načítanie všetkých vozidiel
const allVehicles = await gpsService.getAllVehicles()
```

### Vehicle Data Structure

```typescript
interface Vehicle {
  code: string              // Unikátny kód vozidla
  name: string              // Názov vozidla  
  spz: string               // SPZ
  speed: number             // Aktuálna rýchlosť (km/h)
  batteryPercentage: number // Stav batérie (%)
  odometer: number          // Celkový nájazd (km)
  lastPosition: {           // Posledná pozícia
    lat: number
    lng: number  
  }
  lastPositionTimestamp: string // ISO timestamp
}
```

## 🔄 Changelog

### v1.0.0 - Initial Release
- ✅ Iframe komunikácia cez postMessage
- ✅ GPS API integrácia
- ✅ Responzívny dizajn
- ✅ Dark/Light mode
- ✅ Real-time vehicle tracking
- ✅ Development/Production modes

## 🤝 Kontribúcia

1. Fork repository
2. Vytvor feature branch (`git checkout -b feature/amazing-feature`)
3. Commit zmeny (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otvor Pull Request

## 📄 Licencia

Tento projekt je licencovaný pod MIT License.

## 🆘 Podpora

Pre otázky a podporu kontaktuj:
- **Email**: your-email@company.com
- **Dokumentácia**: [Link to docs]
- **Issues**: [GitHub Issues]

---

**Poznámka**: Táto šablóna je pripravená pre ďalší vývoj. Všetky kľúčové komponenty sú implementované a dokumentované pre jednoduchú rozšíriteľnosť.