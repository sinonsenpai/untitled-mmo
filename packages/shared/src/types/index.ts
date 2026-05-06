export interface Position {
  x: number;
  y: number;
}

export interface IsometricPosition {
  isoX: number;
  isoY: number;
}

export interface Skill {
  name: string;
  level: number;
  xp: number;
  maxLevel: number;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  maxStack: number;
  slot?: EquipSlot;
  icon?: string;
  stats?: {
    attackBonus?: number;
    strengthBonus?: number;
    defenceBonus?: number;
    rangedBonus?: number;
    magicBonus?: number;
    attackSpeed?: number;
  };
}

export type EquipSlot =
  | 'head'
  | 'cape'
  | 'amulet'
  | 'weapon'
  | 'body'
  | 'shield'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'ring'
  | 'ammo';

export interface PlayerData {
  name: string;
  position: Position;
  hp: number;
  maxHp: number;
  skills: Record<string, Skill>;
  inventory: Item[];
  equipment: Partial<Record<EquipSlot, Item>>;
}

export interface NPCData {
  id: string;
  name: string;
  position: Position;
  dialogue: string[];
}

export interface QuestObjective {
  type: 'kill' | 'gather' | 'talk' | 'skill';
  target: string;
  amount: number;
  current: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  state: 'not_started' | 'in_progress' | 'completed';
  objectives: QuestObjective[];
  rewards: {
    xp?: Record<string, number>;
    items?: Item[];
  };
}

export interface GameState {
  player: PlayerData;
  npcs: NPCData[];
  quests: Quest[];
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}
