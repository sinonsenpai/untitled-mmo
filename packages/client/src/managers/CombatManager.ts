import { skillManager } from './SkillManager.js';
import { inventoryManager } from './InventoryManager.js';
import { gameState } from './GameStateManager.js';
import {
  calculateMaxHit,
  calculateAccuracyRoll,
  calculateDefenceRoll,
  rollHit,
  rollDamage,
  rollDrop,
  getEquipmentBonus,
  type AttackStyle,
  type CombatStats,
  type DropTable,
} from '@rpg/shared';

const ATTACK_INTERVAL = 2400;

export interface CombatNPCRef {
  id: string;
  stats: CombatStats;
}

export class CombatManager {
  private combatProfiles: Map<string, CombatStats> = new Map();
  private currentTarget: CombatNPCRef | null = null;
  private attackTimer: ReturnType<typeof setInterval> | null = null;
  private attackStyle: AttackStyle = 'accurate';
  private isDead: boolean = false;

  registerProfile(id: string, stats: CombatStats): void {
    this.combatProfiles.set(id, stats);
  }

  getProfile(id: string): CombatStats | undefined {
    return this.combatProfiles.get(id);
  }

  startCombat(npcId: string, npcName: string): boolean {
    if (this.currentTarget || this.isDead) return false;
    const profile = this.combatProfiles.get(npcId);
    if (!profile) return false;

    const stats: CombatStats = {
      hp: profile.hp,
      maxHp: profile.maxHp,
      attack: profile.attack,
      strength: profile.strength,
      defence: profile.defence,
      aggression: profile.aggression,
      attackRange: profile.attackRange,
      dropTable: profile.dropTable,
    };

    this.currentTarget = { id: npcId, stats };

    this.performAttack();
    this.attackTimer = setInterval(() => {
      this.performAttack();
    }, ATTACK_INTERVAL);

    gameState.addChatMessage('System', `You start fighting the ${npcName}.`);
    return true;
  }

  private performAttack() {
    if (!this.currentTarget || this.isDead) return;
    const target = this.currentTarget;
    const player = gameState.getState().player;

    const attackLevel = (player.skills.attack?.level ?? 1) + (this.attackStyle === 'accurate' ? 3 : 0);
    const strengthLevel = (player.skills.strength?.level ?? 1) + (this.attackStyle === 'aggressive' ? 3 : 0);
    const defenceLevel = (player.skills.defence?.level ?? 1) + (this.attackStyle === 'defensive' ? 3 : 0);

    const equipment = player.equipment;
    const strengthBonus = getEquipmentBonus(equipment, 'aggressive');
    const attackBonus = getEquipmentBonus(equipment, 'accurate');
    const defenceBonus = getEquipmentBonus(equipment, 'defensive');

    // Player attacks NPC
    const maxHit = calculateMaxHit(strengthLevel, strengthBonus);
    const accRoll = calculateAccuracyRoll(attackLevel, attackBonus);
    const defRoll = calculateDefenceRoll(target.stats.defence, 0);

    if (rollHit(accRoll, defRoll)) {
      const damage = Math.max(1, rollDamage(maxHit));
      target.stats.hp -= damage;
      gameState['emit']('combatHit', { target: target.id, damage, isPlayer: true });
      gameState.addChatMessage('System', `You hit the enemy for ${damage} damage.`);
    } else {
      gameState['emit']('combatHit', { target: target.id, damage: 0, isPlayer: true });
      gameState['emit']('systemToast', 'You miss.');
    }

    // Check NPC death
    if (target.stats.hp <= 0) {
      this.onNpcDeath(target.id, target.stats);
      return;
    }

    // NPC attacks player
    const npcMaxHit = calculateMaxHit(target.stats.strength, 0);
    const npcAccRoll = calculateAccuracyRoll(target.stats.attack, 0);
    const playerDefRoll = calculateDefenceRoll(defenceLevel, defenceBonus);

    if (rollHit(npcAccRoll, playerDefRoll)) {
      const damage = Math.max(1, rollDamage(npcMaxHit));
      player.hp -= damage;
      gameState['emit']('combatHit', { target: 'player', damage, isPlayer: false });
      gameState['emit']('playerHp', player.hp);

      if (player.hp <= 0) {
        this.onPlayerDeath();
      }
    } else {
      gameState['emit']('combatHit', { target: 'player', damage: 0, isPlayer: false });
    }
  }

  private onNpcDeath(npcId: string, stats: CombatStats) {
    this.stopCombat();

    const profile = this.combatProfiles.get(npcId);
    const xpShare = profile ? Math.ceil((profile.maxHp * 5) / 3) : 10;

    skillManager.addXp('attack', xpShare);
    skillManager.addXp('strength', xpShare);
    skillManager.addXp('defence', xpShare);
    skillManager.addXp('hp', Math.ceil(xpShare / 3));

    gameState.addChatMessage('System', `The enemy is defeated! (+${xpShare} combat XP)`);

    // Roll drops
    const drops = rollDrop(stats.dropTable);
    gameState['emit']('npcDeath', { npcId, drops });
  }

  private onPlayerDeath() {
    this.stopCombat();
    this.isDead = true;

    gameState.addChatMessage('System', 'Oh dear, you are dead!');

    const player = gameState.getState().player;

    // Lose 10% of current XP in each skill
    for (const [skillId, skill] of Object.entries(player.skills)) {
      const xpLoss = Math.floor(skill.xp * 0.1);
      if (xpLoss > 0) {
        skillManager.addXp(skillId, -xpLoss);
      }
    }

    player.hp = player.maxHp;
    player.position.x = 10;
    player.position.y = 10;

    gameState['emit']('playerRespawn', { x: 10, y: 10 });
    gameState['emit']('playerHp', player.hp);

    setTimeout(() => {
      this.isDead = false;
    }, 2000);
  }

  stopCombat() {
    if (this.attackTimer) {
      clearInterval(this.attackTimer);
      this.attackTimer = null;
    }
    this.currentTarget = null;
  }

  isInCombat(): boolean {
    return this.currentTarget !== null;
  }

  getCurrentTarget(): CombatNPCRef | null {
    return this.currentTarget;
  }

  setAttackStyle(style: AttackStyle) {
    this.attackStyle = style;
    gameState['emit']('attackStyle', style);
  }

  getAttackStyle(): AttackStyle {
    return this.attackStyle;
  }

  playerIsDead(): boolean {
    return this.isDead;
  }
}

export const combatManager = new CombatManager();
