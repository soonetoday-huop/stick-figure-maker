
import React from 'react';
import {
  Audio,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  registerRoot,
  Composition,
} from 'remotion';
import data from './data.json';

function StickFigure({ frame, rich = false }) {
  const walk = Math.sin(frame / 6) * 18;
  const color = rich ? '#c58b24' : '#171717';

  return (
    <svg
      width="380"
      height="420"
      viewBox="0 0 380 420"
      role="img"
    >
      <circle
        cx="190"
        cy="75"
        r="42"
        fill="none"
        stroke={color}
        strokeWidth="9"
      />
      <line
        x1="190" y1="117" x2="190" y2="265"
        stroke={color} strokeWidth="9" strokeLinecap="round"
      />
      <line
        x1="190" y1="155" x2={125 + walk} y2="215"
        stroke={color} strokeWidth="9" strokeLinecap="round"
      />
      <line
        x1="190" y1="155" x2={255 - walk} y2="215"
        stroke={color} strokeWidth="9" strokeLinecap="round"
      />
      <line
        x1="190" y1="265" x2={135 - walk} y2="370"
        stroke={color} strokeWidth="9" strokeLinecap="round"
      />
      <line
        x1="190" y1="265" x2={245 + walk} y2="370"
        stroke={color} strokeWidth="9" strokeLinecap="round"
      />
    </svg>
  );
}

function Video() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scenes = data.scenes || [];
  const scene =
    scenes.find(
      (s) => frame >= s.start && frame < s.start + s.duration
    ) || scenes[scenes.length - 1];

  if (!scene) {
    return <div style={{ flex: 1, background: '#fff' }} />;
  }

  const local = frame - scene.start;
  const duration = Math.max(1, scene.duration);
  const fadeEnd = Math.max(9, duration - 8);

  const opacity = interpolate(
    local,
    [0, 8, fadeEnd, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const rich = frame >= (data.frames || 45000) / 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
        color: '#171717',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        padding: 70,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <Audio src={staticFile('voice1.mp3')} />

      <div
        style={{
          opacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
          width: '100%',
        }}
      >
        <StickFigure frame={frame} rich={rich} />

        <div
          style={{
            width: 900,
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.3,
            color: '#171717',
          }}
        >
          {scene.text}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 65,
          left: 210,
          width: 1500,
          height: 5,
          background: '#dddddd',
        }}
      >
        <div
          style={{
            width:
              (frame / Math.max(1, data.frames || 45000)) * 100 + '%',
            height: '100%',
            background: '#171717',
          }}
        />
      </div>
    </div>
  );
}

function RemotionRoot() {
  return (
    <Composition
      id="Main"
      component={Video}
      durationInFrames={data.frames || 45000}
      fps={data.fps || 30}
      width={1920}
      height={1080}
    />
  );
}

registerRoot(RemotionRoot);
    
