import { useEffect, useRef, useState } from "react";
import {
  initStrudel,
  evalScope,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
  initAudioOnFirstClick,
  transpiler,
} from "@strudel/web";
import { StrudelMirror } from "@strudel/codemirror";
import { registerSoundfonts } from "@strudel/soundfonts";

export function useStrudel() {
  const [editor, setEditor] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      (async () => {
        await initStrudel();

        const strudelEditor = new StrudelMirror({
          defaultOutput: webaudioOutput,
          getTime: () => getAudioContext().currentTime,
          transpiler,
          root: document.getElementById("editor"),
          prebake: async () => {
            initAudioOnFirstClick();
            const loadModules = evalScope(
              import("@strudel/core"),
              import("@strudel/draw"),
              import("@strudel/mini"),
              import("@strudel/tonal"),
              import("@strudel/webaudio"),
            );
            await Promise.all([
              loadModules,
              registerSynthSounds(),
              registerSoundfonts(),
            ]);
          },
        });

        setEditor(strudelEditor);
        setIsInitialized(true);
      })();
    }
  }, []);

  const play = () => {
    if (editor) {
      try {
        editor.evaluate();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing Strudel code:", error);
        setIsPlaying(false);
      }
    }
  };

  const stop = () => {
    if (editor) {
      editor.stop();
      setIsPlaying(false);
    }
  };

  const setCode = (code) => {
    if (editor) editor.setCode(code);
  };

  const restartPlayback = (wasPlaying = false) => {
    if (editor) {
      try {
        // stop current playback if it was playing
        if (wasPlaying) {
          editor.stop();
        }
        // start new playback
        editor.evaluate();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error restarting Strudel code:", error);
        setIsPlaying(false);
      }
    }
  };

  return {
    editor,
    isInitialized,
    isPlaying,
    play,
    stop,
    setCode,
    restartPlayback,
  };
}
