# Isometric RTS Prototype

A simple isometric tile-based game prototype built with Phaser 3 and TypeScript.

## Setup

Install dependencies:

```bash
npm install
```

## Running the Game

Start the development server:

```bash
npm run dev
```

The game will open automatically in your browser at `http://localhost:3000`

## Controls

- **Arrow Keys**: Pan the camera
- **+/-**: Zoom in/out
- **Mouse**: Hover over tiles to highlight them
- **Click**: Select a tile (logs to console)

## Project Structure

```
src/
├── main.ts              # Game initialization
├── scenes/
│   └── GameScene.ts     # Main game scene with isometric grid
├── systems/
│   └── IsometricMap.ts  # Tile rendering and management
└── utils/
    └── IsoUtils.ts      # Isometric coordinate conversion utilities
```

## Features (Phase 1)

- ✅ Isometric tile grid (20x20)
- ✅ Tile highlighting on mouse hover
- ✅ Camera panning with arrow keys
- ✅ Zoom controls
- ✅ Screen-to-tile coordinate conversion

## Next Steps (Phase 2)

- Add Monster/Unit entities
- Implement unit selection
- Add unit movement
- Create basic pathfinding
