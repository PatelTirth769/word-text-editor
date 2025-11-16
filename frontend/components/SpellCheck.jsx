'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpellCheck } from 'react-icons/fa';

const SpellCheck = ({ editor, isOpen, onClose }) => {
  const [misspelledWords, setMisspelledWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  // Simple dictionary for basic spell checking
  const dictionary = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'shall', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
  ]);

  useEffect(() => {
    if (isOpen && editor) {
      checkSpelling();
    }
  }, [isOpen, editor]);

  const checkSpelling = () => {
    const text = editor.getText();
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const misspelled = [];

    words.forEach((word, index) => {
      if (word.length > 2 && !dictionary.has(word.toLowerCase())) {
        misspelled.push({
          word,
          index,
          position: text.indexOf(word)
        });
      }
    });

    setMisspelledWords(misspelled);
    setCurrentWordIndex(0);
    if (misspelled.length > 0) {
      generateSuggestions(misspelled[0].word);
    }
  };

  const generateSuggestions = (word) => {
    // Simple suggestion algorithm based on edit distance
    const suggestions = [];
    const maxDistance = 2;
    
    dictionary.forEach(dictWord => {
      const distance = levenshteinDistance(word.toLowerCase(), dictWord.toLowerCase());
      if (distance <= maxDistance && distance > 0) {
        suggestions.push({ word: dictWord, distance });
      }
    });

    suggestions.sort((a, b) => a.distance - b.distance);
    setSuggestions(suggestions.slice(0, 5));
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const replaceWord = (newWord) => {
    if (misspelledWords.length === 0) return;

    const currentMisspelled = misspelledWords[currentWordIndex];
    const text = editor.getText();
    const newText = text.substring(0, currentMisspelled.position) + 
                   newWord + 
                   text.substring(currentMisspelled.position + currentMisspelled.word.length);
    
    editor.commands.setContent(newText);
    checkSpelling(); // Re-check after replacement
  };

  const ignoreWord = () => {
    const newMisspelled = misspelledWords.filter((_, index) => index !== currentWordIndex);
    setMisspelledWords(newMisspelled);
    
    if (currentWordIndex >= newMisspelled.length) {
      setCurrentWordIndex(Math.max(0, newMisspelled.length - 1));
    }
    
    if (newMisspelled.length > 0) {
      generateSuggestions(newMisspelled[currentWordIndex]?.word || '');
    } else {
      setSuggestions([]);
    }
  };

  const nextWord = () => {
    if (misspelledWords.length > 0) {
      const nextIndex = (currentWordIndex + 1) % misspelledWords.length;
      setCurrentWordIndex(nextIndex);
      generateSuggestions(misspelledWords[nextIndex].word);
    }
  };

  const previousWord = () => {
    if (misspelledWords.length > 0) {
      const prevIndex = currentWordIndex === 0 ? misspelledWords.length - 1 : currentWordIndex - 1;
      setCurrentWordIndex(prevIndex);
      generateSuggestions(misspelledWords[prevIndex].word);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaSpellCheck className="text-blue-500" />
            <h3 className="text-lg font-semibold">Spell Check</h3>
            {misspelledWords.length > 0 && (
              <span className="text-sm text-gray-600">
                {currentWordIndex + 1} of {misspelledWords.length} issues
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {misspelledWords.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">✅ No spelling errors found!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Misspelled word:</p>
                <p className="text-lg font-medium text-red-600">
                  {misspelledWords[currentWordIndex]?.word}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={previousWord}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={nextWord}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => replaceWord(suggestion.word)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {suggestion.word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={ignoreWord}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <FaTimes className="mr-1" />
                Ignore
              </button>
              <button
                onClick={checkSpelling}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <FaSpellCheck className="mr-1" />
                Re-check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellCheck;





















































