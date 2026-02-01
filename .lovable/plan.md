
# Change Header to White Background

## Overview
Update the header component to have a solid white background instead of the current semi-transparent background.

## Change Summary

| File | Current | New |
|------|---------|-----|
| `src/components/Header.tsx` | `bg-background/80 backdrop-blur-md` | `bg-white` |

## Technical Details

The header currently uses:
- `bg-background/80` - 80% opacity of the theme background color
- `backdrop-blur-md` - blur effect for content behind

Will be changed to:
- `bg-white` - solid white background

## File to Modify

**src/components/Header.tsx** (line 5)
```tsx
// From:
<header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">

// To:
<header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
```

## Result
The header will have a clean, solid white background that provides better contrast and a more professional look for the OPTIC EXCLUSIVE branding.
