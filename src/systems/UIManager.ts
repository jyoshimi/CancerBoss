import { GameState, THERAPIES } from './GameState';

export class UIManager {
  private gameState: GameState;
  
  private cellCountElement: HTMLElement;
  private tumorSizeValueElement: HTMLElement;
  private survivalTimeValueElement: HTMLElement;
  private tumorSizeBarElement: HTMLElement;
  private tumorSizeMarkerElement: HTMLElement;
  private survivalTimeBarElement: HTMLElement;
  private survivalTimeMarkerElement: HTMLElement;
  private treatment1Select: HTMLSelectElement;
  private treatment2Select: HTMLSelectElement;
  private dose1Select: HTMLSelectElement;
  private dose2Select: HTMLSelectElement;
  private diagnosticTestSelect: HTMLSelectElement;
  private messagesElement: HTMLElement;
  private applyTreatmentButton: HTMLButtonElement;
  private ctScanButton: HTMLButtonElement;
  private orderTestButton: HTMLButtonElement;
  private restartGameButton: HTMLButtonElement;
  
  private instructionsModal: HTMLElement;
  private settingsModal: HTMLElement;
  private showInstructionsButton: HTMLButtonElement;
  private showSettingsButton: HTMLButtonElement;
  private closeInstructionsButton: HTMLElement;
  private closeSettingsButton: HTMLElement;
  private applySettingsButton: HTMLButtonElement;
  private resetSettingsButton: HTMLButtonElement;
  
  private gameOverOverlay: HTMLElement;
  private gameOverTitle: HTMLElement;
  private gameOverMessage: HTMLElement;
  private gameOverRestartButton: HTMLButtonElement;
  
  private activeBanner: HTMLElement | null = null;
  
  public onApplyTreatment?: () => void;
  public onCTScan?: () => void;
  public onBiomarkerTest?: () => void;
  public onRestartGame?: () => void;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    
    this.cellCountElement = document.getElementById('cell-count')!;
    this.tumorSizeValueElement = document.getElementById('tumor-size-value')!;
    this.survivalTimeValueElement = document.getElementById('survival-time-value')!;
    this.tumorSizeBarElement = document.getElementById('tumor-size-bar')!;
    this.tumorSizeMarkerElement = document.getElementById('tumor-size-marker')!;
    this.survivalTimeBarElement = document.getElementById('survival-time-bar')!;
    this.survivalTimeMarkerElement = document.getElementById('survival-time-marker')!;
    this.treatment1Select = document.getElementById('treatment1') as HTMLSelectElement;
    this.treatment2Select = document.getElementById('treatment2') as HTMLSelectElement;
    this.dose1Select = document.getElementById('dose1') as HTMLSelectElement;
    this.dose2Select = document.getElementById('dose2') as HTMLSelectElement;
    this.diagnosticTestSelect = document.getElementById('diagnostic-test') as HTMLSelectElement;
    this.messagesElement = document.getElementById('messages')!;
    this.applyTreatmentButton = document.getElementById('apply-treatment') as HTMLButtonElement;
    this.ctScanButton = document.getElementById('ct-scan') as HTMLButtonElement;
    this.orderTestButton = document.getElementById('order-test') as HTMLButtonElement;
    this.restartGameButton = document.getElementById('restart-game') as HTMLButtonElement;
    
    this.instructionsModal = document.getElementById('instructions-modal')!;
    this.settingsModal = document.getElementById('settings-modal')!;
    this.showInstructionsButton = document.getElementById('show-instructions') as HTMLButtonElement;
    this.showSettingsButton = document.getElementById('show-settings') as HTMLButtonElement;
    this.closeInstructionsButton = document.getElementById('close-instructions')!;
    this.closeSettingsButton = document.getElementById('close-settings')!;
    this.applySettingsButton = document.getElementById('apply-settings') as HTMLButtonElement;
    this.resetSettingsButton = document.getElementById('reset-settings') as HTMLButtonElement;
    
    this.gameOverOverlay = document.getElementById('game-over-overlay')!;
    this.gameOverTitle = document.getElementById('game-over-title')!;
    this.gameOverMessage = document.getElementById('game-over-message')!;
    this.gameOverRestartButton = document.getElementById('game-over-restart') as HTMLButtonElement;
    
    this.initializeUI();
  }

  setGameState(gameState: GameState): void {
    this.gameState = gameState;
    this.messagesElement.textContent = '';
  }

  private initializeUI(): void {
    this.treatment1Select.innerHTML = '';
    this.treatment2Select.innerHTML = '';
    
    THERAPIES.forEach(therapy => {
      const option1 = document.createElement('option');
      option1.value = therapy;
      option1.textContent = therapy;
      this.treatment1Select.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = therapy;
      option2.textContent = therapy;
      this.treatment2Select.appendChild(option2);
    });
    
    this.applyTreatmentButton.addEventListener('click', () => {
      if (this.onApplyTreatment) this.onApplyTreatment();
    });
    
    this.ctScanButton.addEventListener('click', () => {
      if (this.onCTScan) this.onCTScan();
    });
    
    this.orderTestButton.addEventListener('click', () => {
      if (this.onBiomarkerTest) this.onBiomarkerTest();
    });
    
    this.restartGameButton.addEventListener('click', () => {
      this.hideGameOver();
      if (this.onRestartGame) this.onRestartGame();
    });
    
    this.showInstructionsButton.addEventListener('click', () => {
      this.instructionsModal.style.display = 'block';
    });
    
    this.showSettingsButton.addEventListener('click', () => {
      this.populateSettingsInputs();
      this.settingsModal.style.display = 'block';
    });
    
    this.closeInstructionsButton.addEventListener('click', () => {
      this.instructionsModal.style.display = 'none';
    });
    
    this.closeSettingsButton.addEventListener('click', () => {
      this.settingsModal.style.display = 'none';
    });
    
    this.applySettingsButton.addEventListener('click', () => {
      this.applySettings();
      this.settingsModal.style.display = 'none';
    });
    
    this.resetSettingsButton.addEventListener('click', () => {
      this.resetSettings();
    });
    
    this.gameOverRestartButton.addEventListener('click', () => {
      this.hideGameOver();
      if (this.onRestartGame) this.onRestartGame();
    });
    
    window.addEventListener('click', (event) => {
      if (event.target === this.instructionsModal) {
        this.instructionsModal.style.display = 'none';
      }
      if (event.target === this.settingsModal) {
        this.settingsModal.style.display = 'none';
      }
    });
    
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.instructionsModal.style.display === 'block') {
          this.instructionsModal.style.display = 'none';
        }
        if (this.settingsModal.style.display === 'block') {
          this.settingsModal.style.display = 'none';
        }
      }
    });
  }
  
  private saveSettings(): void {
    localStorage.setItem('cancerBossSettings', JSON.stringify(this.gameState.config));
  }
  
  private populateSettingsInputs(): void {
    const config = this.gameState.config;
    
    (document.getElementById('input-numStartingCells') as HTMLInputElement).value = config.numStartingCells.toString();
    (document.getElementById('input-proportionResistant') as HTMLInputElement).value = (config.proportionResistant * 100).toString();
    (document.getElementById('input-numCellsThatCompete') as HTMLInputElement).value = config.numCellsThatCompete.toString();
    (document.getElementById('input-numCellsThatDie') as HTMLInputElement).value = config.numCellsThatDie.toString();
    (document.getElementById('input-numCellsDetectableByRadiology') as HTMLInputElement).value = config.numCellsDetectableByRadiology.toString();
    (document.getElementById('input-mutationRate') as HTMLInputElement).value = (config.mutationRate * 100).toString();
    (document.getElementById('input-sizeOfLethalCancer') as HTMLInputElement).value = config.sizeOfLethalCancer.toString();
    (document.getElementById('input-monthsToSurvive') as HTMLInputElement).value = config.monthsToSurvive.toString();
    (document.getElementById('input-allowBackMutations') as HTMLSelectElement).value = config.allowBackMutations.toString();
    (document.getElementById('input-showTooltips') as HTMLSelectElement).value = config.showTooltips.toString();
  }
  
  private applySettings(): void {
    const config = this.gameState.config;
    
    config.numStartingCells = parseInt((document.getElementById('input-numStartingCells') as HTMLInputElement).value);
    config.proportionResistant = parseInt((document.getElementById('input-proportionResistant') as HTMLInputElement).value) / 100;
    config.numCellsThatCompete = parseInt((document.getElementById('input-numCellsThatCompete') as HTMLInputElement).value);
    config.numCellsThatDie = parseInt((document.getElementById('input-numCellsThatDie') as HTMLInputElement).value);
    config.numCellsDetectableByRadiology = parseInt((document.getElementById('input-numCellsDetectableByRadiology') as HTMLInputElement).value);
    config.mutationRate = parseInt((document.getElementById('input-mutationRate') as HTMLInputElement).value) / 100;
    config.sizeOfLethalCancer = parseInt((document.getElementById('input-sizeOfLethalCancer') as HTMLInputElement).value);
    config.monthsToSurvive = parseInt((document.getElementById('input-monthsToSurvive') as HTMLInputElement).value);
    config.allowBackMutations = (document.getElementById('input-allowBackMutations') as HTMLSelectElement).value === 'true';
    config.showTooltips = (document.getElementById('input-showTooltips') as HTMLSelectElement).value === 'true';
    
    this.saveSettings();
    this.gameState.addMessage('Settings updated! Click "Restart Game" to apply changes.');
  }
  
  private resetSettings(): void {
    const defaultConfig = {
      numStartingCells: 7,
      proportionResistant: 0.3,
      numCellsThatCompete: 8,
      numCellsThatDie: 3,
      numCellsDetectableByRadiology: 10,
      mutationRate: 0.1,
      sizeOfLethalCancer: 5,
      monthsToSurvive: 24,
      allowBackMutations: false,
      showTooltips: true
    };
    
    Object.assign(this.gameState.config, defaultConfig);
    this.saveSettings();
    this.populateSettingsInputs();
    this.gameState.addMessage('Settings reset to defaults! Click "Restart Game" to apply changes.');
  }

  update(cellCount: number): void {
    this.cellCountElement.textContent = cellCount.toString();
    
    const tumorSize = cellCount / 10;
    const lethalSize = this.gameState.config.sizeOfLethalCancer;
    const monthsToSurvive = this.gameState.config.monthsToSurvive;
    
    this.tumorSizeValueElement.textContent = `${tumorSize.toFixed(1)}cc / ${lethalSize.toFixed(1)}cc`;
    this.survivalTimeValueElement.textContent = `${this.gameState.month} / ${monthsToSurvive} months`;
    
    const tumorSizePercent = Math.min((tumorSize / lethalSize) * 100, 100);
    const survivalTimePercent = Math.min((this.gameState.month / monthsToSurvive) * 100, 100);
    
    this.tumorSizeBarElement.style.width = `${tumorSizePercent}%`;
    this.tumorSizeMarkerElement.style.left = `${tumorSizePercent}%`;
    
    this.survivalTimeBarElement.style.width = `${survivalTimePercent}%`;
    this.survivalTimeMarkerElement.style.left = `${survivalTimePercent}%`;
    
    const recentMessages = this.gameState.messages.slice(-5).join('\n');
    this.messagesElement.textContent = recentMessages;
    
    if (this.gameState.gameOver && this.gameOverOverlay.style.display !== 'block') {
      this.showGameOver();
    }
  }
  
  private showGameOver(): void {
    if (this.gameState.gameWon) {
      this.gameOverTitle.textContent = 'VICTORY!';
      this.gameOverTitle.className = 'game-over-title win';
      const lastMessage = this.gameState.messages[this.gameState.messages.length - 1];
      if (lastMessage.includes('eliminated')) {
        this.gameOverMessage.textContent = `All cancer cells eliminated after ${this.gameState.month} months!`;
      } else {
        this.gameOverMessage.textContent = `You successfully kept the patient alive for ${this.gameState.month} months!`;
      }
    } else {
      this.gameOverTitle.textContent = 'GAME OVER';
      this.gameOverTitle.className = 'game-over-title lose';
      const tumorSize = (this.gameState.messages[this.gameState.messages.length - 1].match(/(\d+\.\d+)cc/) || [])[1];
      this.gameOverMessage.textContent = `The cancer grew too large (${tumorSize || 'unknown size'}) after ${this.gameState.month} months.`;
    }
    this.gameOverOverlay.style.display = 'block';
  }
  
  private hideGameOver(): void {
    this.gameOverOverlay.style.display = 'none';
  }
  
  showDiagnosticBanner(type: 'ct-scan' | 'biomarker', title: string, content: string): void {
    if (this.activeBanner) {
      document.body.removeChild(this.activeBanner);
    }
    
    const banner = document.createElement('div');
    banner.className = `diagnostic-banner ${type}`;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'diagnostic-banner-title';
    titleDiv.textContent = title;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'diagnostic-banner-content';
    contentDiv.textContent = content;
    
    banner.appendChild(titleDiv);
    banner.appendChild(contentDiv);
    document.body.appendChild(banner);
    
    this.activeBanner = banner;
    
    const closeBanner = () => {
      if (banner.parentNode) {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (banner.parentNode) {
            document.body.removeChild(banner);
          }
          if (this.activeBanner === banner) {
            this.activeBanner = null;
          }
        }, 300);
      }
    };
    
    banner.addEventListener('click', closeBanner);
    
    setTimeout(closeBanner, 3000);
  }

  getSelectedTreatment1(): string {
    return this.treatment1Select.value;
  }

  getSelectedTreatment2(): string {
    return this.treatment2Select.value;
  }

  getSelectedDose1(): string {
    return this.dose1Select.value;
  }

  getSelectedDose2(): string {
    return this.dose2Select.value;
  }

  getSelectedDiagnosticTest(): string {
    return this.diagnosticTestSelect.value;
  }
}
