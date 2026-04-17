# Graph Algorithm Visualizer

An interactive, browser-only SPA for visualizing classic graph algorithms step by step. Built as a teaching tool for undergraduate data structures and algorithms courses.

---

## Features

- **Interactive graph editor** — add/move/delete nodes and edges with mouse clicks; toggle directed and weighted modes
- **Algorithms** — BFS, DFS, Dijkstra, Prim, Kruskal
- **Step-by-step execution** — every meaningful decision is a separate step with a human-readable explanation
- **Synchronized pseudocode** — the active line highlights as you navigate steps
- **Internal state panel** — queue/stack for BFS/DFS; distance table + min-heap for Dijkstra; candidate edges for Prim; union-find components for Kruskal
- **Full playback controls** — Play/Pause, Prev/Next, First/Last, timeline scrubber, 5 speed presets (0.25× – 4×)
- **Keyboard shortcuts** — `←` / `→` steps, `Space` play/pause, `Home` / `End` jump to first/last
- **Text import** — paste an adjacency list and the graph is parsed automatically
- **4 preloaded examples** — simple undirected, directed weighted (Dijkstra), MST, disconnected

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 + Vite 8 |
| Graph renderer | Cytoscape.js |
| Global state | Zustand |
| Styling | Tailwind CSS v4 |
| Language | TypeScript (strict) |
| Tests | Vitest |

---

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm 9+

### Install & run

```bash
git clone https://github.com/EDA-MATCOM/Graph-Algorithm-Visualizer.git
cd Graph-Algorithm-Visualizer
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Other commands

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm test          # run unit tests with Vitest
```

---

## Usage

### Building a graph

| Mode | How to activate | Action |
|---|---|---|
| Select | Click **Select** button | Click node/edge to select; drag node to move |
| Add Node | Click **+ Node** | Click anywhere on the canvas |
| Add Edge | Click **+ Edge** | Click source node, then target node |
| Delete | Click **Delete** | Click any node or edge |

Toggle **Directed** and **Weighted** checkboxes before or after building your graph.

### Importing a graph via text

Click **Import** and paste an adjacency list:

```
# Undirected, no weights
A B
A C
B D

# Directed with weights  (use -> and a number)
A->B 4
A->C 2
B->D 5
```

The parser auto-detects whether the graph is directed (`->`) and weighted (trailing number).

### Running an algorithm

1. Select an algorithm from the **Algorithm** dropdown (incompatible algorithms are greyed out).
2. Select a **Start** node.
3. Click **▶ Run** — all steps are pre-computed immediately.
4. Use the playback controls at the bottom (or keyboard shortcuts) to navigate.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `→` | Next step |
| `←` | Previous step |
| `Space` | Play / Pause |
| `Home` | Jump to first step |
| `End` | Jump to last step |

---

## Project Structure

```
src/
├── core/
│   ├── graph/
│   │   ├── types.ts              # GraphModel, GraphNode, GraphEdge
│   │   └── GraphSerializer.ts    # Adjacency-list parser, JSON round-trip
│   └── algorithms/
│       ├── types.ts              # AlgorithmStep, AuxiliaryState, etc.
│       ├── AlgorithmRunner.ts    # Materializes generator steps
│       ├── index.ts              # ALGORITHMS registry
│       ├── bfs.ts
│       ├── dfs.ts
│       ├── dijkstra.ts
│       ├── prim.ts
│       └── kruskal.ts
├── store/
│   ├── graphStore.ts             # Zustand: graph model + edit mode
│   └── executionStore.ts         # Zustand: playback state + step cursor
├── components/
│   ├── GraphCanvas/              # Cytoscape wrapper + style definitions
│   ├── Toolbar/                  # Edit-mode buttons, algorithm selector, run
│   ├── Controls/                 # Play/pause/speed/timeline
│   ├── StatePanel/               # Pseudocode, internal state, step description
│   └── Modals/                   # Examples loader, import panel
├── hooks/
│   ├── usePlayback.ts            # setInterval-based auto-advance
│   └── useKeyboardShortcuts.ts   # Arrow/Space/Home/End bindings
└── examples/
    └── graphs/                   # simple.json, weighted.json, mst.json, disconnected.json
```

### How algorithms work

Each algorithm is a **generator function** (`function*`) that `yield`s one `AlgorithmStep` per meaningful decision. `AlgorithmRunner` exhausts the generator into an array before animation begins, which means:

- Navigating backwards is free (just move the index).
- The animation layer never touches algorithm logic.
- Adding a new algorithm means writing one generator function and registering it in `index.ts`.

---

## Algorithms Reference

| Algorithm | Data structure | Graph type | What you see |
|---|---|---|---|
| BFS | Queue (FIFO) | Any | Frontier expanding layer by layer |
| DFS | Stack (LIFO) | Any | Deep path traced before backtracking |
| Dijkstra | Min-heap | Weighted, no neg. weights | Distance table relaxing in real time |
| Prim | Candidate edge list | Undirected, weighted | MST growing one edge at a time |
| Kruskal | Union-Find | Undirected, weighted | Edges added in weight order, cycles rejected |

---

## Contributing

1. Fork the repo and create a feature branch.
2. Add your algorithm as a generator in `src/core/algorithms/` following the existing pattern.
3. Register it in `src/core/algorithms/index.ts`.
4. Run `npm run build` — zero TypeScript errors required.
5. Open a pull request.

---

## License

ISC
