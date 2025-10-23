import { Card, CardContent } from "./ui/card";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export function ConsoleLogView({ logs }) {
  const scrollAreaRef = useRef(null);
  const lastLogRef = useRef(null);

  // auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollToBottom = () => {
        if (scrollAreaRef.current) {
          // Scroll o last element if it exists
          if (lastLogRef.current) {
            lastLogRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }
        }
      };

      // try immediately
      scrollToBottom();

      // try with slight delays
      const timeoutId = setTimeout(scrollToBottom, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [logs.length]);

  const downloadLogs = () => {
    const logText = logs
      .map(
        (log) => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`,
      )
      .join("\n");

    // pipe logtext to blob
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strudel-console-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`;

    // add into DOM body child element
    document.body.appendChild(a);
    // click to stimulate download
    a.click();

    // once down, remove
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-foreground";
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📝";
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center border-b border-border px-3 py-2 sm:px-4 sm:py-3">
        <h2 className="text-sm font-semibold">Console Log</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <CardContent className="flex-1 p-0">
        <div ref={scrollAreaRef} className="h-full px-4 pb-4 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>No console output yet...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  ref={index === logs.length - 1 ? lastLogRef : null}
                  className="flex items-start gap-2 py-1 px-2 rounded text-sm font-mono"
                >
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex-shrink-0">
                    {getLogTypeIcon(log.type)}
                  </span>
                  <span className={`flex-1 ${getLogTypeColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
