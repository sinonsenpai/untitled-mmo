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
import { craftingManager } from '../managers/CraftingManager.js';
import { bankManager } from '../managers/BankManager.js';
import { shopManager } from '../managers/ShopManager.js';
import { firemakingManager } from '../managers/FiremakingManager.js';
import { combatManager } from '../managers/CombatManager.js';
import { gameNotifications } from '../ui/GameNotifications.js';
import { getItem } from '@rpg/shared';
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
  // Bank chest
  { type: 'bank_chest', x: 10, y: 6 },
  // Crafting stations
  { type: 'anvil', x: 8, y: 8 },
  { type: 'fletching_table', x: 12, y: 8 },
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
  private npcs: NPC[] = [];
  private activeDialogue: HTMLDivElement | null = null;
  private activeFires: { tileX: number; tileY: number; sprite: Phaser.GameObjects.Image; timer: Phaser.Time.TimerEvent }[] = [];
  private combatNpcs: NPC[] = [];
  private groundLoot: { sprite: Phaser.GameObjects.Image; drops: { itemId: string; quantity: number }[]; tileX: number; tileY: number; timer: Phaser.Time.TimerEvent }[] = [];

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
    const guide = new NPC(this, 12, 11, 'Guide', 0x22c55e);
    this.npcs.push(guide);

    // Create Shopkeeper
    const shopkeeper = new NPC(this, 14, 10, 'Shopkeeper', 0xfbbf24, true);
    this.npcs.push(shopkeeper);

    // Register shop data
    shopManager.registerShop('general_store', 'General Store', [
      { itemId: 'bronze_dagger', buyPrice: 100, sellPrice: 50, stock: 10 },
      { itemId: 'wooden_shield', buyPrice: 50, sellPrice: 25, stock: 10 },
      { itemId: 'bread', buyPrice: 15, sellPrice: 8, stock: 100 },
      { itemId: 'feather', buyPrice: 5, sellPrice: 2, stock: -1 },
      { itemId: 'bowstring', buyPrice: 20, sellPrice: 10, stock: -1 },
      { itemId: 'tin_ore', buyPrice: 50, sellPrice: 25, stock: -1 },
    ]);

    // Combat NPCs
    combatManager.registerProfile('cow', {
      hp: 8, maxHp: 8, attack: 1, strength: 1, defence: 1,
      aggression: 'passive', attackRange: 1,
      dropTable: {
        always: [{ itemId: 'bones', quantity: 1 }],
        common: [{ itemId: 'raw_beef', quantity: 1 }, { itemId: 'cowhide', quantity: 1 }],
      },
    });
    combatManager.registerProfile('goblin', {
      hp: 12, maxHp: 12, attack: 3, strength: 3, defence: 2,
      aggression: 'aggressive', attackRange: 1,
      dropTable: {
        always: [{ itemId: 'bones', quantity: 1 }],
        common: [{ itemId: 'coins', quantity: 5 }],
        uncommon: [{ itemId: 'bronze_helm', quantity: 1 }],
      },
    });
    combatManager.registerProfile('giant_rat', {
      hp: 5, maxHp: 5, attack: 2, strength: 2, defence: 1,
      aggression: 'aggressive', attackRange: 1,
      dropTable: {
        always: [{ itemId: 'bones', quantity: 1 }],
        common: [{ itemId: 'raw_rat_meat', quantity: 1 }],
      },
    });

    // Spawn combat NPCs
    const combatSpawns = [
      { id: 'cow1', type: 'cow', x: 3, y: 10 },
      { id: 'cow2', type: 'cow', x: 5, y: 12 },
      { id: 'cow3', type: 'cow', x: 18, y: 14 },
      { id: 'goblin1', type: 'goblin', x: 15, y: 3 },
      { id: 'goblin2', type: 'goblin', x: 17, y: 2 },
      { id: 'rat1', type: 'giant_rat', x: 8, y: 14 },
      { id: 'rat2', type: 'giant_rat', x: 9, y: 15 },
    ];

    for (const spawn of combatSpawns) {
      const profile = combatManager.getProfile(spawn.type);
      if (!profile) continue;
      combatManager.registerProfile(spawn.id, profile);
      const npc = new NPC(this, spawn.x, spawn.y, spawn.type.replace(/_/g, ' '), undefined, false, spawn.id, spawn.type, profile);
      this.combatNpcs.push(npc);
    }

    // Camera setup
    this.cameras.main.setBounds(-800, -400, 1600, 1200);
    this.cameras.main.setZoom(1.2);

    // Prevent browser from handling these keys
    this.input.keyboard?.addCapture(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F12', 'ENTER']);

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
    this.input.keyboard?.on('keydown-F6', () => uiManager.togglePanel('crafting'));
    this.input.keyboard?.on('keydown-F7', () => uiManager.togglePanel('combat'));
    this.input.keyboard?.on('keydown-ENTER', () => uiManager.showPanel('chat'));
    this.input.keyboard?.on('keydown-B', () => {
      gameState['emit']('bank', gameState.getState().player.bank);
      uiManager.togglePanel('bank');
    });

    // NPC click handling
    this.npcs.forEach((npc) => {
      npc.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.button !== 0) return;
        this.dismissDialogue();
        this.player.moveToTile(npc.tileX, npc.tileY);
        gameState.setPlayerPosition(npc.tileX, npc.tileY);
        this.time.delayedCall(600, () => {
          if (npc.isShopkeeper) {
            shopManager.openShop('general_store');
            uiManager.showPanel('shop');
          } else {
            this.showDialogue(npc);
          }
        });
      });
    });

    // Combat NPC click handling
    this.combatNpcs.forEach((npc) => {
      npc.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.button !== 0 || npc.isDead) return;
        this.dismissDialogue();
        // Walk adjacent to NPC
        const dx = npc.tileX - Math.round(gameState.getState().player.position.x);
        const dy = npc.tileY - Math.round(gameState.getState().player.position.y);
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const walkX = dist > 1 ? npc.tileX - (dx > 0 ? 1 : dx < 0 ? -1 : 0) : Math.round(gameState.getState().player.position.x);
        const walkY = dist > 1 ? npc.tileY - (dy > 0 ? 1 : dy < 0 ? -1 : 0) : Math.round(gameState.getState().player.position.y);
        this.player.moveToTile(walkX, walkY);
        gameState.setPlayerPosition(walkX, walkY);
        this.time.delayedCall(600, () => {
          if (npc.combatId) {
            combatManager.startCombat(npc.combatId, npc.npcName.replace(/ *\(Lvl \d+\)/, ''));
          }
        });
      });
    });

    // Starter items
    inventoryManager.addItem('logs', 5);
    inventoryManager.addItem('bronze_dagger', 1);
    inventoryManager.addItem('wooden_shield', 1);

    // Phase 1 starter materials
    inventoryManager.addItem('copper_ore', 10);
    inventoryManager.addItem('tin_ore', 10);
    inventoryManager.addItem('logs', 10);
    inventoryManager.addItem('feather', 50);
    inventoryManager.addItem('bowstring', 10);

    // Start tutorial quest
    questManager.startQuest('tutorial');

    gameState.addChatMessage('System', 'Welcome! Click trees/rocks to gather, enemies to fight, or ground to move. F1-F7 for panels.');

    // Starter gold
    gameState.getState().player.gold = 500;

    // Show System messages as toasts even when chat panel is closed
    gameState.on('chat', (messages: unknown) => {
      const msgs = messages as { sender: string; text: string }[];
      const last = msgs[msgs.length - 1];
      if (last && last.sender === 'System') {
        gameNotifications.show(last.text);
      }
    });

    // Transient toasts — not persisted in chat
    gameState.on('systemToast', (message: unknown) => {
      gameNotifications.show(message as string, 2000);
    });

    // Combat: floating damage numbers
    gameState.on('combatHit', (data: unknown) => {
      const { target, damage, isPlayer } = data as { target: string; damage: number; isPlayer: boolean };
      if (target === 'player') {
        const iso = cartesianToIsometric(
          gameState.getState().player.position.x,
          gameState.getState().player.position.y
        );
        this.showDamageNumber(iso.x, iso.y - 40, damage, false);
      } else {
        const npc = this.combatNpcs.find((n) => n.combatId === target);
        if (npc) {
          const iso = cartesianToIsometric(npc.tileX, npc.tileY);
          this.showDamageNumber(iso.x, iso.y - 40, damage, true);
        }
      }
    });

    // Combat: NPC death — drops + cleanup
    gameState.on('npcDeath', (data: unknown) => {
      const { npcId, drops } = data as { npcId: string; drops: { itemId: string; quantity: number }[] };
      const npc = this.combatNpcs.find((n) => n.combatId === npcId);
      if (!npc) return;

      npc.die();

      // Spawn ground loot
      if (drops.length > 0) {
        this.spawnGroundLoot(npc.tileX, npc.tileY, drops);
      }

      // Remove after delay
      this.time.delayedCall(2000, () => {
        npc.destroy();
        this.combatNpcs = this.combatNpcs.filter((n) => n !== npc);
      });
    });

    // Combat: player respawn
    gameState.on('playerRespawn', (data: unknown) => {
      const { x, y } = data as { x: number; y: number };
      this.player.teleportToTile(x, y);
    });

    // Spawn fire visual when firemaking completes
    gameState.on('fireLit', (data: unknown) => {
      const { tileX, tileY } = data as { tileX: number; tileY: number };
      this.spawnFire(tileX, tileY);
    });
  }

  update(time: number, delta: number) {
    this.player.update(time, delta);

    // Update progress bar
    if (gatheringManager.isCurrentlyGathering()) {
      this.progressBar.setVisible(true);
      this.progressBar.setPosition(this.player.x, this.player.y - 50);
      const progress = gatheringManager.getProgress();
      this.progressFill.setScale(progress, 1);
    } else if (craftingManager.isCurrentlyCrafting()) {
      this.progressBar.setVisible(true);
      this.progressBar.setPosition(this.player.x, this.player.y - 50);
      const progress = craftingManager.getProgress();
      this.progressFill.setScale(progress, 1);
    } else if (firemakingManager.isCurrentlyFiremaking()) {
      this.progressBar.setVisible(true);
      this.progressBar.setPosition(this.player.x, this.player.y - 50);
      const progress = firemakingManager.getProgress();
      this.progressFill.setScale(progress, 1);
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
        sprite.setDepth(getDepth(obj.x, obj.y, 1000));
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
      } else if (obj.type === 'anvil' || obj.type === 'fletching_table') {
        // Crafting station
        const sprite = this.add.image(iso.x, iso.y - 16, obj.type);
        sprite.setDepth(getDepth(obj.x, obj.y, 1000));
        sprite.setOrigin(0.5, 1);

        sprite.setInteractive();

        sprite.on('pointerover', () => {
          this.input.setDefaultCursor('pointer');
          sprite.setTint(0xcccccc);
        });

        sprite.on('pointerout', () => {
          this.input.setDefaultCursor('default');
          sprite.clearTint();
        });

        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.button !== 0) return;

          this.player.moveToTile(obj.x, obj.y);
          gameState.setPlayerPosition(obj.x, obj.y);

          this.showTargetIndicator(obj.x, obj.y);

          this.time.delayedCall(600, () => {
            const skillType = obj.type === 'anvil' ? 'smithing' : 'fletching';
            craftingManager.openCrafting(skillType);
          });
        });
      } else if (obj.type === 'bank_chest') {
        const sprite = this.add.image(iso.x, iso.y - 16, 'bank_chest');
        sprite.setDepth(getDepth(obj.x, obj.y, 1000));
        sprite.setOrigin(0.5, 1);

        sprite.setInteractive();

        sprite.on('pointerover', () => {
          this.input.setDefaultCursor('pointer');
          sprite.setTint(0xcccccc);
        });

        sprite.on('pointerout', () => {
          this.input.setDefaultCursor('default');
          sprite.clearTint();
        });

        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.button !== 0) return;
          this.player.moveToTile(obj.x, obj.y);
          gameState.setPlayerPosition(obj.x, obj.y);
          this.showTargetIndicator(obj.x, obj.y);
          this.time.delayedCall(600, () => {
            uiManager.showPanel('bank');
          });
        });
      } else {
        // Non-gatherable (house)
        const sprite = this.add.image(iso.x, iso.y - 16, obj.type);
        sprite.setDepth(getDepth(obj.x, obj.y, 1000));
        sprite.setOrigin(0.5, 1);
      }
    }
  }

  private createProgressBar() {
    this.progressBar = this.add.container(0, 0);
    this.progressBar.setDepth(999999);
    this.progressBar.setVisible(false);

    this.progressBg = this.add.rectangle(0, 0, 50, 8, 0x000000, 0.8);
    this.progressBg.setStrokeStyle(1, 0xffffff, 0.5);
    this.progressBar.add(this.progressBg);

    this.progressFill = this.add.rectangle(-24, 0, 48, 6, 0x4ade80, 1);
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

  private showDialogue(npc: NPC) {
    this.dismissDialogue();

    const div = document.createElement('div');
    div.id = 'npc-dialogue';
    div.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 30, 40, 0.97);
      border: 2px solid #5a5a6a;
      border-radius: 6px;
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      font-size: 13px;
      padding: 12px 16px;
      z-index: 500;
      max-width: 400px;
      text-align: center;
    `;

    div.innerHTML = `
      <div style="margin-bottom:8px;color:#8af;">${npc.npcName} says:</div>
      <div style="margin-bottom:10px;">"Welcome! Click trees to chop wood, rocks to mine ore. Use F1-F6 for panels."</div>
      <button style="
        background:#3a3a4a;
        border:1px solid #5a5a6a;
        border-radius:3px;
        color:#fff;
        padding:4px 16px;
        cursor:pointer;
        font-size:12px;
      ">Continue</button>
    `;

    div.querySelector('button')!.onclick = () => this.dismissDialogue();
    document.body.appendChild(div);
    this.activeDialogue = div;
  }

  private dismissDialogue() {
    if (this.activeDialogue) {
      this.activeDialogue.remove();
      this.activeDialogue = null;
    }
  }

  spawnFire(tileX: number, tileY: number) {
    const iso = cartesianToIsometric(tileX, tileY);
    const sprite = this.add.image(iso.x, iso.y - 14, 'campfire');
    sprite.setDepth(getDepth(tileX, tileY, 1000));
    sprite.setOrigin(0.5, 1);
    sprite.setAlpha(0.9);

    // Flicker tween
    this.tweens.add({
      targets: sprite,
      alpha: 0.6,
      duration: 200 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: sprite,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Auto-extinguish after 30 seconds
    const timer = this.time.delayedCall(30000, () => {
      this.tweens.add({
        targets: sprite,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          sprite.destroy();
          this.activeFires = this.activeFires.filter((f) => f.sprite !== sprite);
        },
      });
    });

    this.activeFires.push({ tileX, tileY, sprite, timer });
  }

  private showDamageNumber(x: number, y: number, damage: number, isPlayerDealing: boolean) {
    const color = damage === 0 ? '#ffffff' : isPlayerDealing ? '#ef4444' : '#22c55e';
    const text = this.add.text(x + (Math.random() - 0.5) * 20, y - Math.random() * 10, damage === 0 ? '0' : String(damage), {
      fontSize: damage === 0 ? '14px' : '18px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    text.setDepth(99999);

    this.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  private spawnGroundLoot(tileX: number, tileY: number, drops: { itemId: string; quantity: number }[]) {
    const iso = cartesianToIsometric(tileX, tileY);

    // Show item names in chat
    const itemNames = drops.map((d) => {
      const template = getItem(d.itemId);
      return template ? `${d.quantity}x ${template.name}` : d.itemId;
    });
    gameState.addChatMessage('System', `Drops: ${itemNames.join(', ')}`);

    // Create ground loot sprite (gold pouch)
    const lootGraphics = this.make.graphics({ x: 0, y: 0 });
    lootGraphics.fillStyle(0xffcc00, 1);
    lootGraphics.fillCircle(12, 12, 10);
    lootGraphics.fillStyle(0xfbbf24, 1);
    lootGraphics.fillCircle(12, 10, 6);
    const lootKey = `loot_${tileX}_${tileY}_${Date.now()}`;
    lootGraphics.generateTexture(lootKey, 24, 24);
    lootGraphics.destroy();

    const sprite = this.add.image(iso.x, iso.y - 20, lootKey);
    sprite.setDepth(getDepth(tileX, tileY, 5000));
    sprite.setInteractive();

    sprite.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
      sprite.setTint(0xffcc00);
    });

    sprite.on('pointerout', () => {
      this.input.setDefaultCursor('default');
      sprite.clearTint();
    });

    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0) return;
      // Walk to loot
      this.player.moveToTile(tileX, tileY);
      gameState.setPlayerPosition(tileX, tileY);

      this.showTargetIndicator(tileX, tileY);

      this.time.delayedCall(600, () => {
        // Pick up all drops
        for (const drop of drops) {
          inventoryManager.addItem(drop.itemId, drop.quantity);
        }
        gameState.addChatMessage('System', `You pick up the loot.`);
        sprite.destroy();
        if (sprite.texture.key) {
          this.textures.remove(sprite.texture.key);
        }
        this.groundLoot = this.groundLoot.filter((l) => l.sprite !== sprite);
      });
    });

    // 2 minute despawn
    const timer = this.time.delayedCall(120000, () => {
      sprite.destroy();
      if (sprite.texture.key) {
        this.textures.remove(sprite.texture.key);
      }
      this.groundLoot = this.groundLoot.filter((l) => l.sprite !== sprite);
    });

    this.groundLoot.push({ sprite, drops, tileX, tileY, timer });
  }
}
