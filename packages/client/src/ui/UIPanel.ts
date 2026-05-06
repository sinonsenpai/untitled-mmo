import { uiManager, type PanelType } from '../managers/UIManager.js';

export abstract class UIPanel {
  protected container: HTMLDivElement;
  protected panelType: PanelType;

  constructor(panelType: PanelType, title: string) {
    this.panelType = panelType;
    this.container = document.createElement('div');
    this.container.className = 'ui-panel';
    this.container.style.cssText = `
      position: absolute;
      background: rgba(30, 30, 40, 0.95);
      border: 2px solid #5a5a6a;
      border-radius: 4px;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
      pointer-events: auto;
      display: none;
      z-index: 200;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #3a3a4a;
      padding: 6px 10px;
      border-bottom: 1px solid #5a5a6a;
      font-weight: bold;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `<span>${title}</span><button style="background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;line-height:1;">&times;</button>`;
    header.querySelector('button')!.onclick = () => uiManager.hidePanel(this.panelType);
    this.container.appendChild(header);

    document.getElementById('ui-layer')!.appendChild(this.container);
    this.makeDraggable(header);

    uiManager.onChange((panels) => {
      this.container.style.display = panels.has(this.panelType) ? 'block' : 'none';
    });
  }

  protected getContentDiv(): HTMLDivElement {
    let content = this.container.querySelector('.panel-content') as HTMLDivElement;
    if (!content) {
      content = document.createElement('div');
      content.className = 'panel-content';
      content.style.padding = '10px';
      this.container.appendChild(content);
    }
    return content;
  }

  private makeDraggable(handle: HTMLDivElement) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      this.container.style.margin = '0';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      this.container.style.left = `${initialLeft + dx}px`;
      this.container.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
}
