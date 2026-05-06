export type PanelType = 'inventory' | 'equipment' | 'skills' | 'quests' | 'chat';

export class UIManager {
  private visiblePanels: Set<PanelType> = new Set();
  private listeners: Set<(panels: Set<PanelType>) => void> = new Set();

  togglePanel(panel: PanelType) {
    if (this.visiblePanels.has(panel)) {
      this.visiblePanels.delete(panel);
    } else {
      this.visiblePanels.add(panel);
    }
    this.emit();
  }

  showPanel(panel: PanelType) {
    this.visiblePanels.add(panel);
    this.emit();
  }

  hidePanel(panel: PanelType) {
    this.visiblePanels.delete(panel);
    this.emit();
  }

  isVisible(panel: PanelType): boolean {
    return this.visiblePanels.has(panel);
  }

  getVisiblePanels(): PanelType[] {
    return Array.from(this.visiblePanels);
  }

  onChange(callback: (panels: Set<PanelType>) => void) {
    this.listeners.add(callback);
  }

  offChange(callback: (panels: Set<PanelType>) => void) {
    this.listeners.delete(callback);
  }

  private emit() {
    this.listeners.forEach((cb) => cb(new Set(this.visiblePanels)));
  }
}

export const uiManager = new UIManager();
