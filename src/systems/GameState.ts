export const THERAPIES = [
  'None',
  'Paclitaxel',
  'Carboplatin',
  'Radiation',
  'Tamoxifen',
  'Herceptin',
  'Pembrolizumab'
];

export interface GameConfig {
  numStartingCells: number;
  proportionResistant: number;
  numCellsThatCompete: number;
  numCellsThatDie: number;
  numCellsDetectableByRadiology: number;
  mutationRate: number;
  sizeOfLethalCancer: number;
  monthsToSurvive: number;
  allowBackMutations: boolean;
  showTooltips: boolean;
}

export class GameState {
  public month: number = 0;
  public lastRadiologyMonth: number = -2;
  public sensitiveTherapy1: string = '';
  public sensitiveTherapy2: string = '';
  public gameOver: boolean = false;
  public gameWon: boolean = false;
  public messages: string[] = [];
  public lastDiagnosticResult: { type: 'ct-scan' | 'biomarker', title: string, content: string } | null = null;
  
  public config: GameConfig = {
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

  constructor() {
    this.loadSettings();
    this.chooseSensitivities();
  }
  
  private loadSettings(): void {
    const savedSettings = localStorage.getItem('cancerBossSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        Object.assign(this.config, settings);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }

  private chooseSensitivities(): void {
    const availableTherapies = THERAPIES.filter(t => t !== 'None');
    const index1 = Math.floor(Math.random() * availableTherapies.length);
    let index2 = Math.floor(Math.random() * availableTherapies.length);
    
    while (index1 === index2) {
      index2 = Math.floor(Math.random() * availableTherapies.length);
    }
    
    this.sensitiveTherapy1 = availableTherapies[index1];
    this.sensitiveTherapy2 = availableTherapies[index2];
    
    console.log(`Tumor is sensitive to: ${this.sensitiveTherapy1} and ${this.sensitiveTherapy2}`);
  }

  addMessage(message: string): void {
    this.messages.push(message);
    console.log(message);
    if (this.messages.length > 10) {
      this.messages.shift();
    }
  }

  checkWinCondition(cellCount: number): void {
    const tumorSize = cellCount / 10;
    
    if (tumorSize > this.config.sizeOfLethalCancer) {
      this.gameOver = true;
      this.addMessage(`GAME OVER: Cancer exceeded lethal size (${tumorSize.toFixed(1)}cc) after ${this.month} months.`);
    }
    
    if (this.month >= this.config.monthsToSurvive && !this.gameOver) {
      this.gameWon = true;
      this.gameOver = true;
      this.addMessage(`SUCCESS! You kept the patient alive for ${this.month} months!`);
    }
  }

  canOrderCTScan(): boolean {
    return this.lastRadiologyMonth < (this.month - 1);
  }

  performCTScan(cellCount: number): void {
    if (!this.canOrderCTScan()) {
      this.addMessage(`You last ordered a CT scan on month ${this.lastRadiologyMonth}. Insurance will not pay for a CT scan this soon.`);
      return;
    }
    
    if (cellCount >= this.config.numCellsDetectableByRadiology) {
      const tumorSize = cellCount / 10;
      const message = `Tumor size: ${tumorSize.toFixed(1)} cubic centimeters`;
      this.addMessage(`Radiology estimates a tumor size of ${tumorSize.toFixed(1)} cubic centimeters`);
      this.lastDiagnosticResult = {
        type: 'ct-scan',
        title: 'CT SCAN RESULTS',
        content: message
      };
    } else {
      this.addMessage('Radiology did not detect any tumor');
      this.lastDiagnosticResult = {
        type: 'ct-scan',
        title: 'CT SCAN RESULTS',
        content: 'No tumor detected'
      };
    }
    
    this.lastRadiologyMonth = this.month;
  }

  getBiomarkerResult(testName: string, cellCounts: { [key: number]: number }): void {
    const totalCells = Object.values(cellCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalCells < this.config.numCellsDetectableByRadiology) {
      this.addMessage("You can't find any tumor to biopsy for the test.");
      this.lastDiagnosticResult = {
        type: 'biomarker',
        title: `${testName.toUpperCase()} TEST`,
        content: 'Insufficient tumor tissue for biopsy'
      };
      return;
    }
    
    let frequencySensitive = 0;
    
    const proliferationTests = ['Paclitaxel', 'Carboplatin', 'Radiation'];
    
    if (testName === 'Proliferation') {
      if (proliferationTests.includes(this.sensitiveTherapy1)) {
        frequencySensitive = (cellCounts[0] + cellCounts[2]) / totalCells;
      } else if (proliferationTests.includes(this.sensitiveTherapy2)) {
        frequencySensitive = (cellCounts[0] + cellCounts[1]) / totalCells;
      }
    } else if (testName === 'Estrogen receptor') {
      if (this.sensitiveTherapy1 === 'Tamoxifen') {
        frequencySensitive = (cellCounts[0] + cellCounts[2]) / totalCells;
      } else if (this.sensitiveTherapy2 === 'Tamoxifen') {
        frequencySensitive = (cellCounts[0] + cellCounts[1]) / totalCells;
      }
    } else if (testName === 'HER2') {
      if (this.sensitiveTherapy1 === 'Herceptin') {
        frequencySensitive = (cellCounts[0] + cellCounts[2]) / totalCells;
      } else if (this.sensitiveTherapy2 === 'Herceptin') {
        frequencySensitive = (cellCounts[0] + cellCounts[1]) / totalCells;
      }
    } else if (testName === 'PD-L1') {
      if (this.sensitiveTherapy1 === 'Pembrolizumab') {
        frequencySensitive = (cellCounts[0] + cellCounts[2]) / totalCells;
      } else if (this.sensitiveTherapy2 === 'Pembrolizumab') {
        frequencySensitive = (cellCounts[0] + cellCounts[1]) / totalCells;
      }
    }
    
    let result: string;
    if (frequencySensitive === 0) {
      result = 'NEGATIVE';
      this.addMessage(`The ${testName} test was negative.`);
    } else if (frequencySensitive < 0.33) {
      result = 'WEAKLY POSITIVE';
      this.addMessage(`The tumor is weakly positive for ${testName}.`);
    } else if (frequencySensitive < 0.67) {
      result = 'MODERATELY POSITIVE';
      this.addMessage(`The tumor is moderately positive for ${testName}.`);
    } else {
      result = 'STRONGLY POSITIVE';
      this.addMessage(`The tumor is strongly positive for ${testName}.`);
    }
    
    this.lastDiagnosticResult = {
      type: 'biomarker',
      title: `${testName.toUpperCase()} TEST`,
      content: result
    };
  }
}
