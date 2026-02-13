export type Gender = 'male' | 'female';

export interface FaceShape {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  recommendations: string[];
  avoidStyles: string[];
}

export const faceShapes: FaceShape[] = [
  {
    id: "oval",
    name: "Oval",
    description: "Considered the most balanced shape, an oval face is slightly longer than it is wide. It has a gently rounded jawline and forehead that's a little broader than the chin.",
    characteristics: [
      "Slightly longer than wide",
      "Gently rounded jawline",
      "Forehead is a little broader than chin",
      "Balanced, versatile proportions"
    ],
    recommendations: [
      "Square frames",
      "Rectangular frames",
      "Aviator styles",
      "Cat-eye frames",
      "Geometric shapes"
    ],
    avoidStyles: [
      "Oversized frames that overwhelm your features"
    ]
  },
  {
    id: "round",
    name: "Round",
    description: "Round faces are soft and full, with equal width and length. The cheeks are typically the widest part, and the jawline has minimal angles, giving a youthful, approachable look.",
    characteristics: [
      "Equal width and length",
      "Cheeks are typically the widest part",
      "Minimal jaw angles",
      "Soft, curved features"
    ],
    recommendations: [
      "Rectangular frames",
      "Square frames",
      "Angular cat-eye",
      "Browline frames",
      "Geometric shapes"
    ],
    avoidStyles: [
      "Round frames",
      "Small frames",
      "Rimless styles"
    ]
  },
  {
    id: "square",
    name: "Square",
    description: "Square faces have a strong, defined jawline with a forehead, cheekbones, and jaw that are about the same width. This shape often gives off a bold, confident impression.",
    characteristics: [
      "Strong, defined jawline",
      "Forehead, cheekbones, and jaw about the same width",
      "Bold, angular features",
      "Face width and length are similar"
    ],
    recommendations: [
      "Round frames",
      "Oval frames",
      "Rimless styles",
      "Butterfly frames",
      "Curved cat-eye"
    ],
    avoidStyles: [
      "Square frames",
      "Angular geometric shapes",
      "Boxy styles"
    ]
  },
  {
    id: "heart",
    name: "Heart",
    description: "A heart-shaped face has a wider forehead and a narrow, pointed chin. The cheekbones are often prominent, creating a soft yet striking look.",
    characteristics: [
      "Wider forehead",
      "Narrow, pointed chin",
      "Prominent cheekbones",
      "May have widow's peak"
    ],
    recommendations: [
      "Bottom-heavy frames",
      "Oval frames",
      "Round frames",
      "Light-colored frames",
      "Rimless bottom styles"
    ],
    avoidStyles: [
      "Top-heavy frames",
      "Decorated temples",
      "Cat-eye styles"
    ]
  },
  {
    id: "oblong",
    name: "Oblong",
    description: "This face is longer than it is wide, with a straight cheek line. The forehead, cheeks, and jaw are close in width, but the overall face length gives it an elegant, elongated appearance.",
    characteristics: [
      "Longer than wide",
      "Straight cheek line",
      "Forehead, cheeks, and jaw close in width",
      "Elegant, elongated appearance"
    ],
    recommendations: [
      "Oversized frames",
      "Decorative temples",
      "Square frames",
      "Round frames",
      "Deep frames"
    ],
    avoidStyles: [
      "Narrow frames",
      "Small frames",
      "Frames that add length"
    ]
  },
  {
    id: "diamond",
    name: "Diamond",
    description: "Diamond faces are characterized by a narrow forehead and chin, with the cheekbones being the widest point. This face shape often appears sharp and sculpted.",
    characteristics: [
      "Narrow forehead and chin",
      "Cheekbones are the widest point",
      "Sharp, sculpted appearance",
      "Angular features"
    ],
    recommendations: [
      "Oval frames",
      "Cat-eye frames",
      "Rimless styles",
      "Frames with detailing on top",
      "Curved frames"
    ],
    avoidStyles: [
      "Narrow frames",
      "Boxy styles",
      "Frames wider than cheekbones"
    ]
  },
  {
    id: "rectangle",
    name: "Rectangle",
    description: "A rectangle face is longer than it is wide with a strong, angular jawline. The forehead, cheekbones, and jaw are similar in width, creating a structured, elongated appearance.",
    characteristics: [
      "Longer than wide",
      "Strong, angular jawline",
      "Forehead, cheekbones, and jaw similar in width",
      "Structured, elongated appearance"
    ],
    recommendations: [
      "Round frames",
      "Oval frames",
      "Wide frames to add width",
      "Decorative temples",
      "Deep frames to shorten face"
    ],
    avoidStyles: [
      "Narrow frames",
      "Small frames",
      "Square frames that emphasize angles"
    ]
  }
];

export function getFaceShapeById(id: string): FaceShape | undefined {
  return faceShapes.find(shape => shape.id === id);
}
