import { useState, useCallback } from "react";

export function useTextProcessor() {
  const [text, setText] = useState("");
  const [isHushMode, setIsHushMode] = useState(false);

  const processText = useCallback(
    (inputText, cpm = "142/4", volume = 1) => {
      let processedText = inputText.replaceAll("<p1_Radio>", () => {
        return isHushMode ? "_" : "";
      });
      
      // replace CPM delimiter with actual value
      processedText = processedText.replace(/\{CPM\}/g, cpm);
      
      // replace volume delimiter with actual value
      processedText = processedText.replace(/\{VOLUME\}/g, volume.toString());
      
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
