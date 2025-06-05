
import { useState, useRef } from 'react';

export const useChatUIState = () => {
  const [inputValue, setInputValue] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLength = useRef(0);
  const savedScrollPosition = useRef<number>(0);

  return {
    inputValue,
    setInputValue,
    isTransitioning,
    setIsTransitioning,
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollRef,
    messagesContainerRef,
    previousMessagesLength,
    savedScrollPosition,
  };
};
