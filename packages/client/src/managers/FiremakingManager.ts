import { skillManager } from './SkillManager.js';
import { inventoryManager } from './InventoryManager.js';
import { gameState } from './GameStateManager.js';

export interface FireData {
  tileX: number;
  tileY: number;
}

export class FiremakingManager {
  private isFiremaking: boolean = false;
  private firemakingProgress: number = 0;
  private firemakingSpeed: number = 0.025;

  lightLog(tileX: number, tileY: number, onComplete?: (fire: FireData) => void): boolean {
    if (this.isFiremaking) return false;

    const player = gameState.getState().player;
    const logs = player.inventory.find((i) => i.id === 'logs');
    if (!logs || logs.quantity < 1) return false;

    this.isFiremaking = true;
    this.firemakingProgress = 0;

    const loop = setInterval(() => {
      this.firemakingProgress += this.firemakingSpeed;

      if (this.firemakingProgress >= 1) {
        clearInterval(loop);
        this.completeFiremaking(tileX, tileY, onComplete);
      }
    }, 50);

    return true;
  }

  private completeFiremaking(tileX: number, tileY: number, onComplete?: (fire: FireData) => void) {
    const player = gameState.getState().player;
    const logs = player.inventory.find((i) => i.id === 'logs');
    if (!logs || logs.quantity < 1) {
      this.isFiremaking = false;
      this.firemakingProgress = 0;
      return;
    }

    inventoryManager.removeItem('logs', 1);
    skillManager.addXp('firemaking', 15);
    gameState.addChatMessage('System', 'You light the logs. (+15 Firemaking XP)');

    this.isFiremaking = false;
    this.firemakingProgress = 0;

    if (onComplete) {
      onComplete({ tileX, tileY });
    }

    gameState['emit']('fireLit', { tileX, tileY });
  }

  stopFiremaking() {
    if (this.isFiremaking) {
      this.isFiremaking = false;
      this.firemakingProgress = 0;
    }
  }

  isCurrentlyFiremaking(): boolean {
    return this.isFiremaking;
  }

  getProgress(): number {
    return this.firemakingProgress;
  }
}

export const firemakingManager = new FiremakingManager();
