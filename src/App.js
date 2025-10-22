import "./cors-redirect";
import { useEffect, useState } from "react";
import { stranger_tune } from "./tunes";
import { useStrudel } from "./hooks/useStrudel";
import { useTextProcessor } from "./hooks/useTextProcessor";
import { ControlPanel } from "./components/ControlPanel";
import { StrudelEditor } from "./components/StrudelEditor";
import { Header } from "./components/Header";
import { PreprocessView } from "./components/PreprocessView";

export default function StrudelDemo() {
  const { isInitialized, isPlaying, play, stop, setCode, restartPlayback } =
    useStrudel();
  const {
    text,
    isHushMode,
    processText,
    handleTextChange,
    handleHushModeChange,
  } = useTextProcessor();
  
  const [pattern, setPattern] = useState(0);
  const [bass, setBass] = useState(0);

  useEffect(() => {
    if (isInitialized && !text) {
      handleTextChange(stranger_tune);
    }
  }, [isInitialized, text, handleTextChange]);

  useEffect(() => {
    if (isInitialized && text) {
      const processedText = processText(text, pattern, bass);
      setCode(processedText);
      
      // If strudel is currently playing, restart it with the new values
      if (isPlaying) {
        setTimeout(() => {
          restartPlayback(true);
        }, 100);
      }
    }
  }, [isInitialized, text, isHushMode, processText, setCode, pattern, bass, isPlaying, restartPlayback]);


  const handleProcess = () => {
    const processedText = processText(text, pattern, bass);
    setCode(processedText);
  };

  const handleProcessAndPlay = () => {
    const processedText = processText(text, pattern, bass);
    setCode(processedText);

    play();
  };

  const handlePlay = async () => {
    // pre-process first
    const processedText = processText(text, pattern, bass);
    // set the processed code
    setCode(processedText);

    // then play
    await play();
  };

  const handleModeChange = (hushMode) => {
    const wasPlaying = isPlaying;
    handleHushModeChange(hushMode);
    const processedText = processText(text, pattern, bass);
    setCode(processedText);

    // if it was playing, restart playback with new code
    if (wasPlaying) {
      setTimeout(() => {
        restartPlayback(wasPlaying);
      }, 100);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Header
        isHushMode={isHushMode}
        isPlaying={isPlaying}
        onModeChange={handleModeChange}
      />
      <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-4 md:p-4">
        <PreprocessView 
          text={text} 
          onTextChange={handleTextChange}
          pattern={pattern}
          bass={bass}
          onPatternChange={setPattern}
          onBassChange={setBass}
        />
        <StrudelEditor />
      </main>

      <ControlPanel
        onProcess={handleProcess}
        onProcessAndPlay={handleProcessAndPlay}
        onPlay={handlePlay}
        onStop={stop}
        isPlaying={isPlaying}
        pattern={pattern}
        bass={bass}
        onPatternChange={setPattern}
        onBassChange={setBass}
      />
    </div>
  );
}
