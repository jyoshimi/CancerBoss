import Phaser from 'phaser';
import { Monster } from '../entities/Monster';
import { getRandomCellType, getCellTypeByResistance } from '../entities/MonsterType';
import { GameState } from './GameState';
import { IsoUtils } from '../utils/IsoUtils';

export class EntityManager {
  private scene: Phaser.Scene;
  private monsters: Monster[] = [];
  private gameState: GameState;

  constructor(scene: Phaser.Scene, gameState: GameState) {
    this.scene = scene;
    this.gameState = gameState;
  }

  addMonster(monster: Monster): void {
    this.monsters.push(monster);
  }

  spawnTumorCluster(centerX: number, centerY: number, radius: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = Math.random() * radius;
      const tileX = Math.round(centerX + Math.cos(angle) * distance);
      const tileY = Math.round(centerY + Math.sin(angle) * distance);
      
      const cellType = getRandomCellType(this.gameState.config.proportionResistant);
      const monster = new Monster(this.scene, tileX, tileY, cellType, this.gameState);
      this.addMonster(monster);
    }
  }

  applyTreatment(treatment1: string, dose1: string, treatment2: string, dose2: string): void {
    if (this.gameState.gameOver) return;
    
    if (treatment1 !== 'None') {
      this.gameState.addMessage(`Month ${this.gameState.month}: Treating with ${treatment1} at ${dose1} dose`);
    }
    if (treatment2 !== 'None') {
      this.gameState.addMessage(`Month ${this.gameState.month}: Treating with ${treatment2} at ${dose2} dose`);
    }
    
    this.gameState.month++;
    
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const cell = this.monsters[i];
      let shouldDie = false;
      
      if (this.isSensitiveToTreatment(cell.resistanceType, treatment1)) {
        if (dose1 === 'High' || (dose1 === 'Low' && Math.random() < 0.5)) {
          shouldDie = true;
        }
      }
      
      if (!shouldDie && this.isSensitiveToTreatment(cell.resistanceType, treatment2)) {
        if (dose2 === 'High' || (dose2 === 'Low' && Math.random() < 0.5)) {
          shouldDie = true;
        }
      }
      
      if (shouldDie) {
        cell.destroy();
        this.monsters.splice(i, 1);
      }
    }
    
    this.proliferate();
    this.compete();
    
    this.gameState.checkWinCondition(this.monsters.length);
  }

  private isSensitiveToTreatment(resistanceType: number, treatment: string): boolean {
    if (treatment === 'None') return false;
    
    if (treatment === this.gameState.sensitiveTherapy1) {
      return resistanceType === 0 || resistanceType === 2;
    }
    
    if (treatment === this.gameState.sensitiveTherapy2) {
      return resistanceType === 0 || resistanceType === 1;
    }
    
    return false;
  }

  private proliferate(): void {
    const newCells: Monster[] = [];
    
    for (const cell of this.monsters) {
      let newResistanceType = cell.resistanceType;
      
      if (Math.random() < this.gameState.config.mutationRate) {
        newResistanceType = this.mutate(cell.resistanceType);
      }
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 3;
      const tileX = Math.round(cell.tileX + Math.cos(angle) * distance);
      const tileY = Math.round(cell.tileY + Math.sin(angle) * distance);
      
      const cellType = getCellTypeByResistance(newResistanceType);
      const newCell = new Monster(this.scene, tileX, tileY, cellType, this.gameState);
      newCells.push(newCell);
    }
    
    this.monsters.push(...newCells);
  }

  private mutate(resistanceType: number): number {
    const allowBackMutations = this.gameState.config.allowBackMutations;
    
    switch (resistanceType) {
      case 0:
        return Math.random() < 0.5 ? 1 : 2;
      
      case 1:
        if (allowBackMutations && Math.random() < 0.5) {
          return 0;
        }
        return 3;
      
      case 2:
        if (allowBackMutations && Math.random() < 0.5) {
          return 0;
        }
        return 3;
      
      case 3:
        if (allowBackMutations) {
          return Math.random() < 0.5 ? 1 : 2;
        }
        return 3;
      
      default:
        return resistanceType;
    }
  }

  private compete(): void {
    const shuffled = [...this.monsters].sort(() => Math.random() - 0.5);
    const numCellsThatCompete = this.gameState.config.numCellsThatCompete;
    const numCellsThatDie = this.gameState.config.numCellsThatDie;
    
    const cellsToRemove: Set<Monster> = new Set();
    
    for (let i = 0; i < shuffled.length; i += numCellsThatCompete) {
      const group = shuffled.slice(i, i + numCellsThatCompete);
      
      if (group.length === numCellsThatCompete) {
        group.sort((a, b) => b.resistanceType - a.resistanceType);
        
        for (let j = 0; j < numCellsThatDie && j < group.length; j++) {
          cellsToRemove.add(group[j]);
        }
      }
    }
    
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      if (cellsToRemove.has(this.monsters[i])) {
        this.monsters[i].destroy();
        this.monsters.splice(i, 1);
      }
    }
  }

  update(): void {
    for (const monster of this.monsters) {
      monster.updatePosition();
    }
  }

  getMonsters(): Monster[] {
    return this.monsters;
  }

  getMonsterAt(tileX: number, tileY: number): Monster | null {
    return this.monsters.find(m => m.tileX === tileX && m.tileY === tileY) || null;
  }

  getMonsterNearScreenPos(screenX: number, screenY: number, maxDistance: number = 25): Monster | null {
    let closestMonster: Monster | null = null;
    let closestDistance = maxDistance;

    for (const monster of this.monsters) {
      const pos = IsoUtils.tileToScreen(monster.tileX, monster.tileY);
      const cellY = pos.y - 10;
      const distance = Math.sqrt(Math.pow(pos.x - screenX, 2) + Math.pow(cellY - screenY, 2));
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMonster = monster;
      }
    }

    return closestMonster;
  }

  getCellCounts(): { [key: number]: number } {
    const counts: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const cell of this.monsters) {
      counts[cell.resistanceType]++;
    }
    return counts;
  }

  hideAllTooltips(): void {
    for (const monster of this.monsters) {
      monster.hideTooltip();
    }
  }
}
