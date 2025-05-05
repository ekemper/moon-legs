import React, { useRef, useState } from 'react';
import './App.css';

const audioFiles = [
  "Afro-Interdimentional Contrabassoon.mp3",
  "Bacchanalia of the Tarsier.mp3",
  "Byzantine Parthenogenesis.mp3",
  "dispersive directly.mp3",
  "Ego Death Before Breakfast.mp3",
  "Inverted Inflorescence.mp3",
  "lunar orbit.mp3",
  "mediocre automaton.mp3",
  "misdirectoscopy.mp3",
  "Polystyrene Hellscape.mp3",
  "rave lather.mp3",
  "sleeping nose whistle of the machine god V2.mp3",
  "solipsistic prizm.mp3",
  "The Shrike.mp3"
];

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function App() {
  const [current, setCurrent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const playAudio = (file, idx) => {
    if (current === idx && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setCurrent(idx);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.src = `/audio/${file}`;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime / audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrent(null);
    setProgress(0);
  };

  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);

  return (
    <div className="App">
      <h1 className="parisienne-regular moon-legs-header">Moon Legs</h1>
      <div className="audio-list-container">
        <ul className="audio-list">
          {audioFiles.map((file, idx) => (
            <li key={file} className="audio-list-item">
              <div className="audio-list-row">
                <span
                  className={`play-icon${current === idx ? ' playing' : ''}`}
                  onClick={() => playAudio(file, idx)}
                  tabIndex={0}
                  role="button"
                  aria-label={isPlaying && current === idx ? `Pause ${file}` : `Play ${file}`}
                >
                  {isPlaying && current === idx ? (
                    // Pause icon
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="16" fill="#5A7B74" fillOpacity="0.8" />
                      <rect x="11" y="9" width="4" height="14" rx="2" fill="#fff" />
                      <rect x="17" y="9" width="4" height="14" rx="2" fill="#fff" />
                    </svg>
                  ) : (
                    // Play icon
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="16" fill="#5A7B74" fillOpacity="0.8" />
                      <polygon points="12,9 25,16 12,23" fill="#fff" />
                    </svg>
                  )}
                </span>
                <div className="audio-title-container">
                  <span
                    className={`audio-title${current === idx ? ' active' : ''}`}
                    onClick={() => playAudio(file, idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {toTitleCase(file.replace(/\.mp3$/, '').replace(/_/g, ' '))}
                  </span>
                  {current === idx && (
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}

          {/* <div className="song-list-arrow--">
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L9 8L16 2" stroke="#5A7B74" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div> */}
        </ul>

      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
      />
    </div>
  );
}

export default App;
