import Phaser from 'phaser';
import { cartesianToIsometric, getDepth } from '../utils/Isometric.js';

export class NPC extends Phaser.GameObjects.Container {
  private nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, name: string, color: number = 0x22c55e) {
    const iso = cartesianToIsometric(tileX, tileY);
    super(scene, iso.x, iso.y);

    // Shadow under feet
    const shadow = scene.add.ellipse(0, 14, 20, 8, 0x000000, 0.3);
    this.add(shadow);

    // Body - aligned to tile bottom
    const body = scene.add.rectangle(0, -2, 24, 36, color);
    body.setStrokeStyle(2, 0x15803d);
    this.add(body);

    // Head - sits on top of body
    const head = scene.add.rectangle(0, -28, 16, 16, 0xfca5a5);
    head.setStrokeStyle(2, 0xdc2626);
    this.add(head);

    // Name tag
    this.nameText = scene.add.text(0, -48, name, {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 },
    });
    this.nameText.setOrigin(0.5, 1);
    this.add(this.nameText);

    // Use z=2000 to match player depth
    this.setDepth(getDepth(tileX, tileY, 2000));
    scene.add.existing(this);
  }
}
