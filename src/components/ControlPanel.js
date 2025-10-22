import { Play, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export function ControlPanel({
  onProcess,
  onProcessAndPlay,
  onPlay,
  onStop,
  isPlaying,
  pattern,
  bass,
  onPatternChange,
  onBassChange,
}) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="flex flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4">
        {/* Pattern and Bass Controls */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col gap-2 min-w-32">
            <Label className="text-sm font-medium text-center">
              Pattern: {pattern}
            </Label>
            <Slider
              value={[pattern]}
              onValueChange={(value) => onPatternChange(value[0])}
              max={2}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col gap-2 min-w-32">
            <Label className="text-sm font-medium text-center">
              Bass: {bass}
            </Label>
            <Slider
              value={[bass]}
              onValueChange={(value) => onBassChange(value[0])}
              max={1}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Play/Stop Button */}
        <div className="flex items-center justify-center">
          {isPlaying ? (
            <Button
              onClick={onStop}
              size="lg"
              variant="destructive"
              className="min-w-24 gap-2 sm:min-w-32 sm:text-base"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={onPlay}
              size="lg"
              className="min-w-24 gap-2 sm:min-w-32 sm:text-base"
            >
              <Play className="h-4 w-4" />
              Play
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
