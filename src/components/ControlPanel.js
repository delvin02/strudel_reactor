import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function ControlPanel({ onProcess, onProcessAndPlay, onPlay, onStop }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            onClick={onProcess} 
            variant="outline" 
            className="w-full"
          >
            Preprocess
          </Button>
          <Button 
            onClick={onProcessAndPlay} 
            variant="outline" 
            className="w-full"
          >
            Proc & Play
          </Button>
          <Button 
            onClick={onPlay} 
            variant="default" 
            className="w-full"
          >
            Play
          </Button>
          <Button 
            onClick={onStop} 
            variant="destructive" 
            className="w-full"
          >
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
