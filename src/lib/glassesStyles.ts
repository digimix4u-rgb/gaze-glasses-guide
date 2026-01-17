// SVG path definitions for different glasses frame styles
export interface GlassesStyle {
  id: string;
  name: string;
  color: string;
  frameColor: string;
  lensOpacity: number;
  // Path drawing function that takes dimensions
  drawFrame: (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameColor: string,
    lensColor: string,
    lensOpacity: number
  ) => void;
}

// Helper to draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Draw square/rectangular frames
function drawSquareFrame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  frameColor: string,
  lensColor: string,
  lensOpacity: number
) {
  const lensWidth = width * 0.38;
  const lensHeight = height * 0.7;
  const bridgeWidth = width * 0.08;
  const frameThickness = Math.max(3, width * 0.02);
  const cornerRadius = lensHeight * 0.15;
  
  // Left lens
  const leftLensX = centerX - bridgeWidth / 2 - lensWidth;
  const lensY = centerY - lensHeight / 2;
  
  // Right lens
  const rightLensX = centerX + bridgeWidth / 2;
  
  // Draw lenses (filled)
  ctx.fillStyle = lensColor;
  ctx.globalAlpha = lensOpacity;
  
  roundRect(ctx, leftLensX, lensY, lensWidth, lensHeight, cornerRadius);
  ctx.fill();
  
  roundRect(ctx, rightLensX, lensY, lensWidth, lensHeight, cornerRadius);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Draw frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  roundRect(ctx, leftLensX, lensY, lensWidth, lensHeight, cornerRadius);
  ctx.stroke();
  
  roundRect(ctx, rightLensX, lensY, lensWidth, lensHeight, cornerRadius);
  ctx.stroke();
  
  // Bridge
  ctx.beginPath();
  ctx.moveTo(leftLensX + lensWidth, centerY);
  ctx.lineTo(rightLensX, centerY);
  ctx.stroke();
  
  // Temples (arms)
  const templeLength = width * 0.15;
  ctx.beginPath();
  ctx.moveTo(leftLensX, centerY - lensHeight * 0.3);
  ctx.lineTo(leftLensX - templeLength, centerY - lensHeight * 0.2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(rightLensX + lensWidth, centerY - lensHeight * 0.3);
  ctx.lineTo(rightLensX + lensWidth + templeLength, centerY - lensHeight * 0.2);
  ctx.stroke();
}

// Draw round frames
function drawRoundFrame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  frameColor: string,
  lensColor: string,
  lensOpacity: number
) {
  const lensRadius = Math.min(width * 0.18, height * 0.35);
  const bridgeWidth = width * 0.1;
  const frameThickness = Math.max(2, width * 0.015);
  
  const leftCenterX = centerX - bridgeWidth / 2 - lensRadius;
  const rightCenterX = centerX + bridgeWidth / 2 + lensRadius;
  
  // Draw lenses
  ctx.fillStyle = lensColor;
  ctx.globalAlpha = lensOpacity;
  
  ctx.beginPath();
  ctx.arc(leftCenterX, centerY, lensRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(rightCenterX, centerY, lensRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Draw frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  
  ctx.beginPath();
  ctx.arc(leftCenterX, centerY, lensRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(rightCenterX, centerY, lensRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Bridge
  ctx.beginPath();
  ctx.moveTo(leftCenterX + lensRadius, centerY);
  ctx.lineTo(rightCenterX - lensRadius, centerY);
  ctx.stroke();
  
  // Temples
  const templeLength = width * 0.12;
  ctx.beginPath();
  ctx.moveTo(leftCenterX - lensRadius, centerY - lensRadius * 0.3);
  ctx.lineTo(leftCenterX - lensRadius - templeLength, centerY - lensRadius * 0.1);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(rightCenterX + lensRadius, centerY - lensRadius * 0.3);
  ctx.lineTo(rightCenterX + lensRadius + templeLength, centerY - lensRadius * 0.1);
  ctx.stroke();
}

// Draw aviator frames
function drawAviatorFrame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  frameColor: string,
  lensColor: string,
  lensOpacity: number
) {
  const lensWidth = width * 0.36;
  const lensHeight = height * 0.8;
  const bridgeWidth = width * 0.06;
  const frameThickness = Math.max(2, width * 0.012);
  
  const leftLensX = centerX - bridgeWidth / 2 - lensWidth;
  const rightLensX = centerX + bridgeWidth / 2;
  const lensY = centerY - lensHeight * 0.4;
  
  // Aviator lens shape (teardrop)
  function drawAviatorLens(startX: number, startY: number) {
    ctx.beginPath();
    ctx.moveTo(startX + lensWidth * 0.1, startY);
    ctx.quadraticCurveTo(startX + lensWidth, startY, startX + lensWidth, startY + lensHeight * 0.5);
    ctx.quadraticCurveTo(startX + lensWidth, startY + lensHeight, startX + lensWidth * 0.5, startY + lensHeight);
    ctx.quadraticCurveTo(startX, startY + lensHeight, startX, startY + lensHeight * 0.5);
    ctx.quadraticCurveTo(startX, startY, startX + lensWidth * 0.1, startY);
    ctx.closePath();
  }
  
  // Draw lenses
  ctx.fillStyle = lensColor;
  ctx.globalAlpha = lensOpacity;
  
  drawAviatorLens(leftLensX, lensY);
  ctx.fill();
  
  drawAviatorLens(rightLensX, lensY);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Draw frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  
  drawAviatorLens(leftLensX, lensY);
  ctx.stroke();
  
  drawAviatorLens(rightLensX, lensY);
  ctx.stroke();
  
  // Bridge (curved)
  ctx.beginPath();
  ctx.moveTo(leftLensX + lensWidth, lensY + lensHeight * 0.3);
  ctx.quadraticCurveTo(centerX, lensY + lensHeight * 0.1, rightLensX, lensY + lensHeight * 0.3);
  ctx.stroke();
  
  // Nose pads
  ctx.beginPath();
  ctx.arc(centerX - bridgeWidth * 0.8, lensY + lensHeight * 0.5, frameThickness * 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(centerX + bridgeWidth * 0.8, lensY + lensHeight * 0.5, frameThickness * 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Temples
  const templeLength = width * 0.12;
  ctx.beginPath();
  ctx.moveTo(leftLensX, lensY + lensHeight * 0.2);
  ctx.lineTo(leftLensX - templeLength, lensY + lensHeight * 0.3);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(rightLensX + lensWidth, lensY + lensHeight * 0.2);
  ctx.lineTo(rightLensX + lensWidth + templeLength, lensY + lensHeight * 0.3);
  ctx.stroke();
}

// Draw cat-eye frames
function drawCatEyeFrame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  frameColor: string,
  lensColor: string,
  lensOpacity: number
) {
  const lensWidth = width * 0.38;
  const lensHeight = height * 0.6;
  const bridgeWidth = width * 0.06;
  const frameThickness = Math.max(3, width * 0.02);
  
  const leftLensX = centerX - bridgeWidth / 2 - lensWidth;
  const rightLensX = centerX + bridgeWidth / 2;
  const lensY = centerY - lensHeight * 0.4;
  
  // Cat-eye lens shape
  function drawCatEyeLens(startX: number, startY: number, isLeft: boolean) {
    const wingX = isLeft ? startX : startX + lensWidth;
    const wingDir = isLeft ? -1 : 1;
    
    ctx.beginPath();
    ctx.moveTo(startX + lensWidth * 0.2, startY + lensHeight);
    ctx.quadraticCurveTo(startX, startY + lensHeight, startX, startY + lensHeight * 0.6);
    ctx.quadraticCurveTo(startX, startY + lensHeight * 0.2, startX + lensWidth * 0.3, startY);
    ctx.lineTo(startX + lensWidth * 0.7, startY);
    ctx.quadraticCurveTo(startX + lensWidth, startY + lensHeight * 0.2, startX + lensWidth, startY + lensHeight * 0.6);
    ctx.quadraticCurveTo(startX + lensWidth, startY + lensHeight, startX + lensWidth * 0.8, startY + lensHeight);
    ctx.closePath();
  }
  
  // Draw lenses
  ctx.fillStyle = lensColor;
  ctx.globalAlpha = lensOpacity;
  
  drawCatEyeLens(leftLensX, lensY, true);
  ctx.fill();
  
  drawCatEyeLens(rightLensX, lensY, false);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Draw frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  
  drawCatEyeLens(leftLensX, lensY, true);
  ctx.stroke();
  
  drawCatEyeLens(rightLensX, lensY, false);
  ctx.stroke();
  
  // Decorative wings
  ctx.lineWidth = frameThickness * 1.5;
  ctx.beginPath();
  ctx.moveTo(leftLensX + lensWidth * 0.3, lensY);
  ctx.lineTo(leftLensX - lensWidth * 0.1, lensY - lensHeight * 0.15);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(rightLensX + lensWidth * 0.7, lensY);
  ctx.lineTo(rightLensX + lensWidth * 1.1, lensY - lensHeight * 0.15);
  ctx.stroke();
  
  // Bridge
  ctx.lineWidth = frameThickness;
  ctx.beginPath();
  ctx.moveTo(leftLensX + lensWidth, centerY);
  ctx.lineTo(rightLensX, centerY);
  ctx.stroke();
}

// Draw browline frames
function drawBrowlineFrame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  frameColor: string,
  lensColor: string,
  lensOpacity: number
) {
  const lensWidth = width * 0.36;
  const lensHeight = height * 0.65;
  const bridgeWidth = width * 0.08;
  const frameThickness = Math.max(2, width * 0.012);
  const browThickness = Math.max(5, width * 0.035);
  
  const leftLensX = centerX - bridgeWidth / 2 - lensWidth;
  const rightLensX = centerX + bridgeWidth / 2;
  const lensY = centerY - lensHeight * 0.35;
  
  // Draw lenses (semi-rimless bottom)
  ctx.fillStyle = lensColor;
  ctx.globalAlpha = lensOpacity;
  
  roundRect(ctx, leftLensX, lensY, lensWidth, lensHeight, lensHeight * 0.1);
  ctx.fill();
  
  roundRect(ctx, rightLensX, lensY, lensWidth, lensHeight, lensHeight * 0.1);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Draw thin rim (bottom only)
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  
  // Left lens bottom rim
  ctx.beginPath();
  ctx.arc(leftLensX + lensWidth / 2, lensY + lensHeight / 2, lensHeight / 2.2, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  
  // Right lens bottom rim
  ctx.beginPath();
  ctx.arc(rightLensX + lensWidth / 2, lensY + lensHeight / 2, lensHeight / 2.2, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  
  // Draw bold brow bar
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  roundRect(ctx, leftLensX - width * 0.02, lensY - browThickness * 0.3, lensWidth + width * 0.04, browThickness, browThickness * 0.3);
  ctx.fill();
  
  roundRect(ctx, rightLensX - width * 0.02, lensY - browThickness * 0.3, lensWidth + width * 0.04, browThickness, browThickness * 0.3);
  ctx.fill();
  
  // Bridge
  ctx.lineWidth = browThickness * 0.6;
  ctx.strokeStyle = frameColor;
  ctx.beginPath();
  ctx.moveTo(leftLensX + lensWidth, lensY + browThickness * 0.2);
  ctx.lineTo(rightLensX, lensY + browThickness * 0.2);
  ctx.stroke();
  
  // Temples
  const templeLength = width * 0.12;
  ctx.lineWidth = browThickness * 0.5;
  ctx.beginPath();
  ctx.moveTo(leftLensX - width * 0.02, lensY + browThickness * 0.2);
  ctx.lineTo(leftLensX - templeLength, lensY + browThickness * 0.4);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(rightLensX + lensWidth + width * 0.02, lensY + browThickness * 0.2);
  ctx.lineTo(rightLensX + lensWidth + templeLength, lensY + browThickness * 0.4);
  ctx.stroke();
}

// Draw geometric frames
function drawGeometricFrame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  frameColor: string,
  lensColor: string,
  lensOpacity: number
) {
  const lensWidth = width * 0.35;
  const lensHeight = height * 0.6;
  const bridgeWidth = width * 0.08;
  const frameThickness = Math.max(3, width * 0.02);
  
  const leftLensX = centerX - bridgeWidth / 2 - lensWidth;
  const rightLensX = centerX + bridgeWidth / 2;
  const lensY = centerY - lensHeight / 2;
  
  // Hexagonal lens shape
  function drawHexLens(startX: number, startY: number) {
    const w = lensWidth;
    const h = lensHeight;
    ctx.beginPath();
    ctx.moveTo(startX + w * 0.2, startY);
    ctx.lineTo(startX + w * 0.8, startY);
    ctx.lineTo(startX + w, startY + h * 0.35);
    ctx.lineTo(startX + w, startY + h * 0.65);
    ctx.lineTo(startX + w * 0.8, startY + h);
    ctx.lineTo(startX + w * 0.2, startY + h);
    ctx.lineTo(startX, startY + h * 0.65);
    ctx.lineTo(startX, startY + h * 0.35);
    ctx.closePath();
  }
  
  // Draw lenses
  ctx.fillStyle = lensColor;
  ctx.globalAlpha = lensOpacity;
  
  drawHexLens(leftLensX, lensY);
  ctx.fill();
  
  drawHexLens(rightLensX, lensY);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Draw frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  ctx.lineJoin = 'round';
  
  drawHexLens(leftLensX, lensY);
  ctx.stroke();
  
  drawHexLens(rightLensX, lensY);
  ctx.stroke();
  
  // Bridge
  ctx.beginPath();
  ctx.moveTo(leftLensX + lensWidth, centerY);
  ctx.lineTo(rightLensX, centerY);
  ctx.stroke();
  
  // Temples
  const templeLength = width * 0.12;
  ctx.beginPath();
  ctx.moveTo(leftLensX, centerY - lensHeight * 0.15);
  ctx.lineTo(leftLensX - templeLength, centerY - lensHeight * 0.05);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(rightLensX + lensWidth, centerY - lensHeight * 0.15);
  ctx.lineTo(rightLensX + lensWidth + templeLength, centerY - lensHeight * 0.05);
  ctx.stroke();
}

export const glassesStyles: GlassesStyle[] = [
  {
    id: 'classic-square',
    name: 'Classic Square',
    color: 'Tortoise',
    frameColor: '#8B4513',
    lensOpacity: 0.15,
    drawFrame: drawSquareFrame,
  },
  {
    id: 'round-windsor',
    name: 'Windsor Round',
    color: 'Gold',
    frameColor: '#DAA520',
    lensOpacity: 0.1,
    drawFrame: drawRoundFrame,
  },
  {
    id: 'aviator-classic',
    name: 'Aviator Classic',
    color: 'Silver',
    frameColor: '#A0A0A0',
    lensOpacity: 0.25,
    drawFrame: drawAviatorFrame,
  },
  {
    id: 'cat-eye-retro',
    name: 'Retro Cat Eye',
    color: 'Black',
    frameColor: '#1a1a1a',
    lensOpacity: 0.12,
    drawFrame: drawCatEyeFrame,
  },
  {
    id: 'rectangle-modern',
    name: 'Modern Rectangle',
    color: 'Matte Black',
    frameColor: '#2d2d2d',
    lensOpacity: 0.1,
    drawFrame: drawSquareFrame,
  },
  {
    id: 'geometric-bold',
    name: 'Bold Geometric',
    color: 'Amber',
    frameColor: '#D2691E',
    lensOpacity: 0.15,
    drawFrame: drawGeometricFrame,
  },
  {
    id: 'browline-vintage',
    name: 'Vintage Browline',
    color: 'Dark Tortoise',
    frameColor: '#5C4033',
    lensOpacity: 0.1,
    drawFrame: drawBrowlineFrame,
  },
  {
    id: 'oval-rimless',
    name: 'Rimless Oval',
    color: 'Clear',
    frameColor: '#C0C0C0',
    lensOpacity: 0.05,
    drawFrame: drawRoundFrame,
  },
];

export function getGlassesStyleById(id: string): GlassesStyle | undefined {
  return glassesStyles.find(style => style.id === id);
}
