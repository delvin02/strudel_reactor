import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function StrudelEditor({ className = "" }) {
  return (
    <div className={`lg:col-span-2 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            id="editor" 
            className="border border-input rounded-md min-h-[400px] bg-background" 
          />
        </CardContent>
      </Card>
    </div>
  );
}
