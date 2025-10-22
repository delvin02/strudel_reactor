import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export function Header({ isHushMode, isPlaying, onModeChange }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-3xl font-bold">Strudel Demo</h2>
        <Badge
          variant={isPlaying ? "default" : "outline"}
          className={isPlaying ? "animate-pulse" : ""}
        >
          {isPlaying ? "Playing" : "Idle"}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <RadioGroup
          value={isHushMode ? "hush" : "on"}
          onValueChange={(value) => onModeChange(value === "hush")}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="on" id="p1-on" />
            <Label htmlFor="p1-on" className="text-sm font-medium">
              p1: ON
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="hush" id="p1-hush" />
            <Label htmlFor="p1-hush" className="text-sm font-medium">
              p1: HUSH
            </Label>
          </div>
        </RadioGroup>
      </div>
    </header>
  );
}
