import { Toolbar } from './components/Toolbar/Toolbar';
import { GraphCanvas } from './components/GraphCanvas/GraphCanvas';
import { StatePanel } from './components/StatePanel/StatePanel';
import { PlaybackControls } from './components/Controls/PlaybackControls';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <GraphCanvas />
        </div>
        <div className="w-72 flex-shrink-0">
          <StatePanel />
        </div>
      </div>
      <PlaybackControls />
    </div>
  );
}
