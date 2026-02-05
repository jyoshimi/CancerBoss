import Phaser from 'phaser';
import { IsoUtils } from '../utils/IsoUtils';

export class IsometricMap {
  private graphics: Phaser.GameObjects.Graphics;
  private mapWidth: number;
  private mapHeight: number;
  private highlightGraphics: Phaser.GameObjects.Graphics;
  private highlightedTile: { x: number; y: number } | null = null;

  constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.graphics = scene.add.graphics();
    this.highlightGraphics = scene.add.graphics();
  }

  render(): void {
    this.graphics.clear();

    for (let tileY = 0; tileY < this.mapHeight; tileY++) {
      for (let tileX = 0; tileX < this.mapWidth; tileX++) {
        this.drawTile(tileX, tileY);
      }
    }
  }

  private drawTile(tileX: number, tileY: number): void {
    const pos = IsoUtils.tileToScreen(tileX, tileY);
    const halfWidth = IsoUtils.TILE_WIDTH / 2;
    const halfHeight = IsoUtils.TILE_HEIGHT / 2;

    const color = (tileX + tileY) % 2 === 0 ? 0x44aa44 : 0x338833;
    
    this.graphics.fillStyle(color, 1);
    this.graphics.lineStyle(1, 0x226622, 1);

    this.graphics.beginPath();
    this.graphics.moveTo(pos.x, pos.y);
    this.graphics.lineTo(pos.x + halfWidth, pos.y + halfHeight);
    this.graphics.lineTo(pos.x, pos.y + IsoUtils.TILE_HEIGHT);
    this.graphics.lineTo(pos.x - halfWidth, pos.y + halfHeight);
    this.graphics.closePath();
    this.graphics.fillPath();
    this.graphics.strokePath();
  }

  highlightTile(tileX: number, tileY: number): void {
    if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) {
      this.clearHighlight();
      return;
    }

    this.highlightedTile = { x: tileX, y: tileY };
    this.highlightGraphics.clear();

    const pos = IsoUtils.tileToScreen(tileX, tileY);
    const halfWidth = IsoUtils.TILE_WIDTH / 2;
    const halfHeight = IsoUtils.TILE_HEIGHT / 2;

    this.highlightGraphics.lineStyle(2, 0xffff00, 1);
    this.highlightGraphics.beginPath();
    this.highlightGraphics.moveTo(pos.x, pos.y);
    this.highlightGraphics.lineTo(pos.x + halfWidth, pos.y + halfHeight);
    this.highlightGraphics.lineTo(pos.x, pos.y + IsoUtils.TILE_HEIGHT);
    this.highlightGraphics.lineTo(pos.x - halfWidth, pos.y + halfHeight);
    this.highlightGraphics.closePath();
    this.highlightGraphics.strokePath();
  }

  clearHighlight(): void {
    this.highlightedTile = null;
    this.highlightGraphics.clear();
  }

  getHighlightedTile(): { x: number; y: number } | null {
    return this.highlightedTile;
  }

  isValidTile(tileX: number, tileY: number): boolean {
    return tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight;
  }
}
