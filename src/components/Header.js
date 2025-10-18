import { Badge } from "./ui/badge";

export function Header({ isHushMode, isPlaying }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold">Strudel Demo</h2>
      <div className="flex items-center gap-2">
        <Badge variant={isHushMode ? "destructive" : "outline"}>
          {isHushMode ? "HUSH Mode" : "ON Mode"}
        </Badge>
        {
          <Badge
            variant={isPlaying ? "default" : "destructive"}
            className={isPlaying ? "animate-pulse" : ""}
          >
            {isPlaying ? "Playing" : "Stop"}
          </Badge>
        }
      </div>
    </div>
  );
}
