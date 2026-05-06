import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.generateTileTextures();
    this.generateObjectTextures();

    const width = this.scale.width;
    const height = this.scale.height;
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);
  }

  create() {
    this.scene.start('GameScene');
  }

  private generateTileTextures() {
    const makeDiamond = (color: number, strokeColor: number, name: string) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color, 1);
      g.fillPoints([
        new Phaser.Math.Vector2(32, 0),
        new Phaser.Math.Vector2(64, 16),
        new Phaser.Math.Vector2(32, 32),
        new Phaser.Math.Vector2(0, 16),
      ]);
      g.lineStyle(1, strokeColor, 0.5);
      g.strokePoints([
        new Phaser.Math.Vector2(32, 0),
        new Phaser.Math.Vector2(64, 16),
        new Phaser.Math.Vector2(32, 32),
        new Phaser.Math.Vector2(0, 16),
      ], true);
      g.generateTexture(name, 64, 32);
      g.destroy();
    };

    makeDiamond(0x4ade80, 0x22c55e, 'grass');
    makeDiamond(0xd97706, 0xb45309, 'dirt');
    makeDiamond(0x3b82f6, 0x1d4ed8, 'water');
  }

  private generateObjectTextures() {
    // Tree
    const treeGraphics = this.make.graphics({ x: 0, y: 0 });
    treeGraphics.fillStyle(0x78350f, 1);
    treeGraphics.fillRect(12, 20, 8, 20);
    treeGraphics.fillStyle(0x15803d, 1);
    treeGraphics.fillCircle(16, 16, 14);
    treeGraphics.fillStyle(0x22c55e, 1);
    treeGraphics.fillCircle(16, 12, 10);
    treeGraphics.generateTexture('tree', 32, 40);
    treeGraphics.destroy();

    // Rock
    const rockGraphics = this.make.graphics({ x: 0, y: 0 });
    rockGraphics.fillStyle(0x6b7280, 1);
    rockGraphics.fillCircle(16, 20, 12);
    rockGraphics.fillStyle(0x9ca3af, 1);
    rockGraphics.fillCircle(14, 18, 8);
    rockGraphics.generateTexture('rock', 32, 32);
    rockGraphics.destroy();

    // House
    const houseGraphics = this.make.graphics({ x: 0, y: 0 });
    houseGraphics.fillStyle(0x92400e, 1);
    houseGraphics.fillRect(4, 16, 40, 24);
    houseGraphics.fillStyle(0xb45309, 1);
    houseGraphics.fillPoints([
      new Phaser.Math.Vector2(24, 0),
      new Phaser.Math.Vector2(48, 16),
      new Phaser.Math.Vector2(0, 16),
    ]);
    houseGraphics.fillStyle(0x78350f, 1);
    houseGraphics.fillRect(18, 28, 12, 12);
    houseGraphics.generateTexture('house', 48, 40);
    houseGraphics.destroy();

    // Anvil
    const anvilGraphics = this.make.graphics({ x: 0, y: 0 });
    anvilGraphics.fillStyle(0x4b5563, 1);
    anvilGraphics.fillRect(12, 24, 8, 16);
    anvilGraphics.fillStyle(0x9ca3af, 1);
    anvilGraphics.fillRect(4, 16, 24, 10);
    anvilGraphics.fillStyle(0xd1d5db, 1);
    anvilGraphics.fillRect(6, 18, 20, 4);
    anvilGraphics.generateTexture('anvil', 32, 40);
    anvilGraphics.destroy();

    // Fletching table
    const fletchingGraphics = this.make.graphics({ x: 0, y: 0 });
    fletchingGraphics.fillStyle(0x78350f, 1);
    fletchingGraphics.fillRect(8, 24, 4, 16);
    fletchingGraphics.fillRect(20, 24, 4, 16);
    fletchingGraphics.fillStyle(0x92400e, 1);
    fletchingGraphics.fillRect(4, 20, 28, 8);
    fletchingGraphics.fillStyle(0xa16207, 1);
    fletchingGraphics.fillRect(8, 18, 4, 4);
    fletchingGraphics.fillRect(20, 18, 4, 4);
    fletchingGraphics.generateTexture('fletching_table', 32, 40);
    fletchingGraphics.destroy();
  }
}
