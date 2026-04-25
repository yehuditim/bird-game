import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
import { BodyPartsGame } from './components/BodyPartsGame';
import { TwoBirdsGame } from './components/TwoBirdsGame';
import { birds } from './data/birds';
import { AgeMode } from './types/ageMode';

type Screen = 'start' | 'game' | 'body-parts' | 'two-birds';

function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [playerName, setPlayerName] = useState('');
  const [ageMode, setAgeMode] = useState<AgeMode>('9-11');

  const handleStart = (name: string, mode: AgeMode) => {
    setPlayerName(name);
    setAgeMode(mode);
    setScreen('game');
  };

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          totalBirds={birds.length}
          onStart={handleStart}
          onBodyParts={() => setScreen('body-parts')}
          onTwoBirds={() => setScreen('two-birds')}
        />
      )}
      {screen === 'game' && (
        <Game
          playerName={playerName}
          ageMode={ageMode}
          onQuit={() => setScreen('start')}
        />
      )}
      {screen === 'body-parts' && (
        <BodyPartsGame onQuit={() => setScreen('start')} />
      )}
      {screen === 'two-birds' && (
        <TwoBirdsGame onQuit={() => setScreen('start')} />
      )}
    </div>
  );
}

export default App;
