import Phaser from 'phaser';
import { cartesianToIsometric, screenToWorld, getDepth } from '../utils/Isometric.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { gameState } from '../managers/GameStateManager.js';
import { inventoryManager } from '../managers/InventoryManager.js';
import { skillManager } from '../managers/SkillManager.js';
import { questManager } from '../managers/QuestManager.js';
import { uiManager } from '../managers/UIManager.js';
import { gatheringManager } from '../managers/GatheringManager.js';
import { MAP_WIDTH, MAP_HEIGHT } from '@rpg/shared';

// Simple 20x20 map data (0=grass, 1=dirt, 2=water)
const TILE_MAP = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Objects: { type: 'tree'|'rock'|'house', x, y }
const OBJECTS = [
  // Trees
  { type: 'tree', x: 2, y: 2 },
  { type: 'tree', x: 4, y: 3 },
  { type: 'tree', x: 6, y: 2 },
  { type: 'tree', x: 8, y: 4 },
  { type: 'tree', x: 1, y: 5 },
  { type: 'tree', x: 3, y: 7 },
  { type: 'tree', x: 5, y: 6 },
  { type: 'tree', x: 7, y: 8 },
  { type: 'tree', x: 9, y: 7 },
  { type: 'tree', x: 11, y: 3 },
  { type: 'tree', x: 13, y: 5 },
  { type: 'tree', x: 15, y: 2 },
  { type: 'tree', x: 17, y: 4 },
  { type: 'tree', x: 19, y: 6 },
  { type: 'tree', x: 14, y: 8 },
  { type: 'tree', x: 16, y: 10 },
  { type: 'tree', x: 18, y: 8 },
  { type: 'tree', x: 12, y: 12 },
  // Rocks
  { type: 'rock', x: 5, y: 4 },
  { type: 'rock', x: 7, y: 3 },
  { type: 'rock', x: 9, y: 5 },
  { type: 'rock', x: 4, y: 6 },
  { type: 'rock', x: 6, y: 8 },
  { type: 'rock', x: 8, y: 10 },
  { type: 'rock', x: 10, y: 8 },
  { type: 'rock', x: 12, y: 6 },
  // House
  { type: 'house', x: 10, y: 10 },
];

const TILE_TEXTURES: Record<number, string> = {
  0: 'grass',
  1: 'dirt',
  2: 'water',
};

interface GatherableSprite extends Phaser.GameObjects.Image {
  gatherId?: string;
  tileX?: number;
  tileY?: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private tiles: Phaser.GameObjects.Image[] = [];
  private gatherableSprites: GatherableSprite[] = [];
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private cameraDragStartX: number = 0;
  private cameraDragStartY: number = 0;
  private progressBar!: Phaser.GameObjects.Container;
  private progressBg!: Phaser.GameObjects.Rectangle;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private gatherTargetIndicator!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.renderMap();
    this.renderObjects();
    this.createProgressBar();
    this.createGatherTargetIndicator();

    // Create player at center-ish
    this.player = new Player(this, 10, 10);
    gameState.setPlayerPosition(10, 10);

    // Create NPC
    new NPC(this, 12, 11, 'Guide', 0x22c55e);

    // Camera setup
    this.cameras.main.setBounds(-800, -400, 1600, 1200);
    this.cameras.main.setZoom(1.2);

    // Input handling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 1 || pointer.button === 2) {
        // Right/middle click - camera drag
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.cameraDragStartX = this.cameras.main.scrollX;
        this.cameraDragStartY = this.cameras.main.scrollY;
      } else if (pointer.button === 0) {
        // Left click - check if we hit a game object
        const objectsClicked = this.input.hitTestPointer(pointer);
        if (objectsClicked.length === 0) {
          // Clicked empty ground - walk there
          const tile = screenToWorld(pointer.worldX, pointer.worldY);
          const tileX = Math.round(tile.x);
          const tileY = Math.round(tile.y);

          if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
            this.player.moveToTile(tileX, tileY);
            gameState.setPlayerPosition(tileX, tileY);
          }
        }
        // If objects were clicked, let their own handlers deal with it
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        this.cameras.main.setScroll(
          this.cameraDragStartX - dx / this.cameras.main.zoom,
          this.cameraDragStartY - dy / this.cameras.main.zoom
        );
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom - deltaY * 0.001, 0.5, 3);
      this.cameras.main.setZoom(newZoom);
    });

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-F1', () => uiManager.togglePanel('inventory'));
    this.input.keyboard?.on('keydown-F2', () => uiManager.togglePanel('equipment'));
    this.input.keyboard?.on('keydown-F3', () => uiManager.togglePanel('skills'));
    this.input.keyboard?.on('keydown-F4', () => uiManager.togglePanel('quests'));
    this.input.keyboard?.on('keydown-F5', () => uiManager.togglePanel('chat'));
    this.input.keyboard?.on('keydown-ENTER', () => uiManager.showPanel('chat'));

    // Starter items
    inventoryManager.addItem('logs', 5);
    inventoryManager.addItem('bronze_dagger', 1);
    inventoryManager.addItem('wooden_shield', 1);

    // Start tutorial quest
    questManager.startQuest('tutorial');

    gameState.addChatMessage('System', 'Welcome! Click trees/rocks to gather, or ground to move. F1-F5 for panels.');
  }

  update(time: number, delta: number) {
    this.player.update(time, delta);

    // Update progress bar
    if (gatheringManager.isCurrentlyGathering()) {
      this.progressBar.setVisible(true);
      const targetId = gatheringManager.getCurrentTarget();
      if (targetId) {
        const obj = gatheringManager.getObjects().find(o => `${o.type}_${o.x}_${o.y}` === targetId);
        if (obj) {
          const iso = cartesianToIsometric(obj.x, obj.y);
          this.progressBar.setPosition(iso.x, iso.y - 50);
        }
      }
      const progress = gatheringManager.getProgress();
      this.progressFill.width = 48 * progress;
    } else {
      this.progressBar.setVisible(false);
    }

    // Camera follow player
    if (!this.isDragging) {
      const targetX = this.player.x - this.cameras.main.width / 2 / this.cameras.main.zoom;
      const targetY = this.player.y - this.cameras.main.height / 2 / this.cameras.main.zoom;
      this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * 0.05;
      this.cameras.main.scrollY += (targetY - this.cameras.main.scrollY) * 0.05;
    }
  }

  private renderMap() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tileType = TILE_MAP[y]?.[x] ?? 0;
        const iso = cartesianToIsometric(x, y);
        const tile = this.add.image(iso.x, iso.y, TILE_TEXTURES[tileType] || 'grass');
        tile.setDepth(getDepth(x, y, 0));
        this.tiles.push(tile);
      }
    }
  }

  private renderObjects() {
    for (const obj of OBJECTS) {
      const iso = cartesianToIsometric(obj.x, obj.y);
      
      if (obj.type === 'tree' || obj.type === 'rock') {
        // Create gatherable sprite with interactive click
        const gatherId = `${obj.type}_${obj.x}_${obj.y}`;
        gatheringManager.registerObject(obj.type as 'tree' | 'rock', obj.x, obj.y);

        const sprite: GatherableSprite = this.add.image(iso.x, iso.y - 16, obj.type);
        sprite.setDepth(getDepth(obj.x, obj.y, 2));
        sprite.setOrigin(0.5, 1);
        sprite.gatherId = gatherId;
        sprite.tileX = obj.x;
        sprite.tileY = obj.y;
        
        // Make it interactive
        sprite.setInteractive();
        
        // Hover effect
        sprite.on('pointerover', () => {
          if (gatheringManager.canGather(gatherId)) {
            this.input.setDefaultCursor('pointer');
            sprite.setTint(0xcccccc);
          }
        });
        
        sprite.on('pointerout', () => {
          this.input.setDefaultCursor('default');
          sprite.clearTint();
        });
        
        // Click to gather
        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.button !== 0) return; // Only left click
          
          if (!gatheringManager.canGather(gatherId)) return;
          
          // Walk to the object
          this.player.moveToTile(obj.x, obj.y);
          gameState.setPlayerPosition(obj.x, obj.y);
          
          // Show target indicator
          this.showTargetIndicator(obj.x, obj.y);
          
          // Start gathering after arrival
          this.time.delayedCall(600, () => {
            if (gatheringManager.canGather(gatherId)) {
              gatheringManager.startGathering(gatherId, () => {
                this.onGatherComplete(gatherId);
              });
            }
          });
        });
        
        this.gatherableSprites.push(sprite);
      } else {
        // Non-gatherable (house)
        const sprite = this.add.image(iso.x, iso.y - 16, obj.type);
        sprite.setDepth(getDepth(obj.x, obj.y, 2));
        sprite.setOrigin(0.5, 1);
      }
    }
  }

  private createProgressBar() {
    this.progressBar = this.add.container(0, 0);
    this.progressBar.setDepth(1000);
    this.progressBar.setVisible(false);

    this.progressBg = this.add.rectangle(0, 0, 50, 8, 0x000000, 0.8);
    this.progressBg.setStrokeStyle(1, 0xffffff, 0.5);
    this.progressBar.add(this.progressBg);

    this.progressFill = this.add.rectangle(-24, 0, 0, 6, 0x4ade80, 1);
    this.progressFill.setOrigin(0, 0.5);
    this.progressBar.add(this.progressFill);
  }

  private createGatherTargetIndicator() {
    this.gatherTargetIndicator = this.add.container(0, 0);
    this.gatherTargetIndicator.setDepth(999);
    this.gatherTargetIndicator.setVisible(false);
    
    const diamond = this.add.polygon(0, 0, [
      new Phaser.Math.Vector2(0, -20),
      new Phaser.Math.Vector2(32, 0),
      new Phaser.Math.Vector2(0, 20),
      new Phaser.Math.Vector2(-32, 0),
    ], 0x4ade80, 0.3);
    diamond.setStrokeStyle(2, 0x4ade80, 0.8);
    this.gatherTargetIndicator.add(diamond);
    
    // Flash animation
    this.tweens.add({
      targets: diamond,
      alpha: 0.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  private showTargetIndicator(tileX: number, tileY: number) {
    const iso = cartesianToIsometric(tileX, tileY);
    this.gatherTargetIndicator.setPosition(iso.x, iso.y);
    this.gatherTargetIndicator.setVisible(true);
    
    this.time.delayedCall(1000, () => {
      this.gatherTargetIndicator.setVisible(false);
    });
  }

  private onGatherComplete(gatherId: string) {
    // Update sprite appearance if depleted
    const obj = gatheringManager.getObjects().find(o => `${o.type}_${o.x}_${o.y}` === gatherId);
    if (obj && obj.depleted) {
      const sprite = this.gatherableSprites.find(s => s.gatherId === gatherId);
      if (sprite) {
        sprite.setAlpha(0.3);
        sprite.disableInteractive();
      }
      
      // Respawn after delay
      this.time.delayedCall(15000, () => {
        if (sprite) {
          sprite.setAlpha(1);
          sprite.setInteractive();
        }
      });
    }
  }
}
