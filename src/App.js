import "./cors-redirect";
import { useEffect } from "react";
import { stranger_tune } from "./tunes";
import { useStrudel } from "./hooks/useStrudel";
import { useTextProcessor } from "./hooks/useTextProcessor";
import { ControlPanel } from "./components/ControlPanel";
import { TextProcessor } from "./components/TextProcessor";
import { StrudelEditor } from "./components/StrudelEditor";
import { RadioOptions } from "./components/RadioOptions";
import { Header } from "./components/Header";

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

  useEffect(() => {
    if (isInitialized && !text) {
      handleTextChange(stranger_tune);
    }
  }, [isInitialized, text, handleTextChange]);

  useEffect(() => {
    if (isInitialized && text) {
      const processedText = processText(text);
      setCode(processedText);
    }
  }, [isInitialized, text, isHushMode, processText, setCode]);

  const handleProcess = () => {
    const processedText = processText(text);
    setCode(processedText);
  };

  const handleProcessAndPlay = () => {
    const processedText = processText(text);
    setCode(processedText);

    play();
  };

  const handlePlay = () => {
    const processedText = processText(text);
    setCode(processedText);
    play();
  };

  const handleModeChange = (hushMode) => {
    const wasPlaying = isPlaying;
    handleHushModeChange(hushMode);
    const processedText = processText(text);
    setCode(processedText);

    // if it was playing, restart playback with new code
    if (wasPlaying) {
      setTimeout(() => {
        restartPlayback(wasPlaying);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6">
        <Header
          isInitialized={isInitialized}
          isHushMode={isHushMode}
          isPlaying={isPlaying}
        />
        <main className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TextProcessor text={text} onTextChange={handleTextChange} />
            <ControlPanel
              onProcess={handleProcess}
              onProcessAndPlay={handleProcessAndPlay}
              onPlay={handlePlay}
              onStop={stop}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StrudelEditor />
            <RadioOptions
              isHushMode={isHushMode}
              onModeChange={handleModeChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
