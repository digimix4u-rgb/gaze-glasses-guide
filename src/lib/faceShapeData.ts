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
    description: "The oval face is considered the ideal shape for glasses. Your face is longer than it is wide, with a gently rounded jawline.",
    characteristics: [
      "Face length is about 1.5 times the width",
      "Forehead is slightly wider than the chin",
      "Cheekbones are the widest part",
      "Soft, rounded jawline"
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
    description: "Round faces have soft curves with similar width and length. Angular frames can add definition and structure.",
    characteristics: [
      "Face width and length are nearly equal",
      "Rounded hairline and jawline",
      "Full cheeks",
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
    description: "Square faces feature a strong jawline and broad forehead. Round or oval frames can soften angular features.",
    characteristics: [
      "Strong, angular jawline",
      "Broad forehead",
      "Wide cheekbones",
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
    description: "Heart-shaped faces are wider at the forehead and narrower at the chin. Bottom-heavy frames balance proportions.",
    characteristics: [
      "Wide forehead",
      "High cheekbones",
      "Narrow, pointed chin",
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
    description: "Oblong faces are longer than they are wide with a straight cheek line. Oversized or decorative frames add width.",
    characteristics: [
      "Face is notably longer than wide",
      "Straight cheek line",
      "Similar forehead and jaw width",
      "May have high forehead"
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
    description: "Diamond faces have wide cheekbones with a narrow forehead and jawline. Oval frames complement this rare shape.",
    characteristics: [
      "Narrow forehead and jawline",
      "Wide, high cheekbones",
      "Pointed chin",
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
  }
];

export interface GlassesFrame {
  id: string;
  name: string;
  style: string;
  bestFor: string[];
  imageUrl: string;
  color: string;
}

export const glassesFrames: GlassesFrame[] = [
  {
    id: "classic-square",
    name: "Classic Square",
    style: "Square",
    bestFor: ["oval", "round", "oblong"],
    imageUrl: "/frames/classic-square.jpg",
    color: "Tortoise"
  },
  {
    id: "round-windsor",
    name: "Windsor Round",
    style: "Round",
    bestFor: ["square", "heart", "diamond"],
    imageUrl: "/frames/windsor-round.jpg",
    color: "Gold"
  },
  {
    id: "aviator-classic",
    name: "Aviator Classic",
    style: "Aviator",
    bestFor: ["oval", "square", "oblong"],
    imageUrl: "/frames/aviator-classic.jpg",
    color: "Silver"
  },
  {
    id: "cat-eye-retro",
    name: "Retro Cat Eye",
    style: "Cat Eye",
    bestFor: ["oval", "diamond", "round"],
    imageUrl: "/frames/cat-eye-retro.jpg",
    color: "Black"
  },
  {
    id: "rectangle-modern",
    name: "Modern Rectangle",
    style: "Rectangle",
    bestFor: ["round", "oval", "oblong"],
    imageUrl: "/frames/rectangle-modern.jpg",
    color: "Matte Black"
  },
  {
    id: "geometric-bold",
    name: "Bold Geometric",
    style: "Geometric",
    bestFor: ["oval", "round"],
    imageUrl: "/frames/geometric-bold.jpg",
    color: "Amber"
  },
  {
    id: "browline-vintage",
    name: "Vintage Browline",
    style: "Browline",
    bestFor: ["round", "oval", "heart"],
    imageUrl: "/frames/browline-vintage.jpg",
    color: "Dark Tortoise"
  },
  {
    id: "oval-rimless",
    name: "Rimless Oval",
    style: "Rimless",
    bestFor: ["square", "diamond", "heart"],
    imageUrl: "/frames/rimless-oval.jpg",
    color: "Clear"
  }
];

export function getRecommendedFrames(faceShapeId: string): GlassesFrame[] {
  return glassesFrames.filter(frame => frame.bestFor.includes(faceShapeId));
}

export function getFaceShapeById(id: string): FaceShape | undefined {
  return faceShapes.find(shape => shape.id === id);
}
