import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function TextProcessor({ text, onTextChange, label = "Text to preprocess:" }) {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="text-processor" className="sr-only">
              {label}
            </Label>
            <Textarea
              id="text-processor"
              placeholder="Enter your Strudel code here..."
              className="min-h-[300px] resize-none font-mono text-sm"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
