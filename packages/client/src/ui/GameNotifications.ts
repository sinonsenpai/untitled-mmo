export class GameNotifications {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'game-notifications';
    this.container.style.cssText = `
      position: fixed;
      bottom: 210px;
      left: 20px;
      width: 380px;
      z-index: 300;
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(message: string, duration = 4000) {
    const el = document.createElement('div');
    el.style.cssText = `
      background: rgba(0,0,0,0.8);
      border: 1px solid #5a5a6a;
      border-radius: 4px;
      padding: 6px 10px;
      color: #ddd;
      font-size: 12px;
      font-family: 'Segoe UI', sans-serif;
      animation: fadeInUp 0.2s ease-out;
    `;
    el.textContent = message;
    this.container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
}

export const gameNotifications = new GameNotifications();
