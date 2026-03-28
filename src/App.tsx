import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
import { birds } from './data/birds';

type Screen = 'start' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [playerName, setPlayerName] = useState('');

  const handleStart = (name: string) => {
    setPlayerName(name);
    setScreen('game');
  };

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          totalBirds={birds.length}
          onStart={handleStart}
        />
      )}
      {screen === 'game' && (
        <Game
          playerName={playerName}
          onQuit={() => setScreen('start')}
        />
      )}
    </div>
  );
}

export default App;
