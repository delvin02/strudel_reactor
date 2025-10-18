import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function RadioOptions({ isHushMode, onModeChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Processing Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={isHushMode ? "hush" : "on"} 
          onValueChange={(value) => onModeChange(value === "hush")}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="on" id="p1-on" />
            <Label htmlFor="p1-on" className="text-sm font-medium">
              p1: ON
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hush" id="p1-hush" />
            <Label htmlFor="p1-hush" className="text-sm font-medium">
              p1: HUSH
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
