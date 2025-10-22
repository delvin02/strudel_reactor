import "./cors-redirect";
import { useEffect } from "react";
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

  const handlePlay = async () => {
    // pre-process first
    const processedText = processText(text);
    // set the processed code
    setCode(processedText);

    // then play
    await play();
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
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Header
        isHushMode={isHushMode}
        isPlaying={isPlaying}
        onModeChange={handleModeChange}
      />
      <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-4 md:p-4">
        <PreprocessView text={text} onTextChange={handleTextChange} />
        <StrudelEditor />
      </main>

      <ControlPanel
        onProcess={handleProcess}
        onProcessAndPlay={handleProcessAndPlay}
        onPlay={handlePlay}
        onStop={stop}
        isPlaying={isPlaying}
      />
    </div>
  );
}
