

## Enlarge Camera Face Guide for Close-Up Capture

### Problem
The face guide oval in the camera view is too small (`w-64 h-80` = 256x320px), forcing users to hold their phone far away to fit their face inside the circle.

### Changes

**File: `src/components/CameraCapture.tsx`**

1. **Enlarge the face guide oval** (line 183): Change from `w-64 h-80` to `w-[80vw] h-[60vh]` (or similar responsive sizing like `w-80 h-96`) so the oval fills most of the camera view. This lets users hold the phone at a natural close-up distance.

2. **Increase camera resolution** (lines 33-34): Bump the ideal resolution from `1280x720` to `1920x1080` for better detail at close range.

3. **Adjust the guide border radius**: Keep `rounded-[40%]` for the oval shape but ensure it still looks good at the larger size.

### Technical Details

Line 183 changes from:
```
<div className="w-64 h-80 border-2 border-dashed border-background/50 rounded-[40%] ...">
```
to:
```
<div className="w-[75vw] max-w-sm h-[55vh] max-h-[500px] border-2 border-dashed border-background/50 rounded-[40%] ...">
```

This uses viewport-relative units so the guide scales with the screen, with max constraints to keep it reasonable on tablets. The oval will be roughly 3x larger on a typical phone, letting users capture their face from arm's length or closer.

Camera resolution lines 33-34 change from `1280x720` to `1920x1080`.

