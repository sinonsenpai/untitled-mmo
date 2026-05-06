import Phaser from 'phaser';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { EquipmentPanel } from '../ui/EquipmentPanel.js';
import { SkillPanel } from '../ui/SkillPanel.js';
import { QuestPanel } from '../ui/QuestPanel.js';
import { ChatPanel } from '../ui/ChatPanel.js';
import { CraftingPanel } from '../ui/CraftingPanel.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: true });
  }

  create() {
    new InventoryPanel();
    new EquipmentPanel();
    new SkillPanel();
    new QuestPanel();
    new ChatPanel();
    new CraftingPanel();
  }
}
