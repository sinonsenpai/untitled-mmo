import { TILE_WIDTH, TILE_HEIGHT } from '@rpg/shared';

export function cartesianToIsometric(x: number, y: number) {
  return {
    x: (x - y) * (TILE_WIDTH / 2),
    y: (x + y) * (TILE_HEIGHT / 2),
  };
}

export function isometricToCartesian(isoX: number, isoY: number) {
  return {
    x: (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2,
    y: (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2,
  };
}

export function screenToWorld(worldX: number, worldY: number) {
  return isometricToCartesian(worldX, worldY);
}

export function getDepth(x: number, y: number, z: number = 0) {
  return (x + y) * 1000 + z;
}
