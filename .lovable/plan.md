
# Add Frame Example Images

## Overview
Add actual eyewear images to the frame recommendations to help users visualize the different glasses styles recommended for their face shape.

## Current State
- The `glassesFrames` array in `faceShapeData.ts` has empty `imageUrl` properties
- The `FrameRecommendation` component displays a placeholder Glasses icon
- No frame images exist in the project

## Implementation Approach

### Option: Use High-Quality Stock Images from Unsplash
I'll use free, commercially-usable images from Unsplash for each frame style. These will be referenced via URL, keeping the bundle size small.

## Files to Modify

### 1. `src/lib/faceShapeData.ts`
Update the `imageUrl` for each frame with appropriate Unsplash images:

| Frame | Style | Image Description |
|-------|-------|-------------------|
| Classic Square | Square | Tortoise square frames |
| Windsor Round | Round | Gold round frames |
| Aviator Classic | Aviator | Silver aviator glasses |
| Retro Cat Eye | Cat Eye | Black cat-eye frames |
| Modern Rectangle | Rectangle | Matte black rectangle frames |
| Bold Geometric | Geometric | Amber geometric frames |
| Vintage Browline | Browline | Dark tortoise browline |
| Rimless Oval | Rimless | Clear rimless oval frames |

### 2. `src/components/FrameRecommendation.tsx`
Update the component to:
- Display the actual image when `imageUrl` is available
- Keep the Glasses icon as a fallback for missing images
- Add proper image loading with object-fit styling
- Include hover effects for better interactivity

## Technical Details

**FrameRecommendation.tsx changes:**
```tsx
// Update the image display logic
<div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center mb-4 overflow-hidden">
  {frame.imageUrl ? (
    <img 
      src={frame.imageUrl} 
      alt={frame.name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
    />
  ) : (
    <Glasses className="w-20 h-20 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
  )}
</div>
```

**faceShapeData.ts changes:**
Each frame will get a curated Unsplash image URL that matches its style, for example:
```typescript
{
  id: "classic-square",
  name: "Classic Square",
  style: "Square",
  bestFor: ["oval", "round", "oblong"],
  imageUrl: "https://images.unsplash.com/photo-[square-frames-image]",
  color: "Tortoise"
}
```

## Result
- Users will see actual eyewear images for each recommended frame style
- Images will have smooth hover zoom effects
- Fallback icon ensures the UI works even if images fail to load
- Professional appearance that helps users visualize frame recommendations
