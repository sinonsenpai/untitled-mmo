import { createDefaultPlayer, type GameState, type ChatMessage } from '@rpg/shared';

export class GameStateManager {
  private state: GameState;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor() {
    this.state = {
      player: createDefaultPlayer('Player'),
      npcs: [],
      quests: [],
      chatMessages: [],
    };
  }

  getState(): GameState {
    return this.state;
  }

  setPlayerName(name: string) {
    this.state.player.name = name;
    this.emit('player', this.state.player);
  }

  setPlayerPosition(x: number, y: number) {
    this.state.player.position.x = x;
    this.state.player.position.y = y;
    this.emit('player', this.state.player);
  }

  addChatMessage(sender: string, text: string) {
    const msg: ChatMessage = {
      sender,
      text,
      timestamp: Date.now(),
    };
    this.state.chatMessages.push(msg);
    if (this.state.chatMessages.length > 100) {
      this.state.chatMessages.shift();
    }
    this.emit('chat', this.state.chatMessages);
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: unknown) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }
}

export const gameState = new GameStateManager();
