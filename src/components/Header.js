import { Badge } from "./ui/badge";

export function Header({ isHushMode, isPlaying }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div class="flex items-center gap-2">
        <h2 className="text-3xl font-bold">Strudel Demo</h2>
        <Badge
          variant={isPlaying ? "default" : "outline"}
          className={isPlaying ? "animate-pulse" : ""}
        >
          {isPlaying ? "Playing" : "Idle"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isHushMode ? "destructive" : "outline"}>
          {isHushMode ? "HUSH Mode" : "ON Mode"}
        </Badge>
        {}
      </div>
    </header>
  );
}
