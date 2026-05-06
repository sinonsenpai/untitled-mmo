# RuneScape-esk Game

A hobby project building a browser-based 2.5D isometric MMORPG inspired by RuneScape.

## Features

- **2.5D Isometric Engine:** Diamond tile projection with depth sorting
- **Click-to-Move:** Left-click to walk, right/middle-click to pan camera
- **Camera Controls:** Smooth follow, mouse drag pan, scroll wheel zoom
- **Core Systems:**
  - Inventory (28 slots, RuneScape-style)
  - Equipment (11 slots: head, cape, amulet, weapon, body, shield, legs, hands, feet, ring, ammo)
  - Skills (7 skills: Hitpoints, Attack, Strength, Defence, Woodcutting, Mining, Smithing)
  - Quests (objective tracking, states)
  - Chat (message history, input)
- **UI Panels:** Toggle with F1-F5
  - F1: Inventory
  - F2: Equipment
  - F3: Skills
  - F4: Quests
  - F5: Chat
  - Enter: Focus chat

## Tech Stack

| Layer | Technology |
|-------|------------|
| Engine | Phaser 4 |
| Language | TypeScript |
| Build Tool | Vite |
| Future Multiplayer | Colyseus (stubbed) |

## Project Structure

```
packages/
  shared/     # Game logic, types, constants (shared with future server)
  client/     # Phaser 4 browser game
  server/     # Colyseus multiplayer server (stubbed)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
```

## Roadmap

### Phase 1 (Complete)
- [x] Isometric tile rendering
- [x] Click-to-move player controller
- [x] Camera system
- [x] Inventory & Equipment managers
- [x] Skill system with XP/levels
- [x] Quest system
- [x] UI panels
- [x] Starter map

### Phase 2 (Planned)
- [ ] Combat system (melee, NPC aggression)
- [ ] Gathering skills (woodcutting, mining interactions)
- [ ] Crafting/smithing
- [ ] NPC dialogue system
- [ ] More quests
- [ ] First boss fight

### Phase 3 (Future)
- [ ] Colyseus multiplayer server
- [ ] Player persistence (database)
- [ ] World expansion
- [ ] Trading system

## Asset Credits

See [ATTRIBUTION.md](ATTRIBUTION.md) for full credits on placeholder art assets.
