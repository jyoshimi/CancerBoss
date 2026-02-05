export interface Point2D {
  x: number;
  y: number;
}

export interface TileCoord {
  tileX: number;
  tileY: number;
}

export class IsoUtils {
  static readonly TILE_WIDTH = 64;
  static readonly TILE_HEIGHT = 32;

  static tileToScreen(tileX: number, tileY: number): Point2D {
    const x = (tileX - tileY) * (this.TILE_WIDTH / 2);
    const y = (tileX + tileY) * (this.TILE_HEIGHT / 2);
    return { x, y };
  }

  static screenToTile(screenX: number, screenY: number): TileCoord {
    const tileX = (screenX / (this.TILE_WIDTH / 2) + screenY / (this.TILE_HEIGHT / 2)) / 2;
    const tileY = (screenY / (this.TILE_HEIGHT / 2) - screenX / (this.TILE_WIDTH / 2)) / 2;
    return {
      tileX: Math.floor(tileX),
      tileY: Math.floor(tileY)
    };
  }
}
