import React from 'react';
import {Composition, registerRoot, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate} from 'remotion';
import data from './data.json';

function StickFigure({frame}) {
  const walk = Math.sin(frame / 6) * 18;
  return <svg width="380" height="420" viewBox="0 0 380 420">
    <circle cx="190" cy="75" r="42" fill="none" stroke="#111" strokeWidth="9"/>
    <line x1="190" y1="117" x2="190" y2="265" stroke="#111" strokeWidth="9" strokeLinecap="round"/>
    <line x1="190" y1="155" x2={125+walk} y2="215" stroke="#111" strokeWidth="9" strokeLinecap="round"/>
    <line x1="190" y1="155" x2={255-walk} y2="215" stroke="#111" strokeWidth="9" strokeLinecap="round"/>
    <line x1="190" y1="265" x2={135-walk} y2="370" stroke="#111" strokeWidth="9" strokeLinecap="round"/>
    <line x1="190" y1="265" x2={245+walk} y2="370" stroke="#111" strokeWidth="9" strokeLinecap="round"/>
  </svg>;
}

export function Video() {() {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const scene=data.scenes.find(s=>frame>=s.start && frame<s.start+s.duration) || data.scenes[data.scenes.length-1];
  const local=frame-scene.start;
  const opacity=interpolate(local,[0,8,Math.max(9,scene.duration-8),scene.duration],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <div style={{width:'100%',height:'100%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',fontFamily:'Arial',padding:100,boxSizing:'border-box'}}>
    <Audio src={staticFile('voice.mp3')}/>
    <div style={{opacity,display:'flex',alignItems:'center',gap:80}}>
      <StickFigure frame={frame}/>
      <div style={{width:900,fontSize:58,fontWeight:800,color:'#111',lineHeight:1.3}}>{scene.text}</div>
    </div>
    <div style={{position:'absolute',bottom:65,width:1500,height:5,background:'#ddd'}}>
      <div style={{width:(frame/data.frames*100)+'%',height:'100%',background:'#111'}}/>
    </div>
  </div>;
}

registerRoot(()=>{
  return <Composition id="Main" component={Video} durationInFrames={data.frames} fps={data.fps} width={1920} height={1080}/>;
});
