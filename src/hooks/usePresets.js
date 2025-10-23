import { useState, useCallback } from "react";
import { toast } from "sonner";

// "Amensister"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos
const DEFAULT_PRESET = {
  pattern: 2,
  bass: 3,
  text: `const pattern = 2;
const bass = 3;

samples('github:tidalcycles/dirt-samples')

stack(
  // amen
  n("0 1 2 3 4 5 6 7")
  .sometimes(x=>x.ply(2))
  .rarely(x=>x.speed("2 | -2"))
  .sometimesBy(.4, x=>x.delay(".5"))
  .s("amencutup")
  .slow(2)
  .room(.5)
  ,
  // bass
  sine.add(saw.slow(4)).range(0,7).segment(8)
  .superimpose(x=>x.add(.1))
  .scale('G0 minor').note()
  .s("sawtooth")
  .gain(.4).decay(.1).sustain(0)
  .lpa(.1).lpenv(-4).lpq(10)
  .cutoff(perlin.range(300,3000).slow(8))
  .degradeBy("0 0.1 .5 .1")
  .rarely(add(note("12")))
  ,
  // chord
  note("Bb3,D4".superimpose(x=>x.add(.2)))
  .s('sawtooth').lpf(1000).struct("<~@3 [~ x]>")
  .decay(.05).sustain(.0).delay(.8).delaytime(.125).room(.8)
  ,
  // alien
  s("breath").room(1).shape(.6).chop(16).rev().mask("<x ~@7>")
  ,
  n("0 1").s("east").delay(.5).degradeBy(.8).speed(rand.range(.5,1.5))
).reset("<x@7 x(5,8,-1)>")`,
  timestamp: 0,
};

export function usePresets() {
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem("strudel-presets");
    const parsedPresets = saved ? JSON.parse(saved) : {};
    
    // Add default preset if it doesn't exist
    if (!parsedPresets["Amensister"]) {
      const updatedPresets = {
        ...parsedPresets,
        "Amensister": DEFAULT_PRESET,
      };
      localStorage.setItem("strudel-presets", JSON.stringify(updatedPresets));
      return updatedPresets;
    }
    
    return parsedPresets;
  });
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const savePreset = useCallback(
    (getCurrentState) => {
      if (!presetName.trim()) return;

      const { pattern, bass, text } = getCurrentState();
      const newPreset = {
        pattern,
        bass,
        text,
        timestamp: Date.now(),
      };

      const updatedPresets = {
        ...presets,
        [presetName]: newPreset,
      };

      setPresets(updatedPresets);
      localStorage.setItem("strudel-presets", JSON.stringify(updatedPresets));
      setPresetName("");
      setShowPresetInput(false);
      toast.success(`Preset "${presetName}" saved`);
    },
    [presetName, presets],
  );

  const loadPreset = useCallback(
    (presetKey, onLoad) => {
      const preset = presets[presetKey];
      if (preset && onLoad) {
        onLoad(preset);
      }
    },
    [presets],
  );

  const deletePreset = useCallback(
    (presetKey) => {
      const updatedPresets = { ...presets };
      delete updatedPresets[presetKey];
      setPresets(updatedPresets);
      localStorage.setItem("strudel-presets", JSON.stringify(updatedPresets));
      toast.success(`Preset "${presetKey}" deleted`);
    },
    [presets],
  );

  return {
    presets,
    presetName,
    showPresetInput,
    setPresetName,
    setShowPresetInput,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
