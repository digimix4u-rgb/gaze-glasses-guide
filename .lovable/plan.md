
# Add Gender Selection Question

## Overview
Add a gender selection step to the face shape analysis flow. Users will select their gender (Male or Female) before uploading a photo, which can be used to provide more personalized analysis results.

## User Flow

```text
Current Flow:
[Upload Photo] -> [Analyze] -> [Results]

New Flow:
[Select Gender] -> [Upload Photo] -> [Analyze] -> [Results]
```

## Implementation

### 1. Create GenderSelection Component
**New file: `src/components/GenderSelection.tsx`**

A simple, visually appealing component with two large clickable cards:
- Male option with a male icon
- Female option with a female icon

Features:
- Clean card-based design matching the existing app style
- Hover and selection states using the primary color (#E31E24)
- Icons from lucide-react (User icon styled for each gender)
- Smooth animations on selection

### 2. Update AnalysisSection Component
**File: `src/components/AnalysisSection.tsx`**

Add gender state and conditional rendering:
- New state: `gender: 'male' | 'female' | null`
- Show GenderSelection first when no gender is selected
- After gender selection, show the photo upload flow
- Include gender in reset function
- Display selected gender in results (optional badge)

### 3. Update Types (Optional Enhancement)
**File: `src/lib/faceShapeData.ts`**

Add a Gender type for type safety:
```typescript
export type Gender = 'male' | 'female';
```

## Visual Design

The gender selection will feature:
- Two large cards side by side (or stacked on mobile)
- Each card shows an icon and label ("Male" / "Female")
- Cards use the same rounded-2xl, shadow-soft styling as other components
- Selected state uses the primary color with a checkmark indicator
- Continue button appears after selection

## Technical Details

**GenderSelection.tsx structure:**
```tsx
interface GenderSelectionProps {
  onSelect: (gender: 'male' | 'female') => void;
}

// Two clickable cards with icons
// Styled to match PhotoUpload component aesthetic
```

**AnalysisSection.tsx changes:**
- Add `const [gender, setGender] = useState<'male' | 'female' | null>(null);`
- Wrap existing content in conditional: `{!gender ? <GenderSelection /> : ...existing flow...}`
- Add gender to `resetAnalysis()` function
- Optionally display gender badge in results

## Result
- Users will select their gender before uploading a photo
- The selection is stored and can be used for future personalization
- Clean, intuitive UI that matches the existing design language
- Gender is reset when starting a new analysis
