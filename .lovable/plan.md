

## Fix Heart Shape Detection

### Problem
The forehead width is measured using MediaPipe landmarks **103** and **332** (inner brow area), which capture a width that is too narrow. For a heart-shaped face, the forehead/temple area is the widest point, but these landmarks sit inside the true temple boundary. As a result:
- `foreheadWidth` ends up smaller than `cheekboneWidth`
- The classification logic never reaches the heart shape condition because `largestWidth` is never `'forehead'`
- The face likely gets classified as Diamond or Oval instead

### Solution
Use wider forehead/temple landmark indices that better represent the true forehead width, and add a secondary heart-shape detection path.

### Changes

**File: `src/lib/faceAnalysis.ts`**

1. **Update forehead landmark indices** -- Replace landmarks 103/332 with landmarks **54/284** (outer temple points) which sit at the widest part of the forehead/temple area and more accurately represent forehead width.

2. **Add a secondary heart detection path** -- In the classification logic, add an additional check: even if cheekbones are technically widest, if the forehead is close to cheekbone width AND significantly wider than the jaw, it should still classify as heart. This handles the common case where cheekbones and forehead are similar but jaw is notably narrow.

3. **Adjust the heart threshold** -- Lower the forehead-to-jaw ratio from 1.2 to 1.15 to catch more heart shapes where the forehead is moderately wider than the jaw.

### Technical Details

```text
Current landmarks:
  foreheadLeft: 103  (inner brow)
  foreheadRight: 332 (inner brow)

New landmarks:
  foreheadLeft: 54   (outer temple)
  foreheadRight: 284  (outer temple)
```

Updated classification logic (pseudocode):
```text
1. OBLONG check (unchanged)
2. HEART check: forehead is largest AND foreheadWidth > jawWidth * 1.15
3. NEW HEART check: cheekbones are largest BUT foreheadWidth > jawWidth * 1.15
   AND foreheadWidth >= cheekboneWidth * 0.92 (forehead nearly as wide as cheeks)
4. DIAMOND check (unchanged, but now only triggers when forehead is NOT close to cheekbone width)
5. Remaining checks unchanged
```

This ensures heart-shaped faces (wide forehead, narrow jaw) are correctly identified even when cheekbone width is marginally wider than forehead width.
