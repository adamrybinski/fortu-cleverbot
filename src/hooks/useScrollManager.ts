
import { useState, useRef, useEffect, useCallback } from 'react';

export const useScrollManager = () => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);
  
  // Smart scroll detection - check if user is at bottom
  const handleScroll = useCallback(() => {
    if (!messagesRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const threshold = 100; // pixels from bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setIsAtBottom(isNearBottom);
  }, []);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    const scrollAnchor = document.getElementById('scroll-anchor');
    if (scrollAnchor) {
      scrollAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const messagesContainer = messagesRef.current;
    if (!messagesContainer) return;

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    isAtBottom,
    messagesRef,
    handleScroll,
    scrollToBottom
  };
};
