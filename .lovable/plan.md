
# Integrate OPTIC EXCLUSIVE Logo & Brand Colors

## Overview
This plan integrates the OPTIC EXCLUSIVE logo into your glasses recommendation app and updates the entire color scheme to match the brand's signature red color.

## Logo Analysis
The uploaded logo features:
- Brand name: "OPTIC EXCLUSIVE"
- Primary color: A vibrant red (#E31E24)
- A stylized monocle/glasses icon
- Clean, modern sans-serif typography

---

## What Will Change

### 1. Logo Integration
- Add logo to the Header (replacing "FrameFit" branding)
- Add logo to the Footer
- Update the browser tab icon (favicon)
- Update page title to "OPTIC EXCLUSIVE"

### 2. Color Theme Updates
Transform the current warm orange/brown palette to a red-based brand palette:

| Element | Current | New |
|---------|---------|-----|
| Primary color | Warm orange | Brand red (#E31E24) |
| Accent color | Deep orange | Darker red for hover states |
| Gradients | Orange gradients | Red gradients |
| Focus rings | Orange | Red |

### 3. Components Getting Updates
- **Header**: Logo image replaces glasses icon + text
- **Footer**: Logo image replaces glasses icon + text  
- **HeroSection**: Button colors, badges
- **HowItWorks**: Step numbers, icons
- **AnalysisSection**: Badges, buttons, accents
- **All UI components**: Via CSS variable changes

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/assets/` | Create folder and copy logo image |
| `src/components/Header.tsx` | Replace icon+text with logo image |
| `src/components/Footer.tsx` | Replace icon+text with logo image |
| `src/index.css` | Update all color variables to red palette |
| `index.html` | Update title, description, and favicon |
| `public/` | Copy logo for favicon use |

---

## Technical Details

### New Color Palette (HSL format for Tailwind)

```text
Light Mode:
- Primary: 358 85% 51% (bright red)
- Accent: 358 75% 45% (darker red)
- Ring/Focus: 358 85% 51%

Dark Mode:
- Primary: 358 80% 55% (slightly lighter red)
- Accent: 358 70% 50%
```

### Logo Import Pattern
```typescript
// In Header.tsx and Footer.tsx
import logo from "@/assets/oex-logo.png";

// Usage
<img src={logo} alt="OPTIC EXCLUSIVE" className="h-8" />
```

### Gradient Updates
```css
--gradient-warm: linear-gradient(135deg, hsl(358 85% 51%) 0%, hsl(358 75% 45%) 100%);
```

---

## Implementation Steps

1. Copy logo image to `src/assets/` folder
2. Update `src/index.css` with new red color palette
3. Update `Header.tsx` to display logo image
4. Update `Footer.tsx` to display logo image
5. Update `index.html` with new title and favicon
6. Copy logo to `public/` for favicon

---

## Result Preview
After implementation, your app will have:
- OPTIC EXCLUSIVE branding throughout
- Consistent red color theme matching your logo
- Professional, cohesive visual identity
- Updated browser tab with logo icon
