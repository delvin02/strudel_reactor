import { useState } from "react";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";

export function PreprocessView({
  text,
  onTextChange,
  onCpmChange,
  onVolumeChange,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // check if object matches preset format type from usePresets.js
  // mainly: cpm, volume, text, timestamp (at least text, cpm, or volume)
  const isPresetFormat = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return false;
    }
    // object has: cpm, volume, text, timestamp (at least text, cpm, or volume)
    return (
      obj.hasOwnProperty("text") ||
      obj.hasOwnProperty("cpm") ||
      obj.hasOwnProperty("volume")
    );
  };

  // convert preset json to Strudel code
  const convertPresetToCode = (jsonData) => {
    // check if it's object with preset names as keys
    const keys = Object.keys(jsonData);
    if (
      keys.length > 0 &&
      jsonData[keys[0]] &&
      isPresetFormat(jsonData[keys[0]])
    ) {
      // collection of presets - extract all text fields
      return keys
        .map((presetName) => {
          const preset = jsonData[presetName];
          if (preset && preset.text) {
            const cpmInfo = preset.cpm ? ` (CPM: ${preset.cpm})` : "";
            const volumeInfo = preset.volume
              ? ` (Volume: ${preset.volume})`
              : "";
            return `// Preset: ${presetName}${cpmInfo}${volumeInfo}\n${preset.text}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n\n");
    }

    // single preset object
    if (isPresetFormat(jsonData)) {
      if (jsonData.text) {
        // edge case: if CPM is set but not in text, add it
        let result = jsonData.text;
        if (
          jsonData.cpm &&
          !result.includes("setcpm") &&
          !result.includes("setcps")
        ) {
          result = `setcpm(${jsonData.cpm})\n\n${result}`;
        }
        return result;
      }
      return null;
    }

    return null;
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");

    // if string, just return - let the set code handle it
    const trimmed = pastedText.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return;
    }

    // try parse as JSON
    try {
      const jsonData = JSON.parse(pastedText);
      const converted = convertPresetToCode(jsonData);

      // only process if it's a preset format
      if (converted) {
        e.preventDefault();

        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // extract CPM and volume from presets
        const keys = Object.keys(jsonData);

        // check if it's a collection of presets or a single preset
        if (
          keys.length > 0 &&
          jsonData[keys[0]] &&
          isPresetFormat(jsonData[keys[0]])
        ) {
          const firstPreset = jsonData[keys[0]];
          if (firstPreset.cpm !== undefined && onCpmChange) {
            onCpmChange(firstPreset.cpm);
          }
          if (firstPreset.volume !== undefined && onVolumeChange) {
            onVolumeChange(firstPreset.volume);
          }
        } else if (isPresetFormat(jsonData)) {
          // Single preset object - update CPM and volume
          if (jsonData.cpm !== undefined && onCpmChange) {
            onCpmChange(jsonData.cpm);
          }
          if (jsonData.volume !== undefined && onVolumeChange) {
            onVolumeChange(jsonData.volume);
          }
        }

        // insert converted code at cursor position
        const newText =
          text.substring(0, start) + converted + text.substring(end);
        onTextChange(newText);

        // focus after inserted text
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + converted.length;
          textarea.focus();
        }, 0);
      }
    } catch (error) {
      // not a valid json, let the default paste behavior happen
      return;
    }
  };

  // handle text changes
  const handleTextChange = (newText) => {
    // If user manually edited CPM value to something other than the delimiter, restore the delimiter
    // This ensures the view always shows delimiters instead of actual values
    const cpmMatch = newText.match(/setcpm\(([^)]+)\)/);
    if (cpmMatch) {
      const foundCpm = cpmMatch[1];
      // If it's not the delimiter, restore it
      if (foundCpm !== "{CPM}") {
        const updatedText = newText.replace(
          /setcpm\([^)]+\)/g,
          `setcpm({CPM})`,
        );
        onTextChange(updatedText);
        return;
      }
    }

    // Update the text normally (preserving delimiters)
    onTextChange(newText);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Text to preprocess</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">How to paste presets</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>How to Paste Presets</DialogTitle>
              <DialogDescription>
                Learn how to paste preset JSON data into the code editor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold mb-2">What is a Preset?</h3>
                <p className="text-sm text-muted-foreground">
                  A preset is a JSON object containing your Strudel code with
                  settings like CPM (cycles per minute), volume, and the code
                  text.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Preset Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A preset should match this format:
                </p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "cpm": "142/4",
  "volume": 0.7,
  "text": "s(\\"bd hh sd hh\\")\\n  .gain({VOLUME})\\n  .log()",
  "timestamp": 0
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Step-by-Step Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Convert JavaScript Objects to JSON:</strong> If you
                    have a JavaScript object with single quotes or other syntax,{" "}
                    <strong className="text-foreground">
                      you must convert it to valid JSON first
                    </strong>{" "}
                    using the{" "}
                    <a
                      href="https://www.convertsimple.com/convert-javascript-to-json/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      ConvertSimple JavaScript to JSON Converter
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Copy your preset JSON</strong> (or collection of
                    presets) - must be valid JSON format
                  </li>
                  <li>
                    <strong>Paste it into this text area</strong> - The
                    converter will automatically extract the code and insert it
                    into the editor
                  </li>
                  <li>
                    <strong>Plain strings paste normally</strong> - If you paste
                    regular Strudel code (not JSON), it will paste as-is
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Example Preset JSON</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "cpm": "142/4",
  "volume": 0.7,
  "text": "setcpm({CPM})\\n\\ns(\\"bd hh sd hh\\")\\n  .gain({VOLUME})\\n  .log()",
  "timestamp": 0
}`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-sm">
                  <strong>Important:</strong> Only valid JSON format will be
                  accepted. If you have JavaScript objects with single quotes,
                  missing commas, or other syntax issues,{" "}
                  <strong>you must convert them first</strong> using the{" "}
                  <a
                    href="https://www.convertsimple.com/convert-javascript-to-json/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    ConvertSimple JavaScript to JSON Converter
                  </a>{" "}
                  before pasting.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Textarea
          id="text-processor"
          placeholder="Enter your Strudel code here... (Paste preset JSON to auto-convert)"
          className="h-full resize-none text-[18px] border-none p-0"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
}
