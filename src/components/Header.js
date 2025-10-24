import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Save, FolderOpen, Trash2, Settings, Terminal } from "lucide-react";
import { useState } from "react";
import { usePresets } from "../hooks/usePresets";

export function Header({
  isHushMode,
  isPlaying,
  onModeChange,
  onPresetLoad,
  getCurrentState,
  showConsoleView,
  setConsoleView,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    presets,
    presetName,
    setPresetName,
    savePreset,
    loadPreset,
    deletePreset,
  } = usePresets();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-3xl font-bold">Strudel Demo</h2>
        <Badge
          variant={isPlaying ? "default" : "outline"}
          className={`font-sans uppercase ${isPlaying ? "animate-pulse" : ""}`}
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

        {/* Preset Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Presets
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Presets</DialogTitle>
              <DialogDescription>
                Save & load your custom strudel
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="save" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="save">Save Preset</TabsTrigger>
                <TabsTrigger value="load">Load Preset</TabsTrigger>
              </TabsList>

              <TabsContent value="save" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <div className="flex gap-2">
                    <input
                      id="preset-name"
                      type="text"
                      placeholder="Enter preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border rounded-md bg-background text-foreground"
                      onKeyPress={(e) =>
                        e.key === "Enter" && savePreset(getCurrentState)
                      }
                    />
                    <Button
                      onClick={() => savePreset(getCurrentState)}
                      disabled={!presetName.trim()}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="load" className="space-y-4">
                {Object.keys(presets).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No presets saved yet
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(presets).map(([name, preset]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            onClick={() => {
                              loadPreset(name, onPresetLoad);
                              setIsDialogOpen(false);
                            }}
                            variant="ghost"
                            className="text-left justify-start flex-1 h-auto p-0"
                          >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">
                                Pattern: {preset.pattern} | Bass: {preset.bass}
                              </div>
                            </div>
                          </Button>
                        </div>
                        <Button
                          onClick={() => deletePreset(name)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        <Button
          variant={showConsoleView ? "destructive" : "outline"}
          size="sm"
          onClick={() => setConsoleView(!showConsoleView)}
        >
          <Terminal className="h-4 w-4" />
          {showConsoleView ? "Hide " : "Show "}
          Console
        </Button>
      </div>
    </header>
  );
}
