import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
import { birds } from './data/birds';

type Screen = 'start' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('start');

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          totalBirds={birds.length}
          onStart={() => setScreen('game')}
        />
      )}
      {screen === 'game' && (
        <Game onQuit={() => setScreen('start')} />
      )}
    </div>
  );
}

export default App;
