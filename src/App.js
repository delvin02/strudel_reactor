import "./cors-redirect";
import { useEffect, useState, useRef } from "react";
import { stranger_tune } from "./tunes";
import { useStrudel } from "./hooks/useStrudel";
import { useTextProcessor } from "./hooks/useTextProcessor";
import { ControlPanel } from "./components/ControlPanel";
import { StrudelEditor } from "./components/StrudelEditor";
import { Header } from "./components/Header";
import { PreprocessView } from "./components/PreprocessView";
import { ConsoleLogView } from "./components/ConsoleLogView";
import BarGraphPanel from "./components/BarGraphPanel";

const MAX_LOGS = 200;

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
  const [showConsoleView, setConsoleView] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const throttleRef = useRef(null);
  const logBatchRef = useRef([]);

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
  }, [
    isInitialized,
    text,
    isHushMode,
    processText,
    setCode,
    pattern,
    bass,
    restartPlayback,
    isPlaying,
  ]);

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

  const handlePresetLoad = (preset) => {
    setPattern(preset.pattern);
    setBass(preset.bass);
    handleTextChange(preset.text);
  };

  const getCurrentState = () => ({
    pattern,
    bass,
    text,
  });

  // Advanced throttled version that batches console logs
  const addConsoleLogThrottled = (message, type = "log") => {
    // Add to batch
    logBatchRef.current.push({
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: Date.now(),
    });

    // Clear existing timeout
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    // Set new timeout to process batch
    throttleRef.current = setTimeout(() => {
      if (logBatchRef.current.length > 0) {
        setConsoleLogs((prev) => {
          const updated = [...prev, ...logBatchRef.current];
          return updated.length > MAX_LOGS ? updated.slice(-MAX_LOGS) : updated;
        });
        logBatchRef.current = []; // Clear batch
      }
    }, 100); // Reduced throttle to 100ms for better responsiveness
  };

  // capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      originalLog(...args);
      // Only capture logs when playing
      if (isPlaying) {
        addConsoleLogThrottled(args.join(" "), "log");
      }
    };

    console.error = (...args) => {
      originalError(...args);
      // Always capture errors
      addConsoleLogThrottled(args.join(" "), "error");
    };

    console.warn = (...args) => {
      originalWarn(...args);
      // Always capture warnings
      addConsoleLogThrottled(args.join(" "), "warn");
    };

    console.info = (...args) => {
      originalInfo(...args);
      // Only capture info when playing
      if (isPlaying) {
        addConsoleLogThrottled(args.join(" "), "info");
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;

      // Cleanup throttle timeout and batch
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      logBatchRef.current = [];
    };
  }, [isPlaying]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        isHushMode={isHushMode}
        isPlaying={isPlaying}
        onModeChange={handleModeChange}
        onPresetLoad={handlePresetLoad}
        getCurrentState={getCurrentState}
        showConsoleView={showConsoleView}
        setConsoleView={setConsoleView}
      />
      <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-4 md:p-4">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <PreprocessView
            text={text}
            onTextChange={handleTextChange}
            pattern={pattern}
            bass={bass}
            onPatternChange={setPattern}
            onBassChange={setBass}
          />
          <StrudelEditor />
        </div>
        {showConsoleView && (
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="h-64 md:h-full md:w-80">
              <ConsoleLogView logs={consoleLogs} />
            </div>
          </div>
        )}
      </main>
      <BarGraphPanel isPlaying={isPlaying} />

      <ControlPanel
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
