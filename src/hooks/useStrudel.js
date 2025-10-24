import { useEffect, useRef, useState, useCallback } from "react";
import { StrudelMirror } from "@strudel/codemirror";
import { evalScope } from "@strudel/core";
import { initAudioOnFirstClick } from "@strudel/webaudio";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
} from "@strudel/webaudio";
import { registerSoundfonts } from "@strudel/soundfonts";
import console_monkey_patch from "../console-monkey-patch";

export function useStrudel() {
  const [editor, setEditor] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      (async () => {
        console_monkey_patch();
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

  const play = useCallback(async () => {
    if (editor) {
      try {
        console.log("evaluate");
        await editor.evaluate();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing Strudel code:", error);
        setIsPlaying(false);
      }
    }
  }, [editor]);

  const stop = useCallback(() => {
    if (editor) {
      editor.stop();
      setIsPlaying(false);
    }
  }, [editor]);

  const setCode = useCallback(
    (code) => {
      if (editor) editor.setCode(code);
    },
    [editor],
  );

  const restartPlayback = useCallback(
    (wasPlaying = false) => {
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
    },
    [editor],
  );


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
