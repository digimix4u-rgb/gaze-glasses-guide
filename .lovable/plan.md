

# Add Progressive Web App (PWA) Capabilities

## Overview
Add PWA features to the existing face shape detection app, enabling offline use, home screen installation, and cached model files -- all while keeping existing functionality unchanged.

## Changes

### 1. Install `vite-plugin-pwa`
Add the `vite-plugin-pwa` package, which handles manifest generation, service worker creation, and precaching automatically via Workbox.

### 2. Update `vite.config.ts`
Configure the PWA plugin with:
- **Manifest**: name "Frame Finder", short_name "FrameFinder", theme_color "#E31E24", background_color "#fafafa", display "standalone", orientation "portrait", start_url "/"
- **Icons**: Reference 192x192 and 512x512 icons (using the existing logo)
- **Service Worker (Workbox)**: 
  - Precache the app shell (HTML, CSS, JS)
  - Runtime caching rule for `cdn.jsdelivr.net` (face-api.js models) using **CacheFirst** strategy
  - Runtime caching for Google Fonts using **StaleWhileRevalidate**
- **Register type**: autoUpdate (seamless updates)

### 3. Update `index.html`
- Add `<meta name="theme-color" content="#E31E24">`
- Add `<link rel="apple-touch-icon" href="/pwa-192x192.png">`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- The manifest link is auto-injected by the plugin

### 4. Create PWA Icons
Generate simple icon files at `public/pwa-192x192.png` and `public/pwa-512x512.png` using the existing OEX logo asset.

### 5. Create Install Button Component (`src/components/PWAInstallButton.tsx`)
- Listen for the `beforeinstallprompt` event
- Show an "Install App" button when the prompt is available
- Trigger the native install dialog on click
- Auto-hide after successful installation
- Show iOS-specific instructions (Share > Add to Home Screen) when on Safari
- Place the button in the Header component for visibility

### 6. Update `src/components/Header.tsx`
- Import and render the `PWAInstallButton` component alongside the logo

## Files to Create/Modify

| File | Action |
|------|--------|
| `vite.config.ts` | Modify -- add VitePWA plugin config |
| `index.html` | Modify -- add meta tags for iOS/theme |
| `public/pwa-192x192.png` | Create -- PWA icon |
| `public/pwa-512x512.png` | Create -- PWA icon |
| `src/components/PWAInstallButton.tsx` | Create -- install prompt UI |
| `src/components/Header.tsx` | Modify -- add install button |

## Technical Details

### Service Worker Caching Strategy
```text
App Shell (HTML/CSS/JS)  -->  Precached by Workbox (auto)
face-api.js models (CDN) -->  CacheFirst (long-lived)
Google Fonts             -->  StaleWhileRevalidate
```

### Offline Behavior
After first visit, the app works fully offline: the app shell and ML models are cached locally. Users can analyze face shapes without an internet connection.

