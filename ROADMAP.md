# RuneScape-esk Game — Development Roadmap

> Created: 2026-05-05
> Current Phase: Phase 4 — Quests & Content
> Status: Phases 1-3 Complete

---

## Project Architecture

```
packages/
├── shared/          # Game logic, types, constants (shared with future server)
│   ├── src/
│   │   ├── entities/     # Player, Item, NPC data structures
│   │   ├── systems/      # CombatSystem, SkillSystem, QuestSystem, CraftingSystem
│   │   ├── constants/    # GameConstants, SkillData
│   │   └── types/        # TypeScript interfaces
│   └── dist/             # Compiled output (imported by client)
│
├── client/          # Phaser 4 browser game
│   ├── src/
│   │   ├── scenes/       # BootScene, PreloadScene, GameScene, UIScene
│   │   ├── entities/     # Player, NPC sprites
│   │   ├── managers/     # GameState, Inventory, Skill, Quest, Crafting, Bank, Shop
│   │   ├── systems/      # Input, Camera, DepthSort
│   │   ├── ui/           # All UI panels
│   │   └── utils/        # Isometric math
│   └── assets/           # Tilesets, sprites, maps, audio
│
└── server/          # Colyseus multiplayer server (stubbed for now)
```

---

## Completed Features (Foundation)

### Engine
- [x] 2.5D isometric rendering (64x32 diamond tiles)
- [x] Depth sorting: ground (z=0) → objects (z=1000) → entities (z=2000)
- [x] Click-to-move with continuous depth interpolation
- [x] Camera: follow player, mouse drag pan, scroll zoom
- [x] 20x20 starter map with grass, dirt, water

### Gathering
- [x] Woodcutting — click trees, success chance scales with level
- [x] Mining — click rocks, success chance scales with level
- [x] Resource depletion and 15-second respawn
- [x] Skill XP gain and level-up messages
- [x] Inventory item addition

### Core Systems
- [x] Inventory — 28 slots, item stacking
- [x] Equipment — 11 slots (head, cape, amulet, weapon, body, shield, legs, hands, feet, ring, ammo)
- [x] Skills — 9 skills: HP, Attack, Strength, Defence, Woodcutting, Mining, Smithing, Fletching, Firemaking
- [x] Quests — objective tracking, states (not_started/in_progress/completed)
- [x] Chat — scrollable message history with input

### UI
- [x] F1 — Inventory panel (draggable, 4x7 grid)
- [x] F2 — Equipment panel (11 slots)
- [x] F3 — Skills panel (XP bars, level display)
- [x] F4 — Quests panel (objective tracking)
- [x] F5 — Chat panel
- [x] All panels draggable and toggleable

### Bonus (not in original roadmap)
- [x] Firemaking — light logs with tinderbox, campfire visuals with flicker/fade tweens, 30s auto-extinguish, Fletching skill

---

## Phase 1: Crafting System (COMPLETE)

### 1.1 Expand Item Database [x]
**File:** `packages/shared/src/entities/Item.ts`

Add new items:

**Materials:**
- `tin_ore` — mined from rocks
- `bronze_bar` — smelted from copper + tin
- `feather` — dropped by chickens (future) or bought
- `bowstring` — bought from shop or crafted
- `arrow_shaft` — fletched from logs
- `bronze_arrowhead` — smithed from bronze bars

**Smithing Products (Bronze Tier):**
- `bronze_sword` — weapon slot
- `bronze_axe` — weapon slot (future woodcutting tool)
- `bronze_pickaxe` — weapon slot (future mining tool)
- `bronze_body` — body slot
- `bronze_legs` — legs slot

**Fletching Products:**
- `shortbow` — weapon slot (ranged)
- `bronze_arrow` — ammo slot, stackable

**All items need:**
- `stats` property for combat bonuses (attackBonus, strengthBonus, defenceBonus)
- Proper equip slots

### 1.2 Recipe System [x]
**New file:** `packages/shared/src/systems/CraftingSystem.ts`

```typescript
interface Recipe {
  id: string;
  name: string;
  skill: 'smithing' | 'fletching';
  levelRequired: number;
  ingredients: { itemId: string; quantity: number }[];
  output: { itemId: string; quantity: number };
  xp: number;
}
```

**Smithing Recipes:**
| Recipe | Level | Ingredients | Output | XP |
|--------|-------|-------------|--------|-----|
| Bronze bar | 1 | 1 copper ore + 1 tin ore | 1 bar | 12 |
| Bronze dagger | 1 | 1 bronze bar | 1 dagger | 25 |
| Bronze sword | 1 | 1 bronze bar | 1 sword | 25 |
| Bronze helm | 1 | 1 bronze bar | 1 helm | 25 |
| Bronze body | 5 | 5 bronze bars | 1 body | 62 |
| Bronze legs | 3 | 3 bronze bars | 1 legs | 37 |
| Bronze arrowheads | 1 | 1 bronze bar | 15 arrowheads | 12 |

**Fletching Recipes:**
| Recipe | Level | Ingredients | Output | XP |
|--------|-------|-------------|--------|-----|
| Arrow shaft | 1 | 1 log | 15 shafts | 5 |
| Shortbow | 5 | 1 log + 1 bowstring | 1 shortbow | 10 |
| Bronze arrow | 1 | 1 shaft + 1 feather + 1 arrowhead | 10 arrows | 12 |

**Helper functions:**
- `canCraft(recipe, inventory, skills)` — checks level and materials
- `craft(recipe, inventory, skills)` — consumes mats, gives product, adds XP
- `getRecipesForSkill(skill)` — returns all recipes for a skill

### 1.3 Crafting Manager [x]
**New file:** `packages/client/src/managers/CraftingManager.ts`

```typescript
class CraftingManager {
  openCrafting(skillType: 'smithing' | 'fletching')
  craft(recipeId: string): boolean           // craft one
  craftAll(recipeId: string): number         // craft until out of mats, returns count
  getAvailableRecipes(skillType: string): Recipe[]
  canCraftRecipe(recipeId: string): boolean
}
```

### 1.4 Crafting UI Panel [x]
**New file:** `packages/client/src/ui/CraftingPanel.ts`

- **Toggle:** F6 key
- **Layout:**
  - Left sidebar: Category tabs (Smithing / Fletching)
  - Center: Recipe list
    - Green = can craft (level + mats OK)
    - Red = missing mats or level
    - Gray = locked (level too low)
  - Right: Selected recipe details
    - Name and level requirement
    - Ingredients list with current inventory count
    - XP reward
    - "Craft" button (makes 1)
    - "Craft All" button (makes until out of mats)
- **Progress bar:** 2-3 seconds per craft (like gathering)
- **Auto-scroll:** Chat message on success/failure

### 1.5 Crafting Stations on Map [x]
**File:** `packages/client/src/scenes/GameScene.ts`

- **Anvil** at position (8, 8)
  - Interactive sprite (like trees/rocks)
  - Click to open Smithing panel
  - Hover: cursor changes, sprite tints
- **Fletching table** at position (12, 8)
  - Same interaction pattern
  - Opens Fletching panel

**Generate textures in PreloadScene.ts:**
- Simple placeholder anvil (gray rectangle + stand)
- Simple fletching table (brown rectangle + tools)

### 1.6 Starter Materials [x]
**File:** `packages/client/src/scenes/GameScene.ts` (create method)

Give player starter materials for testing:
- 10 copper ore
- 10 tin ore
- 10 logs
- 50 feathers
- 10 bowstrings

---

## Phase 2: Bank & Shop System (COMPLETE)

### 2.1 Bank System [x]

**Expand PlayerData** (`packages/shared/src/types/index.ts`):
```typescript
interface PlayerData {
  // ... existing fields
  bank: Item[];           // Bank storage (400 slot limit)
  bankCapacity: number;   // 400
  gold: number;           // Currency
}
```

**New file:** `packages/client/src/managers/BankManager.ts`
```typescript
class BankManager {
  deposit(itemId: string, quantity: number): boolean
  withdraw(itemId: string, quantity: number): boolean
  depositAll(): void                    // deposit entire inventory
  getBankItems(): Item[]
  getBankUsedSlots(): number
  getBankFreeSlots(): number
}
```

**New file:** `packages/client/src/ui/BankPanel.ts`
- **Toggle:** B key
- **Layout:**
  - Grid: 8 columns × 50 rows = 400 slots
  - Top bar: "Bank of Gielinor", slot counter (used/total)
  - Search box: filter by item name
  - Buttons: "Deposit All", "Deposit Inventory", "Withdraw X"
  - Click item to withdraw 1, shift-click for custom amount
- **Visual:** Items show quantity, grayed out empty slots

**Add Bank Chest to Map** (`GameScene.ts`):
- Position: (10, 6) — near the house
- Interactive sprite
- Click to open bank panel

### 2.2 Shop System [x]

**Expand NPCData** (`packages/shared/src/types/index.ts`):
```typescript
interface NPCData {
  // ... existing
  shopInventory?: ShopItem[];
  isShopkeeper?: boolean;
}

interface ShopItem {
  itemId: string;
  buyPrice: number;
  sellPrice: number;    // typically 50% of buyPrice
  stock: number;        // -1 = unlimited
}
```

**New file:** `packages/client/src/managers/ShopManager.ts`
```typescript
class ShopManager {
  openShop(npcId: string)
  buyItem(itemId: string, quantity: number): boolean
  sellItem(itemId: string, quantity: number): boolean
  getShopStock(npcId: string): ShopItem[]
}
```

**New file:** `packages/client/src/ui/ShopPanel.ts`
- **Opens:** When talking to shop NPC (click NPC → dialogue → "Trade")
- **Layout:**
  - Left: Shop stock with buy prices
  - Right: Player inventory with sell prices
  - Center: Transaction log
  - Click item to buy/sell 1, shift-click for quantity
  - Shows current gold at bottom

**Add Shop NPC** (`GameScene.ts`):
- Name: "Shopkeeper"
- Position: (14, 10)
- Sells: tools, food, crafting supplies, basic armor
- Buys: anything (general store)

**Shop Stock (General Store):**
| Item | Buy Price | Sell Price | Stock |
|------|-----------|------------|-------|
| Bronze dagger | 100 | 50 | 10 |
| Wooden shield | 50 | 25 | 10 |
| Bread | 15 | 8 | 100 |
| Feather | 5 | 2 | -1 |
| Bowstring | 20 | 10 | -1 |
| Tin ore | 50 | 25 | -1 |

### 2.3 Starter Gold [x]
Give player 500 gold to start.

---

## Phase 3: Combat System (Click-and-Wait) — COMPLETE

### 3.1 Combat Stats on Items [x]

**Expand Item type** (`packages/shared/src/types/index.ts`):
```typescript
interface Item {
  // ... existing
  stats?: {
    attackBonus?: number;      // Increases accuracy
    strengthBonus?: number;    // Increases max hit
    defenceBonus?: number;     // Reduces enemy accuracy
    rangedBonus?: number;
    magicBonus?: number;
    attackSpeed?: number;      // Ticks per attack (default: 4 = 2.4s)
  };
}
```

Update ITEM_DATABASE with stats for all weapons and armor.

### 3.2 Combat Manager [x]
**New file:** `packages/client/src/managers/CombatManager.ts`

**Combat mechanics (Old School RuneScape style):**
```
maxHit = 0.5 + (strengthLevel * (strengthBonus + 64)) / 640
accuracyRoll = attackLevel * (attackBonus + 64)
defenceRoll = enemyDefence * (enemyDefenceBonus + 64)
hitChance = accuracyRoll / (accuracyRoll + defenceRoll)

damage = random(0, maxHit) if hitChance > random(0,1) else 0
```

**Attack styles** (toggle in Combat panel):
- Accurate: +3 attack level bonus
- Aggressive: +3 strength level bonus
- Defensive: +3 defence level bonus

**Combat flow:**
1. Click enemy → walk to them (if not adjacent)
2. Start auto-attacking every 2.4 seconds (4 game ticks)
3. Roll hit/damage each attack
4. Show floating damage numbers
5. Enemy dies at 0 HP → drops loot → gives combat XP

### 3.3 NPC Combat Data [x]

**New type:** `CombatNPCData` extends `NPCData`:
```typescript
interface CombatNPCData extends NPCData {
  hp: number;
  maxHp: number;
  attack: number;
  strength: number;
  defence: number;
  aggression: 'passive' | 'aggressive';
  attackRange: number;      // Tiles (default: 1 for melee)
  dropTable: DropTable;
}

interface DropTable {
  always?: Drop[];          // 100% drop
  common?: Drop[];          // ~50% chance
  uncommon?: Drop[];        // ~10% chance
  rare?: Drop[];            // ~1% chance
}

interface Drop {
  itemId: string;
  quantity: number;
  chance?: number;          // Override default rarity chance
}
```

**NPC Types:**

| NPC | Level | HP | Attack | Strength | Defence | Aggression | Drops |
|-----|-------|----|--------|----------|---------|------------|-------|
| Cow | 2 | 8 | 1 | 1 | 1 | Passive | Bones, raw beef, cowhide |
| Giant rat | 3 | 5 | 2 | 2 | 1 | Aggressive (3 tiles) | Bones, raw rat meat |
| Goblin | 5 | 12 | 3 | 3 | 2 | Aggressive (3 tiles) | Bones, coins (5-15), bronze helm |

### 3.4 Combat UI [x]

**Floating damage numbers** (`GameScene.ts`):
- Red numbers: damage dealt TO enemy
- Green numbers: damage received FROM enemy
- White numbers: 0 (miss)
- Float up and fade out over 1 second

**Health bars** (above NPCs during combat):
- Green bar: current HP
- Red background: missing HP
- Show only when in combat or recently damaged

**Combat panel** (F7):
- Shows current attack style (accurate/aggressive/defensive)
- Shows current weapon stats
- Toggle attack style buttons

### 3.5 Death System [x]
- **Keep all items** (safe death for now)
- Respawn at starting position (10, 10)
- Lose 10% of each skill's current XP (not levels)
- Chat message: "Oh dear, you are dead!"

### 3.6 Loot System [x]

**Drop tables:**
```typescript
const COW_DROPS: DropTable = {
  always: [{ itemId: 'bones', quantity: 1 }],
  common: [
    { itemId: 'raw_beef', quantity: 1 },
    { itemId: 'cowhide', quantity: 1 }
  ],
};

const GOBLIN_DROPS: DropTable = {
  always: [{ itemId: 'bones', quantity: 1 }],
  common: [{ itemId: 'coins', quantity: 5 }],
  uncommon: [{ itemId: 'bronze_helm', quantity: 1 }],
};
```

**Loot appears on ground:**
- Items spawn at NPC death location
- Click to pick up (walk there, add to inventory)
- Despawn after 2 minutes
- Red text: "You can't carry any more items" if inventory full

---

## Phase 4: Quests & Content Expansion

### 4.1 Quest Journal Expansion
**File:** `packages/shared/src/systems/QuestSystem.ts` enhancements

- Multiple active quests (not just tutorial)
- Quest rewards: items, XP, unlock areas
- Quest prerequisites (complete X before starting Y)

**New quests:**
- "The Bronze Age" — smith 5 bronze bars, make 1 bronze sword (rewards: 500 Smithing XP, bronze body)
- "A Fletching We Will Go" — make 50 arrows, make 1 shortbow (rewards: 500 Fletching XP, 100 feathers)
- "Pest Control" — kill 10 giant rats (rewards: 500 combat XP, 100 gold)

### 4.2 New Areas

**Wilderness** (north of current area):
- Higher-level monsters
- PvP zone (future)
- Better resource nodes

**Dungeon** (entrance near house):
- Multi-level combat area
- Stronger monsters
- Rare drops

### 4.3 Random Events
Like Old School RuneScape:
- **Genie** — appears randomly, grants XP lamp
- **Strange rock** — appears while skilling, can be exchanged
- **Random NPC** — asks for help, gives reward

---

## Phase 5: Multiplayer (Colyseus)

### 5.1 Server Setup
**File:** `packages/server/src/index.ts`

- Colyseus server with rooms
- Room type: `GameRoom` (one per world)
- State sync: player positions, inventory, skills

### 5.2 Authentication
- Simple username/password
- JWT tokens
- Guest mode (temporary character, not saved)

### 5.3 Player Sync
- Position updates (every 50ms)
- Inventory/skills sync (on change)
- Chat messages (broadcast to room)

### 5.4 Trading
- Right-click player → "Trade"
- Trade window: both players add items
- Both click "Accept" to confirm

### 5.5 PvP
- Wilderness area only
- Attack other players
- Drop items on death (risky)

---

## Technical Notes

### File Naming Conventions
- PascalCase for classes: `InventoryManager.ts`
- camelCase for functions: `addItemToInventory()`
- kebab-case for assets: `bronze-sword.png`

### State Management Pattern
All managers use the observer pattern via `GameStateManager`:
```typescript
// Manager changes state
gameState['emit']('inventory', player.inventory);

// UI listens and updates
gameState.on('inventory', (items) => panel.render());
```

### Depth Sorting Rules
```typescript
// Ground tiles: z = 0
tile.setDepth(getDepth(x, y, 0));

// Objects (trees, rocks, house): z = 1000
object.setDepth(getDepth(x, y, 1000));

// Entities (player, NPCs): z = 2000
entity.setDepth(getDepth(x, y, 2000));

// Progress bars/indicators: z = 3000
progressBar.setDepth(3000);
```

### UI Panel Keybinds
| Key | Panel |
|-----|-------|
| F1 | Inventory |
| F2 | Equipment |
| F3 | Skills |
| F4 | Quests |
| F5 | Chat |
| F6 | Crafting |
| F7 | Combat |
| B | Bank |
| Enter | Focus chat input |

---

## Asset Attribution

See `ATTRIBUTION.md` for full credits on placeholder art assets.

---

## Next Steps

1. Move to **Phase 4: Quests & Content Expansion**
   - Create 3 new quests (The Bronze Age, A Fletching We Will Go, Pest Control)
   - Implement quest rewards and prerequisites
   - Add wilderness and dungeon areas
   - Add random events

2. Move to **Phase 5: Multiplayer (Colyseus)**

3. **Minor bug:** `SKILL_NAMES` in `GameConstants.ts` is missing `fletching` and `firemaking`

---

*Last updated: 2026-05-07*
