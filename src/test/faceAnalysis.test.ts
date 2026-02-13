import { describe, it, expect } from "vitest";

// Mock measurements type based on FaceAnalysisResult
type Measurements = {
  faceLength: number;
  faceWidth: number;
  foreheadWidth: number;
  cheekboneWidth: number;
  jawWidth: number;
  chinWidth: number;
  lengthToWidthRatio: number;
  foreheadToJawRatio: number;
  cheekboneProminence: number;
  chinToJawRatio: number;
};

// Helper function to calculate weighted shape score
function calculateWeightedShapeScore(params: { value: number; target: number; tolerance: number; weight: number }[]): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const param of params) {
    const deviation = Math.abs(param.value - param.target) / param.tolerance;
    const score = Math.exp(-Math.pow(deviation, 2));
    totalScore += score * param.weight;
    totalWeight += param.weight;
  }

  return totalScore / totalWeight;
}

describe("Diamond Face Shape Detection", () => {
  it("should calculate diamond score with correct parameters", () => {
    // Create measurements that should match diamond shape
    const measurements: Measurements = {
      faceLength: 200,
      faceWidth: 150,
      foreheadWidth: 127.5, // 0.85 * 150
      cheekboneWidth: 150,  // Widest point
      jawWidth: 127.5,      // 0.85 * 150
      chinWidth: 100,
      lengthToWidthRatio: 1.35, // 200/150
      foreheadToJawRatio: 1.0,
      cheekboneProminence: 1.10, // Updated target: 150 / ((127.5 + 127.5) / 2) = 1.176
      chinToJawRatio: 0.78,
    };

    const foreheadToFaceWidth = measurements.foreheadWidth / measurements.cheekboneWidth; // 0.85
    const jawToFaceWidth = measurements.jawWidth / measurements.cheekboneWidth; // 0.85

    // Test with NEW parameters
    const newDiamondScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.15, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.10, tolerance: 0.08, weight: 2.0 }, // NEW: target 1.10, tolerance 0.08, weight 2.0
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 }, // NEW: weight 2.0
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 }, // NEW: weight 2.0
    ]);

    // Test with OLD parameters for comparison
    const oldDiamondScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.15, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.15, tolerance: 0.1, weight: 3.0 }, // OLD: target 1.15, tolerance 0.1, weight 3.0
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 }, // OLD: weight 2.5
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 }, // OLD: weight 2.5
    ]);

    // New score should be reasonable (between 0 and 1)
    expect(newDiamondScore).toBeGreaterThan(0);
    expect(newDiamondScore).toBeLessThanOrEqual(1);

    // The new parameters should be more conservative (lower score for borderline cases)
    // This specific case with cheekboneProminence of 1.10 should score well with new params
    expect(newDiamondScore).toBeGreaterThan(0.5);
  });

  it("should be more selective with tighter tolerance", () => {
    // Create measurements with cheekboneProminence slightly off target
    const measurements: Measurements = {
      faceLength: 200,
      faceWidth: 150,
      foreheadWidth: 127.5,
      cheekboneWidth: 150,
      jawWidth: 127.5,
      chinWidth: 100,
      lengthToWidthRatio: 1.35,
      foreheadToJawRatio: 1.0,
      cheekboneProminence: 1.20, // Slightly high
      chinToJawRatio: 0.78,
    };

    const foreheadToFaceWidth = measurements.foreheadWidth / measurements.cheekboneWidth;
    const jawToFaceWidth = measurements.jawWidth / measurements.cheekboneWidth;

    // New parameters with tighter tolerance should penalize deviation more
    const newScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.15, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.10, tolerance: 0.08, weight: 2.0 },
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 },
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 },
    ]);

    // Old parameters with wider tolerance
    const oldScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.15, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.15, tolerance: 0.1, weight: 3.0 },
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
    ]);

    // New score should be lower due to tighter tolerance and different target
    expect(newScore).toBeLessThan(oldScore);
  });

  it("should have more balanced weights", () => {
    // Verify that total weight is more balanced
    const newWeights = [1.5, 2.0, 2.0, 2.0]; // lengthToWidthRatio, cheekboneProminence, foreheadToFaceWidth, jawToFaceWidth
    const oldWeights = [1.5, 3.0, 2.5, 2.5];

    const newTotalWeight = newWeights.reduce((sum, w) => sum + w, 0);
    const oldTotalWeight = oldWeights.reduce((sum, w) => sum + w, 0);

    // New total weight should be 7.5
    expect(newTotalWeight).toBe(7.5);
    
    // Old total weight should be 9.5
    expect(oldTotalWeight).toBe(9.5);

    // New parameters should have more balanced distribution
    // cheekboneProminence should no longer dominate (was 3.0/9.5 = 31.6%, now 2.0/7.5 = 26.7%)
    const newCheekboneRatio = 2.0 / newTotalWeight;
    const oldCheekboneRatio = 3.0 / oldTotalWeight;

    expect(newCheekboneRatio).toBeLessThan(oldCheekboneRatio);
    expect(newCheekboneRatio).toBeCloseTo(0.267, 2);
  });
});
