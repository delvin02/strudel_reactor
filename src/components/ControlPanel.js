import { Play, Square } from "lucide-react";
import { Button } from "./ui/button";

export function ControlPanel({
  onProcess,
  onProcessAndPlay,
  onPlay,
  onStop,
  isPlaying,
}) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="flex items-center justify-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        {/* <Button onClick={onProcess} variant="outline" className="w-full">
          Preprocess
        </Button>
        <Button onClick={onProcessAndPlay} variant="outline" className="w-full">
          Proc & Play
        </Button>*/}
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
    </footer>
  );
}
