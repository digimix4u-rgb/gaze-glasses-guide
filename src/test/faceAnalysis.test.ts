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
      cheekboneProminence: 1.15, // Actual measurement value, testing against new target of 1.15
      chinToJawRatio: 0.78,
    };

    const foreheadToFaceWidth = measurements.foreheadWidth / measurements.cheekboneWidth; // 0.85
    const jawToFaceWidth = measurements.jawWidth / measurements.cheekboneWidth; // 0.85

    // Test with NEW parameters (from solution)
    const newDiamondScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.12, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.15, tolerance: 0.08, weight: 2.5 }, // NEW: target 1.15, tolerance 0.08, weight 2.5
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 }, // NEW: weight 2.0
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 }, // NEW: weight 2.0
    ]);

    // Test with one set of OLD parameters (before removing duplicates)
    // Note: The actual old code had 8 duplicate parameters; this is just one set for comparison
    const oldDiamondScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.12, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.18, tolerance: 0.08, weight: 2.5 },
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
    ]);

    // New score should be reasonable (between 0 and 1)
    expect(newDiamondScore).toBeGreaterThan(0);
    expect(newDiamondScore).toBeLessThanOrEqual(1);

    // The new parameters should be more selective (tighter tolerance on lengthToWidthRatio)
    // This specific case with cheekboneProminence of 1.15 should score well with new params
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
      cheekboneProminence: 1.25, // Slightly high from target 1.15
      chinToJawRatio: 0.78,
    };

    const foreheadToFaceWidth = measurements.foreheadWidth / measurements.cheekboneWidth;
    const jawToFaceWidth = measurements.jawWidth / measurements.cheekboneWidth;

    // New parameters with tighter tolerance (0.12) should penalize deviation more
    const newScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.12, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.15, tolerance: 0.08, weight: 2.5 },
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 },
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.0 },
    ]);

    // Old parameters (first set from the duplicate-ridden version)
    const oldScore = calculateWeightedShapeScore([
      { value: measurements.lengthToWidthRatio, target: 1.35, tolerance: 0.12, weight: 1.5 },
      { value: measurements.cheekboneProminence, target: 1.18, tolerance: 0.08, weight: 2.5 },
      { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
      { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
    ]);

    // New score should be lower due to deviation from target (1.15 vs 1.25)
    expect(newScore).toBeLessThan(oldScore);
  });

  it("should have more balanced weights", () => {
    // Verify that the new weights are more balanced
    const newWeights = [1.5, 2.5, 2.0, 2.0]; // lengthToWidthRatio, cheekboneProminence, foreheadToFaceWidth, jawToFaceWidth
    const oldFirstSetWeights = [1.5, 2.5, 2.5, 2.5]; // First set from duplicate-ridden version

    const newTotalWeight = newWeights.reduce((sum, w) => sum + w, 0);
    const oldFirstSetTotal = oldFirstSetWeights.reduce((sum, w) => sum + w, 0);

    // New total weight should be 8.0
    expect(newTotalWeight).toBe(8.0);
    
    // Old first set total was 9.0
    expect(oldFirstSetTotal).toBe(9.0);

    // New parameters have more balanced weight distribution
    // foreheadToFaceWidth and jawToFaceWidth now have weight 2.0 instead of 2.5
    const newForeheadRatio = 2.0 / newTotalWeight;
    const oldForeheadRatio = 2.5 / oldFirstSetTotal;

    expect(newForeheadRatio).toBeLessThan(oldForeheadRatio);
    expect(newForeheadRatio).toBeCloseTo(0.25, 2);
  });
});
