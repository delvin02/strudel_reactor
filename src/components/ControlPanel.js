import { ChartColumn, Play, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export function ControlPanel({
  onPlay,
  onStop,
  isPlaying,
  cpm,
  volume,
  onCpmChange,
  onVolumeChange,
  showBarGraph,
  setShowBarGraph,
}) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="flex flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-center">
          <Button
            variant={showBarGraph ? "destructive" : "outline"}
            size="sm"
            onClick={() => setShowBarGraph(!showBarGraph)}
          >
            <ChartColumn className="h-4 w-4" />
            {showBarGraph ? "Hide " : "Show "}
            Bar Graph
          </Button>
        </div>
        {/* CPM and Volume Controls */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col gap-2 min-w-32">
            <Label className="text-sm font-medium text-center">
              CPM
            </Label>
            <input
              type="text"
              value={cpm}
              onChange={(e) => onCpmChange(e.target.value)}
              className="w-full px-2 py-1 text-sm rounded border border-border bg-background text-foreground text-center"
              placeholder="140/60/4"
            />
          </div>

          <div className="flex flex-col gap-2 min-w-32">
            <Label className="text-sm font-medium text-center">
              Volume: {volume.toFixed(2)}
            </Label>
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0])}
              max={1}
              min={0}
              step={0.01}
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
