import Phaser from 'phaser';
import { cartesianToIsometric, getDepth } from '../utils/Isometric.js';
import type { CombatStats } from '@rpg/shared';

export class NPC extends Phaser.GameObjects.Container {
  private nameText: Phaser.GameObjects.Text;
  private bodyRect: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Graphics | null = null;
  private healthBarBg: Phaser.GameObjects.Graphics | null = null;
  public tileX: number;
  public tileY: number;
  public isShopkeeper: boolean;
  public npcName: string;
  public combatId: string | null = null;
  public combatType: string | null = null;
  public combatStats: CombatStats | null = null;
  public isDead: boolean = false;

  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    name: string,
    color: number = 0x22c55e,
    isShopkeeper: boolean = false,
    combatId?: string,
    combatType?: string,
    combatStats?: CombatStats
  ) {
    const iso = cartesianToIsometric(tileX, tileY);
    super(scene, iso.x, iso.y);

    this.tileX = tileX;
    this.tileY = tileY;
    this.isShopkeeper = isShopkeeper;
    this.npcName = name;

    if (combatId && combatType && combatStats) {
      this.combatId = combatId;
      this.combatType = combatType;
      this.combatStats = { ...combatStats };
      this.npcName = `${name} (Lvl ${Math.floor((combatStats.defence + combatStats.hp) * 0.25 + (combatStats.attack + combatStats.strength) * 0.325)})`;
    }

    // Shadow under feet
    const shadow = scene.add.ellipse(0, 14, 20, 8, 0x000000, 0.3);
    this.add(shadow);

    // Body - aligned to tile bottom
    const bodyColor = combatStats?.aggression === 'aggressive' ? 0xef4444 : color;
    this.bodyRect = scene.add.rectangle(0, -2, 24, 36, bodyColor);
    this.bodyRect.setStrokeStyle(2, combatStats ? 0xdc2626 : 0x15803d);
    this.add(this.bodyRect);

    // Head - sits on top of body
    const head = scene.add.rectangle(0, -28, 16, 16, 0xfca5a5);
    head.setStrokeStyle(2, 0xdc2626);
    this.add(head);

    // Name tag
    this.nameText = scene.add.text(0, -60, this.npcName, {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 },
    });
    this.nameText.setOrigin(0.5, 1);
    this.add(this.nameText);

    // Health bar (only for combat NPCs)
    if (combatStats) {
      this.healthBarBg = scene.add.graphics();
      this.healthBarBg.fillStyle(0x000000, 0.6);
      this.healthBarBg.fillRect(-16, -68, 32, 4);
      this.add(this.healthBarBg);

      this.healthBar = scene.add.graphics();
      this.updateHealthBar();
      this.add(this.healthBar);
    }

    // Use z=2000 to match player depth
    this.setDepth(getDepth(tileX, tileY, 2000));

    this.setSize(32, 48);
    this.setInteractive();

    this.on('pointerover', () => {
      if (this.isDead) return;
      scene.input.setDefaultCursor('pointer');
      this.bodyRect.setFillStyle(isShopkeeper ? 0xfbbf24 : 0x4ade80);
    });

    this.on('pointerout', () => {
      if (this.isDead) return;
      scene.input.setDefaultCursor('default');
      this.bodyRect.setFillStyle(bodyColor);
    });

    scene.add.existing(this);
  }

  updateHealthBar() {
    if (!this.healthBar || !this.combatStats) return;
    const pct = Math.max(0, this.combatStats.hp / this.combatStats.maxHp);
    const color = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xfbbf24 : 0xef4444;

    this.healthBar.clear();
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(-16, -68, 32 * pct, 4);
  }

  die() {
    this.isDead = true;
    if (this.healthBar) { this.healthBar.setVisible(false); }
    if (this.healthBarBg) { this.healthBarBg.setVisible(false); }
    this.disableInteractive();
    this.bodyRect.setFillStyle(0x555555);
  }
}
