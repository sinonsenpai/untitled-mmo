import { skillManager } from './SkillManager.js';
import { inventoryManager } from './InventoryManager.js';
import { questManager } from './QuestManager.js';
import { gameState } from './GameStateManager.js';

interface GatherableObject {
  type: 'tree' | 'rock';
  x: number;
  y: number;
  depleted: boolean;
  respawnTime: number;
}

export class GatheringManager {
  private objects: Map<string, GatherableObject> = new Map();
  private isGathering: boolean = false;
  private currentTarget: string | null = null;
  private gatherProgress: number = 0;
  private gatherSpeed: number = 0.02;

  registerObject(type: 'tree' | 'rock', x: number, y: number) {
    const id = `${type}_${x}_${y}`;
    this.objects.set(id, {
      type,
      x,
      y,
      depleted: false,
      respawnTime: 0,
    });
  }

  canGather(id: string): boolean {
    const obj = this.objects.get(id);
    if (!obj) return false;
    return !obj.depleted;
  }

  getGatherableAt(tileX: number, tileY: number): string | null {
    for (const [id, obj] of this.objects) {
      if (obj.x === tileX && obj.y === tileY && !obj.depleted) {
        return id;
      }
    }
    return null;
  }

  startGathering(id: string, onComplete?: () => void): boolean {
    if (this.isGathering) return false;
    const obj = this.objects.get(id);
    if (!obj || obj.depleted) return false;

    this.isGathering = true;
    this.currentTarget = id;
    this.gatherProgress = 0;

    // Start gathering loop
    const gatherLoop = setInterval(() => {
      this.gatherProgress += this.gatherSpeed;

      if (this.gatherProgress >= 1) {
        clearInterval(gatherLoop);
        this.completeGathering(id);
        if (onComplete) onComplete();
      }
    }, 50);

    return true;
  }

  completeGathering(id: string) {
    const obj = this.objects.get(id);
    if (!obj) return;

    const objType = obj.type;
    let success = false;
    let xpGained = 0;
    let itemGained: { id: string; name: string; quantity: number } | null = null;

    if (objType === 'tree') {
      // Woodcutting
      const wcLevel = skillManager.getSkill('woodcutting')?.level ?? 1;
      const successChance = 0.5 + (wcLevel * 0.005);

      if (Math.random() < successChance) {
        success = true;
        xpGained = 25;
        itemGained = { id: 'logs', name: 'Logs', quantity: 1 };
        inventoryManager.addItem('logs', 1);
        skillManager.addXp('woodcutting', xpGained);
      } else {
        xpGained = 0;
      }
    } else if (objType === 'rock') {
      // Mining
      const miningLevel = skillManager.getSkill('mining')?.level ?? 1;
      const successChance = 0.4 + (miningLevel * 0.006);

      if (Math.random() < successChance) {
        success = true;
        xpGained = 35;
        itemGained = { id: 'copper_ore', name: 'Copper ore', quantity: 1 };
        inventoryManager.addItem('copper_ore', 1);
        skillManager.addXp('mining', xpGained);
      } else {
        xpGained = 0;
      }
    }

    if (success && itemGained) {
      gameState.addChatMessage(
        'System',
        `You got some ${itemGained.name.toLowerCase()}. (+${xpGained} ${objType === 'tree' ? 'Woodcutting' : 'Mining'} XP)`
      );

      // Deplete the resource
      obj.depleted = true;
      obj.respawnTime = Date.now() + 15000; // 15 second respawn

      // Update quest objectives
      questManager.updateObjective('tutorial', objType === 'tree' ? 'woodcutting' : 'mining', 1);

      // Schedule respawn
      setTimeout(() => {
        obj.depleted = false;
        gameState['emit']('objects', Array.from(this.objects.values()));
      }, 15000);
    } else {
      gameState.addChatMessage(
        'System',
        `You swing your ${objType === 'tree' ? 'axe' : 'pickaxe'} at the ${objType}... but get nothing.`
      );
    }

    this.isGathering = false;
    this.currentTarget = null;
    this.gatherProgress = 0;
  }

  stopGathering() {
    if (this.isGathering) {
      this.isGathering = false;
      this.currentTarget = null;
      this.gatherProgress = 0;
    }
  }

  isCurrentlyGathering(): boolean {
    return this.isGathering;
  }

  getProgress(): number {
    return this.gatherProgress;
  }

  getCurrentTarget(): string | null {
    return this.currentTarget;
  }

  getObjects(): GatherableObject[] {
    return Array.from(this.objects.values());
  }
}

export const gatheringManager = new GatheringManager();
