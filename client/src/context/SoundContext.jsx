import React, { createContext, useContext, useState } from 'react';
import { sounds } from '../utils/soundEffects';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
  };

  const playPop = () => soundEnabled && sounds.playPop();
  const playCorrect = () => soundEnabled && sounds.playCorrect();
  const playWrong = () => soundEnabled && sounds.playWrong();
  const playFanfare = () => soundEnabled && sounds.playFanfare();

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playPop,
        playCorrect,
        playWrong,
        playFanfare,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
