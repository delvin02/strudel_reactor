import { useState, useCallback } from "react";

export function useTextProcessor() {
  const [text, setText] = useState("");
  const [isHushMode, setIsHushMode] = useState(false);

  const processText = useCallback(
    (inputText) => {
      const processedText = inputText.replaceAll("<p1_Radio>", () => {
        return isHushMode ? "_" : "";
      });
      return processedText;
    },
    [isHushMode],
  );

  const handleTextChange = (newText) => {
    setText(newText);
  };

  const handleHushModeChange = (hushMode) => {
    setIsHushMode(hushMode);
  };

  return {
    text,
    isHushMode,
    processText,
    handleTextChange,
    handleHushModeChange,
  };
}
