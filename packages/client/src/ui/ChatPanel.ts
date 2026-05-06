import { UIPanel } from './UIPanel.js';
import { gameState } from '../managers/GameStateManager.js';

export class ChatPanel extends UIPanel {
  private messagesDiv: HTMLDivElement;
  private input: HTMLInputElement;

  constructor() {
    super('chat', 'Chat');
    this.container.style.width = '400px';
    this.container.style.height = '180px';
    this.container.style.bottom = '20px';
    this.container.style.left = '20px';
    this.container.style.top = 'auto';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';

    const content = this.getContentDiv();
    content.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      min-height: 0;
      overflow: hidden;
    `;

    this.messagesDiv = document.createElement('div');
    this.messagesDiv.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px;
      min-height: 0;
      word-break: break-word;
    `;
    content.appendChild(this.messagesDiv);

    const inputWrap = document.createElement('div');
    inputWrap.style.cssText = `
      padding: 6px 8px;
      border-top: 1px solid #4a4a5a;
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    `;
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Type a message...';
    this.input.style.cssText = `
      flex: 1;
      background: rgba(0,0,0,0.4);
      border: 1px solid #4a4a5a;
      border-radius: 3px;
      padding: 4px 8px;
      color: #fff;
      font-size: 12px;
      outline: none;
    `;
    inputWrap.appendChild(this.input);
    content.appendChild(inputWrap);

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        gameState.addChatMessage('Player', this.input.value.trim());
        this.input.value = '';
      }
    });

    gameState.on('chat', (messages: unknown) => {
      this.renderMessages(messages as { sender: string; text: string }[]);
    });

    this.renderMessages([]);
  }

  private renderMessages(messages: { sender: string; text: string }[]) {
    const grouped: { sender: string; text: string; count: number }[] = [];
    for (const msg of messages) {
      const last = grouped[grouped.length - 1];
      if (last && last.sender === msg.sender && last.text === msg.text) {
        last.count++;
      } else {
        grouped.push({ sender: msg.sender, text: msg.text, count: 1 });
      }
    }

    const recent = grouped.slice(-50);
    this.messagesDiv.innerHTML = recent
      .map(
        (m) =>
          `<div style="font-size:11px;line-height:1.4;margin-bottom:2px;word-break:break-word;">
                    <span style="color:#8af;font-weight:bold;">${m.sender}:</span>
                    <span style="color:#ddd;">${m.text}</span>
                    ${m.count > 1 ? `<span style="color:#888;font-size:10px;margin-left:4px;">(x${m.count})</span>` : ''}
                </div>`
      )
      .join('');
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }
}
