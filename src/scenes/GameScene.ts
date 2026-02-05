import Phaser from 'phaser';
import { IsometricMap } from '../systems/IsometricMap';
import { IsoUtils } from '../utils/IsoUtils';
import { EntityManager } from '../systems/EntityManager';
import { GameState } from '../systems/GameState';
import { UIManager } from '../systems/UIManager';

export class GameScene extends Phaser.Scene {
  private isoMap!: IsometricMap;
  private entityManager!: EntityManager;
  private gameState!: GameState;
  private uiManager!: UIManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly MAP_WIDTH = 20;
  private readonly MAP_HEIGHT = 20;
  private readonly CAMERA_SPEED = 5;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.isoMap = new IsometricMap(this, this.MAP_WIDTH, this.MAP_HEIGHT);
    this.isoMap.render();

    this.gameState = new GameState();
    this.entityManager = new EntityManager(this, this.gameState);
    this.uiManager = new UIManager(this.gameState);

    const centerX = Math.floor(this.MAP_WIDTH / 2);
    const centerY = Math.floor(this.MAP_HEIGHT / 2);
    
    this.entityManager.spawnTumorCluster(
      centerX, 
      centerY, 
      3, 
      this.gameState.config.numStartingCells
    );

    this.gameState.performCTScan(this.entityManager.getMonsters().length);

    const centerTile = IsoUtils.tileToScreen(this.MAP_WIDTH / 2, this.MAP_HEIGHT / 2);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(centerTile.x, centerTile.y);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      
      this.entityManager.hideAllTooltips();
      
      const cell = this.entityManager.getMonsterNearScreenPos(worldPoint.x, worldPoint.y);
      if (cell) {
        if (this.gameState.config.showTooltips) {
          cell.showTooltip();
        }
        console.log(`Clicked ${cell.type.name} at (${cell.tileX}, ${cell.tileY}) - ${cell.getSensitivityText()}`);
      }
    });

    const zoomInKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
    const zoomOutKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);

    zoomInKey.on('down', () => {
      const newZoom = Math.min(this.cameras.main.zoom + 0.1, 3);
      this.cameras.main.setZoom(newZoom);
    });

    zoomOutKey.on('down', () => {
      const newZoom = Math.max(this.cameras.main.zoom - 0.1, 0.3);
      this.cameras.main.setZoom(newZoom);
    });

    this.uiManager.onApplyTreatment = () => {
      const treatment1 = this.uiManager.getSelectedTreatment1();
      const dose1 = this.uiManager.getSelectedDose1();
      const treatment2 = this.uiManager.getSelectedTreatment2();
      const dose2 = this.uiManager.getSelectedDose2();
      
      this.entityManager.applyTreatment(treatment1, dose1, treatment2, dose2);
    };

    this.uiManager.onCTScan = () => {
      this.gameState.performCTScan(this.entityManager.getMonsters().length);
      if (this.gameState.lastDiagnosticResult) {
        const result = this.gameState.lastDiagnosticResult;
        this.uiManager.showDiagnosticBanner(result.type, result.title, result.content);
        this.gameState.lastDiagnosticResult = null;
      }
    };

    this.uiManager.onBiomarkerTest = () => {
      const testName = this.uiManager.getSelectedDiagnosticTest();
      const cellCounts = this.entityManager.getCellCounts();
      this.gameState.getBiomarkerResult(testName, cellCounts);
      if (this.gameState.lastDiagnosticResult) {
        const result = this.gameState.lastDiagnosticResult;
        this.uiManager.showDiagnosticBanner(result.type, result.title, result.content);
        this.gameState.lastDiagnosticResult = null;
      }
    };

    this.uiManager.onRestartGame = () => {
      this.scene.restart();
    };
  }

  update(): void {
    this.entityManager.update();
    this.uiManager.update(this.entityManager.getMonsters().length);

    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= this.CAMERA_SPEED;
    } else if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += this.CAMERA_SPEED;
    }

    if (this.cursors.up.isDown) {
      this.cameras.main.scrollY -= this.CAMERA_SPEED;
    } else if (this.cursors.down.isDown) {
      this.cameras.main.scrollY += this.CAMERA_SPEED;
    }
  }
}
