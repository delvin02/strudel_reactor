import { Textarea } from "./ui/textarea";

export function PreprocessView({ text, onTextChange, cpm, volume }) {
  // handle text changes
  const handleTextChange = (newText) => {
    // If user manually edited CPM value to something other than the delimiter, restore the delimiter
    // This ensures the view always shows delimiters instead of actual values
    const cpmMatch = newText.match(/setcpm\(([^)]+)\)/);
    if (cpmMatch) {
      const foundCpm = cpmMatch[1];
      // If it's not the delimiter, restore it
      if (foundCpm !== "{CPM}") {
        const updatedText = newText.replace(/setcpm\([^)]+\)/g, `setcpm({CPM})`);
        onTextChange(updatedText);
        return;
      }
    }
    
    // Update the text normally (preserving delimiters)
    onTextChange(newText);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2 sm:px-4 sm:py-3">
        <h2 className="text-sm font-semibold">Text to preprocess</h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Textarea
          id="text-processor"
          placeholder="Enter your Strudel code here..."
          className="h-full resize-none text-[18px] border-none p-0"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </div>
    </div>
  );
}
