import Phaser from 'phaser';
import { IsoUtils } from '../utils/IsoUtils';
import { CellType } from './MonsterType';
import { GameState } from '../systems/GameState';

export class Monster {
  public tileX: number;
  public tileY: number;
  public resistanceType: number;
  public type: CellType;
  public sprite: Phaser.GameObjects.Graphics;
  public tooltipText: Phaser.GameObjects.Text | null = null;
  private scene: Phaser.Scene;
  private gameState: GameState;
  private idleOffset: number;
  private idleSpeed: number;

  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    type: CellType,
    gameState: GameState
  ) {
    this.scene = scene;
    this.gameState = gameState;
    this.tileX = tileX;
    this.tileY = tileY;
    this.type = type;
    this.resistanceType = type.resistanceType;
    this.idleOffset = Math.random() * Math.PI * 2;
    this.idleSpeed = 0.02 + Math.random() * 0.01;

    this.sprite = scene.add.graphics();
    this.updatePosition();
  }

  updatePosition(): void {
    const pos = IsoUtils.tileToScreen(this.tileX, this.tileY);
    const idleFloat = Math.sin(this.scene.time.now * this.idleSpeed + this.idleOffset) * 2;
    
    this.sprite.clear();

    const size = 12;

    this.sprite.fillStyle(this.type.color, 1);
    this.sprite.fillCircle(pos.x, pos.y - 10 + idleFloat, size);

    this.sprite.lineStyle(2, 0x000000, 0.5);
    this.sprite.strokeCircle(pos.x, pos.y - 10 + idleFloat, size);
  }

  getSensitivityText(): string {
    const therapy1 = this.gameState.sensitiveTherapy1;
    const therapy2 = this.gameState.sensitiveTherapy2;
    
    const sensitivities: string[] = [];
    
    if (this.resistanceType === 0) {
      sensitivities.push(therapy1, therapy2);
    } else if (this.resistanceType === 1) {
      sensitivities.push(therapy2);
    } else if (this.resistanceType === 2) {
      sensitivities.push(therapy1);
    }
    
    if (sensitivities.length === 0) {
      return 'Resistant to both therapies';
    }
    
    return `Sensitive to: ${sensitivities.join(', ')}`;
  }

  showTooltip(): void {
    this.hideTooltip();
    const pos = IsoUtils.tileToScreen(this.tileX, this.tileY);
    const tooltipContent = `${this.type.name}\n${this.getSensitivityText()}`;
    
    this.tooltipText = this.scene.add.text(pos.x, pos.y - 40, tooltipContent, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 6, y: 4 },
      align: 'center'
    });
    this.tooltipText.setOrigin(0.5, 1);
    this.tooltipText.setDepth(1000);
  }

  hideTooltip(): void {
    if (this.tooltipText) {
      this.tooltipText.destroy();
      this.tooltipText = null;
    }
  }

  destroy(): void {
    this.hideTooltip();
    this.sprite.clear();
    this.sprite.destroy();
  }
}
