import { useState, useCallback } from "react";
import { toast } from "sonner";

// "The Rhythm Of The Night" - Work In Progress
// song @by Corona
// script @by eeefano
const DEFAULT_PRESET = {
cpm: "128/4",
  volume: 1.0,
  text: `// "The Rhythm Of The Night" - Work In Progress
  // song @by Corona
  // script @by eeefano
  setDefaultVoicings('legacy')
  const as = register('as', (mapping, pat) => { mapping = Array.isArray(mapping) ? mapping : [mapping];
    return pat.fmap((v) => { v = Array.isArray(v) ? v : [v, 0];
      return Object.fromEntries(mapping.map((prop, i) => [prop, v[i]])); }); });

  const crdpart = "<~ 0@10 1@24 0@19>".pickRestart(
  ["Ab Cm Bb F@2".slow(5)
  ,"Bb@3 Ab@3 Cm@2".slow(8)
  ]);
  stack
  ("<0 1@4 0 1@4 ~@8 2 3@7 2 3@7 0 1@4 0 1@4 0 1@4 0 1@4>".pickRestart(
    ["~ [4@3 ~]!3 7:5 6 4 3"
    ,"2:-1 0:-2 ~@4 6:1 4:-1 6 4:2 ~@4 [4:2 3]@3 ~@6 4 7:5 6 [4@2 ~] [3:-1 2@3]@2 0 ~@2".slow(4)
    ,"~@6 [6 ~]!2"
    ,"6 5@0.5 [5 ~] [4 ~]!2 [3 ~] 3:2@1.5 ~@7 6@2 6:2 [5 ~ ]!2 4 3@2 4 2 0:-2 ~@7 [0 2]@3 3@2 4 6:4 4:-4 ~ 0 2 0 4 ~ 0 0:2@2 ~@7".slow(7)
  ]).as("n:penv").scale("c4:minor").patt("0.07").s("gm_lead_1_square").room(0.4).delay(0.3).dfb(0.35).dt(60/128).gain(0.85)

  ,crdpart.chord().anchor("F4").voicing().s("gm_synth_strings_1").color("blue").gain(0.4)

  ,"<~@11 1@23 ~ 0@19>".pickRestart(
    ["2 ~@2 2 ~@2 2 ~@3 2 ~@3 2 ~"
    ,"[2 ~@2 2 ~@2 2 ~]!2"
  ]).n().chord(crdpart).anchor(crdpart.rootNotes(2)).voicing().s("gm_synth_bass_1").lpf(1500).room(0.5).color("green").gain(0.9)

  ,"<~@11 1@8 ~@16 0@19>".pickRestart(
    ["<5 7 6 3!2> ~ 9 ~ 10 ~ ~ 12 ~ 11 ~ 10 ~ 11 9 ~"
    ,"<6!3 5!3 7!2> ~ 9 ~ 10 ~ ~ 12 ~ 11 ~ 10 ~ 11 9 ~"
  ]).scale("c3:minor").note().s("gm_lead_2_sawtooth").room(0.3).delay(0.3).dfb(0.5).dt(60/128*2).color("red").gain(0.6)

  ,"<[2,3] ~@10 0@6 [0,1]@2 [0,2] 0@5 [0,1]@2 [0,2] 0@6 [2,3] 0@8 [0,1]@2 [0,2] 0@8>".pickRestart(
   [stack(s("bd*4").gain(0.8),s("[~ oh]*4").gain(0.14),s("hh*16").gain(0.09),s("[~ cp]*2").gain(0.4))
   ,s("[~ sd!3]!4 [sd*4]!4").slow(2).gain(run(32).slow(2).mul(1/31).add(0.1).mul(0.4))
   ,s("cr").gain(0.2)
   ,s("bd").gain(0.8)
   ]).bank("RolandTR909").room(0.2).color("yellow").velocity(1).log()

  ).cpm({CPM}).gain({VOLUME}).log()
  // @version 1.2`,
  timestamp: 0,
};

const DELVIN_PRESET = {
  cpm: "142/4",
  volume: 0.7,
  text: `setcpm({CPM})

var euroDrums = stack(s("rolandtr909_bd").struct("[x - - -][x - - -][x - - -][x - x -]"),
                      s("rolandtr909_oh").struct("[- - x -][- - x -][- - x -][- - x -]"),
                      s("rolandtr909_hh").struct("[x x - -][x x - -][x x - -][x x - -]"))

var chordProgression = stack(n("[0 1 2 3][2 3 1 0]").legato(\`.75 .3 .25 1\`).room(0.4).chord(\`<C G Am F>\`).s("gm_accordion").voicing(),
                             chord(\`<C G Am F>\`).s("gm_pad_metallic").room(2).voicing().gain(0.15)).log()

$: arrange([1*4, stack(euroDrums.gain(0.6), chordProgression)]).log()

all(x => x.gain({VOLUME}))`,
  timestamp: 0,
};

export function usePresets() {
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem("strudel-presets");
    const parsedPresets = saved ? JSON.parse(saved) : {};

    const updatedPresets = { ...parsedPresets };

    // Add default preset if it doesn't exist
    if (!parsedPresets["The Rhythm Of The Night"]) {
      updatedPresets.TheRhythmOfTheNight = DEFAULT_PRESET;
    }

    // Add Delvin preset if it doesn't exist
    if (!parsedPresets["Delvin"]) {
      updatedPresets.Delvin = DELVIN_PRESET;
    }

    if (Object.keys(updatedPresets).length > Object.keys(parsedPresets).length) {
      localStorage.setItem("strudel-presets", JSON.stringify(updatedPresets));
    }

    return updatedPresets;
  });
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const savePreset = useCallback(
    (getCurrentState) => {
      if (!presetName.trim()) return;

      const { cpm, volume, text } = getCurrentState();
      const newPreset = {
        cpm,
        volume,
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
