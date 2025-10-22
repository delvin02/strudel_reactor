import { Textarea } from "./ui/textarea";

export function PreprocessView({ text, onTextChange, pattern, bass }) {
  // create the text with current pattern and bass values
  const createTextWithValues = () => {
    let processedText = text;
    
    // replace values 
    processedText = processedText.replace(
      /const pattern = \d+/g,
      `const pattern = ${pattern}`
    );
    processedText = processedText.replace(
      /const bass = \d+/g,
      `const bass = ${bass}`
    );
    
    return processedText;
  };

  // handle text changes
  const handleTextChange = (newText) => {
    const patternMatch = newText.match(/const pattern = (\d+)/);
    const bassMatch = newText.match(/const bass = (\d+)/);
    
    // whenever pattern changes, update in the orginal text
    if (patternMatch) {
      const newPattern = parseInt(patternMatch[1]);
      if (newPattern !== pattern) {
        const updatedText = text.replace(
          /const pattern = \d+/g,
          `const pattern = ${newPattern}`
        );
        onTextChange(updatedText);
        return;
      }
    }
    
    if (bassMatch) {
      const newBass = parseInt(bassMatch[1]);
      if (newBass !== bass) {
        // update the bass in the original text
        const updatedText = text.replace(
          /const bass = \d+/g,
          `const bass = ${newBass}`
        );
        onTextChange(updatedText);
        return;
      }
    }
    
    // if no pattern/bass changes, update normally
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
          value={createTextWithValues()}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </div>
    </div>
  );
}
