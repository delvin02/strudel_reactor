import "./cors-redirect";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { stranger_tune } from "./tunes";
import { useStrudel } from "./hooks/useStrudel";
import { useTextProcessor } from "./hooks/useTextProcessor";
import { ControlPanel } from "./components/ControlPanel";
import { StrudelEditor } from "./components/StrudelEditor";
import { Header } from "./components/Header";
import { PreprocessView } from "./components/PreprocessView";
import { ConsoleLogView } from "./components/ConsoleLogView";
import BarGraphPanel from "./components/BarGraphPanel";

const MAX_LOGS = 20;

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

  const [cpm, setCpm] = useState("140/60/4");
  const [volume, setVolume] = useState(1);
  const [showConsoleView, setConsoleView] = useState(true);
  const [showBarGraph, setShowBarGraph] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const throttleRef = useRef(null);
  const logBatchRef = useRef([]);

  useEffect(() => {
    if (isInitialized && !text) {
      console.log("setting text to stranger_tune");
      handleTextChange(stranger_tune);
    }
  }, [isInitialized, text, handleTextChange]);

  useEffect(() => {
    if (isInitialized && text) {
      const processedText = processText(text, cpm, volume);
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
    cpm,
    volume,
    restartPlayback,
    isPlaying,
  ]);

  const handlePlay = async () => {
    try {
      // pre-process first
      const processedText = processText(text, cpm, volume);
      // set the processed code
      setCode(processedText);

      // then play
      await play();
    } catch (error) {
      console.error("Error in handlePlay:", error);
      toast.error(`Playback error: ${error.message || "Unknown error occurred"}`);
    }
  };

  const handleModeChange = (hushMode) => {
    handleHushModeChange(hushMode);
  };

  const handlePresetLoad = (preset) => {
    const newCpm = preset.cpm !== undefined ? preset.cpm : cpm;
    const newVolume = preset.volume !== undefined ? preset.volume : volume;

    // update state
    if (preset.cpm !== undefined) setCpm(preset.cpm);
    if (preset.volume !== undefined) setVolume(preset.volume);

    // update text
    handleTextChange(preset.text);

    // process text immediately with the preset's CPM and volume
    const processedText = processText(preset.text, newCpm, newVolume);
    setCode(processedText);

    // If playing, restart with new code
    if (isPlaying) {
      setTimeout(() => {
        restartPlayback(true);
      }, 100);
    }
  };

  const getCurrentState = () => ({
    cpm,
    volume,
    text,
  });

  // batch console logs
  const addConsoleLogThrottled = (message, type = "log") => {
    logBatchRef.current.push({
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: Date.now(),
    });

    // clear existing timeout
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    // set new timeout to process batch
    // reduced throttle to 100ms for better responsiveness
    throttleRef.current = setTimeout(() => {
      if (logBatchRef.current.length > 0) {
        setConsoleLogs((prev) => {
          const updated = [...prev, ...logBatchRef.current];
          return updated.length > MAX_LOGS ? updated.slice(-MAX_LOGS) : updated;
        });
        // clear batch
        logBatchRef.current = [];
      }
    }, 100);
  };

  // capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // only capture logs when playing
    console.log = (...args) => {
      originalLog(...args);
      if (isPlaying) {
        addConsoleLogThrottled(args.join(" "), "log");
      }
    };

    // always capture errors
    console.error = (...args) => {
      originalError(...args);
      addConsoleLogThrottled(args.join(" "), "error");
      // Show toast error when playing
      if (isPlaying) {
        const errorMessage = args.join(" ");
        toast.error(`Console error: ${errorMessage}`);
      }
    };

    // always capture warnings
    console.warn = (...args) => {
      originalWarn(...args);
      addConsoleLogThrottled(args.join(" "), "warn");
    };

    console.info = (...args) => {
      originalInfo(...args);
      // only capture info when playing
      if (isPlaying) {
        addConsoleLogThrottled(args.join(" "), "info");
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;

      // cleanup throttle
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
      <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3 lg:flex-row lg:gap-4 lg:p-4">
        <div className="flex flex-1 flex-col gap-3 md:flex-row min-w-0">
          <PreprocessView
            text={text}
            onTextChange={handleTextChange}
            onCpmChange={setCpm}
            onVolumeChange={setVolume}
          />
          <StrudelEditor />
        </div>
        {showConsoleView && (
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-shrink-0">
            <div className="h-64 md:h-80 lg:h-full lg:w-80">
              <ConsoleLogView logs={consoleLogs} />
            </div>
          </div>
        )}
      </main>
      {showBarGraph && <BarGraphPanel isPlaying={isPlaying} />}

      <ControlPanel
        onPlay={handlePlay}
        onStop={stop}
        isPlaying={isPlaying}
        cpm={cpm}
        volume={volume}
        onCpmChange={setCpm}
        onVolumeChange={setVolume}
        showBarGraph={showBarGraph}
        setShowBarGraph={setShowBarGraph}
      />
    </div>
  );
}
