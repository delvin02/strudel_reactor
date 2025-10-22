import { useState, useCallback } from "react";

export function useTextProcessor() {
  const [text, setText] = useState("");
  const [isHushMode, setIsHushMode] = useState(false);

  const processText = useCallback(
    (inputText, pattern = 0, bass = 0) => {
      let processedText = inputText.replaceAll("<p1_Radio>", () => {
        return isHushMode ? "_" : "";
      });
      
      // replace pattern and bass values
      processedText = processedText.replace(/const pattern = \d+/g, `const pattern = ${pattern}`);
      processedText = processedText.replace(/const bass = \d+/g, `const bass = ${bass}`);
      
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
