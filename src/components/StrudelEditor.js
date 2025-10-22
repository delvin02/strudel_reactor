export function StrudelEditor() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2 sm:px-4 sm:py-3">
        <h2 className="text-sm font-semibold">Code Editor</h2>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <div
          id="editor"
          className="h-full resize-none border-0 bg-transparent font-mono text-xs leading-relaxed focus-visible:ring-0 sm:text-sm overflow-y-auto"
        />
      </div>
    </div>
  );
}
