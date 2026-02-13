

## Update Classification Thresholds (v3)

### What Changes
Replace the classification if/else chain (lines 209-240) and update the scoring formulas to match your refined thresholds. Key differences from current code:

| Shape | Current Threshold | New Threshold |
|-------|------------------|---------------|
| Oblong/Rectangle | ratio >= 1.3, jaw angle 135 | ratio >= 1.35, jaw angle 133 |
| Heart | foreheadToJawRatio > 1.15 (checked 5th) | foreheadToJawRatio > 1.18 AND ratio >= 1.15 (checked 2nd) |
| Diamond | jawToCheekRatio < 0.7, foreheadToJawRatio < 1.1 (checked 6th) | jawToCheekRatio < 0.72, foreheadToJawRatio < 1.08, AND forehead-jaw width similarity check (checked 3rd) |
| Square | ratio < 1.3, jawAngle < 135, jawToCheekRatio > 0.75 | jawAngle < 133, jawToCheekRatio > 0.78, ratio < 1.35 (checked 4th) |
| Round | ratio < 1.15, jawAngle > 140 | ratio < 1.15, jawAngle > 143 |
| Oval | ratio 1.1-1.3, jawAngle > 135 | jawAngle >= 133, ratio 1.15-1.35 (checked 6th) |
| Fallback | always oval | jawAngle < 133 = square, else oval |

### Priority Reorder
Heart and Diamond move up (checked before Square), which prevents them from being swallowed by the Square or Oval catch-alls.

### Technical Details

**File: `src/lib/faceAnalysis.ts`**

Replace lines 209-240 with the new if/else chain using these variable mappings:
- `lengthWidthRatio` = `lengthToWidthRatio` (faceLength / cheekboneWidth)
- `avgJawAngle` = `jawAngle`
- `jawWidthRatio` = `jawToCheekRatio` (jawWidth / cheekboneWidth)
- `foreheadJawRatio` = `foreheadToJawRatio` (foreheadWidth / jawWidth)

New Diamond check adds: `Math.abs(foreheadWidth - jawWidth) / cheekboneWidth < 0.12` to ensure forehead and jaw are similarly narrow (not just one being narrow).

Update scoring formulas (lines 248-266) to use the new threshold centers (1.35 instead of 1.3, 133 instead of 135, etc.) so confidence percentages align with the classification rules.

