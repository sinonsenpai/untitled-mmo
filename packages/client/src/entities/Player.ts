import Phaser from 'phaser';
import { cartesianToIsometric, isometricToCartesian, getDepth } from '../utils/Isometric.js';

export class Player extends Phaser.GameObjects.Container {
  private targetTileX: number;
  private targetTileY: number;
  private isMoving: boolean = false;
  private speed: number = 3;
  private currentTileX: number;
  private currentTileY: number;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    const iso = cartesianToIsometric(tileX, tileY);
    super(scene, iso.x, iso.y);

    this.currentTileX = tileX;
    this.currentTileY = tileY;
    this.targetTileX = tileX;
    this.targetTileY = tileY;

    // Shadow under feet
    const shadow = scene.add.ellipse(0, 14, 20, 8, 0x000000, 0.3);
    this.add(shadow);

    // Body - positioned so feet align with tile bottom (y=+16)
    const body = scene.add.rectangle(0, -2, 24, 36, 0x3b82f6);
    body.setStrokeStyle(2, 0x1d4ed8);
    this.add(body);

    // Head - sits on top of body
    const head = scene.add.rectangle(0, -28, 16, 16, 0xfcd34d);
    head.setStrokeStyle(2, 0xd97706);
    this.add(head);

    // Selection indicator - around the feet area
    const selectBox = scene.add.rectangle(0, 10, 28, 20);
    selectBox.setStrokeStyle(1, 0xffffff, 0.5);
    this.add(selectBox);

    this.setDepth(getDepth(tileX, tileY, 10));
    scene.add.existing(this);
  }

  moveToTile(tileX: number, tileY: number) {
    this.targetTileX = tileX;
    this.targetTileY = tileY;
    this.isMoving = true;
  }

  update(_time: number, _delta: number) {
    if (this.isMoving) {
      const targetIso = cartesianToIsometric(this.targetTileX, this.targetTileY);
      const dx = targetIso.x - this.x;
      const dy = targetIso.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.speed) {
        this.x = targetIso.x;
        this.y = targetIso.y;
        this.currentTileX = this.targetTileX;
        this.currentTileY = this.targetTileY;
        this.isMoving = false;
      } else {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }
    }

    // Always update depth based on current position
    // Round tile coords so depth snaps to nearest tile - prevents clipping during movement
    const currentTilePos = isometricToCartesian(this.x, this.y);
    this.setDepth(getDepth(Math.round(currentTilePos.x), Math.round(currentTilePos.y), 10));
  }

  getTilePosition(): { x: number; y: number } {
    return { x: this.currentTileX, y: this.currentTileY };
  }
}
