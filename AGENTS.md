# Treat Cancer Like a Boss - Game Prototype

## Project Overview
An isometric tile-based cancer treatment simulation game using Phaser 3 and TypeScript. Based on the NetLogo game "Treat Cancer Like a Boss", this game simulates cancer treatment decisions where players must manage therapy resistance, cell competition, and mutation dynamics. Built with Vite for fast development.

## Tech Stack
- **Engine**: Phaser 3 (v3.80.1)
- **Language**: TypeScript (strict mode)
- **Bundler**: Vite (v5.0.12)
- **Dev Server**: Node.js via Vite dev server

## Project Structure
```
src/
├── main.ts                    # Phaser game initialization
├── scenes/
│   └── GameScene.ts          # Main game scene with UI integration
├── entities/
│   ├── Monster.ts            # Cell entity class
│   └── MonsterType.ts        # Cell type definitions (resistance-based)
├── systems/
│   ├── IsometricMap.ts       # Tile rendering and highlighting
│   ├── EntityManager.ts      # Cell lifecycle, treatment, proliferation, competition
│   ├── GameState.ts          # Game state, therapies, win/lose conditions
│   └── UIManager.ts          # Left-side control panel UI
└── utils/
    └── IsoUtils.ts           # Isometric coordinate conversion
```

## Core Systems

### Isometric Tile System
- 20x20 tile grid with alternating green colors
- Tile size: 64x32 (width x height)
- Coordinate conversion between screen space and tile space
- Tile highlighting on mouse hover
- Camera centered on map center at startup

### Cell Type System
**4 Cell Types** (based on therapy resistance):
- **Sensitive** (Pink #ff6699): Resistance type 0 - sensitive to both therapies
- **Resistant-1** (Orange #ffaa44): Resistance type 1 - resistant to therapy 1 only
- **Resistant-2** (Yellow #ffdd44): Resistance type 2 - resistant to therapy 2 only
- **Doubly-Resistant** (Red #ff4444): Resistance type 3 - resistant to both therapies

**Cell Rendering**:
- Colored circles (12px radius) with black outline
- Subtle idle animation (floating/bobbing effect)
- No health bars (cells either live or die from treatment)

### Treatment System
**6 Available Therapies**:
- Paclitaxel (chemotherapy)
- Carboplatin (chemotherapy)
- Radiation
- Tamoxifen (hormone therapy)
- Herceptin (targeted therapy)
- Pembrolizumab (immunotherapy)

**Treatment Mechanics**:
- Tumor is randomly sensitive to 2 of the 6 therapies (hidden from player initially)
- Each treatment can be applied at High or Low dose
- High dose: Kills all sensitive cells
- Low dose: Kills sensitive cells with 50% probability
- Up to 2 treatments can be applied per month

### Cell Lifecycle (Per Treatment Round)
1. **Treatment Phase**: Apply selected therapies, kill sensitive cells
2. **Proliferation Phase**: All surviving cells duplicate
3. **Mutation Phase**: New cells mutate with configurable probability (default 25%)
   - Sensitive → Resistant-1 or Resistant-2 (50/50)
   - Resistant-1 → Doubly-Resistant (or back to Sensitive if back-mutations enabled)
   - Resistant-2 → Doubly-Resistant (or back to Sensitive if back-mutations enabled)
   - Doubly-Resistant → Resistant-1 or Resistant-2 (if back-mutations enabled)
4. **Competition Phase**: Cells compete in groups, weakest die
   - Groups of 8 cells compete (configurable)
   - 2 weakest cells per group die (configurable)
   - Weakness order: Doubly-Resistant > Resistant-2 > Resistant-1 > Sensitive

### Diagnostic System
**CT Scan**:
- Shows tumor size in cubic centimeters (cell count / 10)
- Can only be ordered once every 2 months
- Minimum detection threshold: 10 cells (configurable)

**Biomarker Tests**:
- Proliferation test (indicates sensitivity to Paclitaxel/Carboplatin/Radiation)
- Estrogen receptor test (indicates sensitivity to Tamoxifen)
- HER2 test (indicates sensitivity to Herceptin)
- PD-L1 test (indicates sensitivity to Pembrolizumab)
- Results: Negative, Weakly Positive (<33%), Moderately Positive (33-67%), Strongly Positive (>67%)

### Win/Lose Conditions
- **Lose**: Tumor exceeds lethal size (default 5cc = 50 cells)
- **Win**: Keep patient alive for target duration (default 24 months)

### UI Controls (Left Panel)
- Month counter and cell count display
- Treatment 1 selector (therapy + dose)
- Treatment 2 selector (therapy + dose)
- "Apply Treatment" button (advances 1 month)
- "CT Scan" button
- Biomarker test selector + "Order Test" button
- Message log (shows last 5 messages)

### Camera Controls
- **Arrow Keys**: Pan camera
- **+/-**: Zoom in/out (range: 0.3x to 3x)
- Initial zoom: 1x, centered on map

### Input Handling
- **Mouse Move**: Highlight tiles
- **Click Cell**: Log cell type and resistance type

## Key Design Decisions
- Faithful translation of NetLogo game mechanics
- Cell competition represents fitness cost of resistance
- Mutation system allows resistance evolution
- Diagnostic tests provide partial information (realistic uncertainty)
- Simple UI for easy gameplay
- All game parameters configurable in GameState

## Game Parameters (Configurable)
- `numStartingCells`: 10
- `proportionResistant`: 0.6 (60% start with some resistance)
- `numCellsThatCompete`: 8
- `numCellsThatDie`: 2
- `numCellsDetectableByRadiology`: 10
- `mutationRate`: 0.25 (25%)
- `sizeOfLethalCancer`: 5 (cc)
- `monthsToSurvive`: 24
- `allowBackMutations`: false

## Development Commands
```bash
npm install          # Install dependencies
npm run dev         # Start dev server (opens at localhost:3000)
npm run build       # Build for production
npm run preview     # Preview production build
```

## Extension Points (Easy to Modify)
1. **Add new therapies**: Edit `THERAPIES` in `GameState.ts`
2. **Change cell lifecycle**: Modify methods in `EntityManager.ts`
3. **Adjust game parameters**: Edit `config` object in `GameState.ts`
4. **Add new diagnostic tests**: Extend `getBiomarkerResult()` in `GameState.ts`
5. **Modify UI**: Edit `UIManager.ts`

## Current Status
- ✅ Cell type system with resistance mechanics
- ✅ Treatment application with dose control
- ✅ Cell proliferation with mutation
- ✅ Cell competition based on resistance
- ✅ Diagnostic system (CT scan + biomarker tests)
- ✅ Win/lose conditions
- ✅ Full UI with controls and feedback

## Notes
- Game mechanics directly translated from NetLogo original
- Faithful to cancer biology concepts (resistance, mutation, competition)
- Educational tool for understanding adaptive therapy strategies
- Console logging for debugging game events
