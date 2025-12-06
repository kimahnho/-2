
import { useState, useEffect } from 'react';
import { CharacterProfile, EmotionCard } from '../types';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCharacters = () => {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('muru_characters');
    if (saved) {
      try {
        setCharacters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load characters from local storage", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('muru_characters', JSON.stringify(characters));
  }, [characters]);

  const addCharacter = (name: string, description: string, style: 'character' | 'realistic' | 'emoji', baseImageUrl?: string) => {
    const newChar: CharacterProfile = {
      id: generateId(),
      name,
      description,
      style,
      baseImageUrl,
      emotions: []
    };
    setCharacters(prev => [...prev, newChar]);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const addEmotionToCharacter = (charId: string, label: string, imageUrl: string) => {
    const newEmotion: EmotionCard = {
      id: generateId(),
      label,
      imageUrl,
      createdAt: Date.now()
    };
    
    setCharacters(prev => prev.map(char => {
      if (char.id === charId) {
        return { ...char, emotions: [newEmotion, ...char.emotions] };
      }
      return char;
    }));
  };

  const deleteEmotionFromCharacter = (charId: string, emotionId: string) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === charId) {
        return { ...char, emotions: char.emotions.filter(e => e.id !== emotionId) };
      }
      return char;
    }));
  };

  const updateEmotionLabel = (charId: string, emotionId: string, newLabel: string) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === charId) {
        return { 
          ...char, 
          emotions: char.emotions.map(e => e.id === emotionId ? { ...e, label: newLabel } : e) 
        };
      }
      return char;
    }));
  };

  return {
    characters,
    addCharacter,
    deleteCharacter,
    addEmotionToCharacter,
    deleteEmotionFromCharacter,
    updateEmotionLabel
  };
};
