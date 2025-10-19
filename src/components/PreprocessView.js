import { Textarea } from "./ui/textarea";

export function PreprocessView({ text, onTextChange }) {
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
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>
    </div>
  );
}
