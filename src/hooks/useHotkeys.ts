'use client';

import React, { useEffect } from 'react';

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export function useHotkeys(configs: HotkeyConfig[], deps: React.DependencyList = []) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const config of configs) {
        const { key, ctrl, cmd, shift, alt, callback, preventDefault = true } = config;
        
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatches = ctrl ? event.ctrlKey : !event.ctrlKey;
        const cmdMatches = cmd ? event.metaKey : !event.metaKey;
        const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
        const altMatches = alt ? event.altKey : !event.altKey;
        
        if (keyMatches && ctrlMatches && cmdMatches && shiftMatches && altMatches) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [configs, ...deps]);
}