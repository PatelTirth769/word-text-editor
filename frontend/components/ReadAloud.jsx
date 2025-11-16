'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaCog, 
  FaTimes,
  FaVolumeUp
} from 'react-icons/fa'

const ReadAloud = ({ editor, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [speed, setSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [textSegments, setTextSegments] = useState([])
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  
  const synthRef = useRef(null)
  const utteranceRef = useRef(null)
  const highlightedWordsRef = useRef(new Set())
  const textContentRef = useRef('')
  const currentHighlightRef = useRef(null)
  const previousHighlightRef = useRef(null)

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
      
      const loadVoices = () => {
        const availableVoices = synthRef.current.getVoices()
        
        // Filter to only Microsoft Heera and Microsoft Ravi (case-insensitive)
        const filteredVoices = availableVoices.filter(v => {
          const name = v.name.toLowerCase()
          return name.includes('microsoft heera') || name.includes('microsoft ravi')
        })
        
        setVoices(filteredVoices)
        
        // Set default voice (prefer Microsoft Heera, then Microsoft Ravi)
        if (!selectedVoice && filteredVoices.length > 0) {
          const defaultVoice = filteredVoices.find(v => 
            v.name.toLowerCase().includes('microsoft heera')
          ) || filteredVoices.find(v => 
            v.name.toLowerCase().includes('microsoft ravi')
          ) || filteredVoices[0]
          setSelectedVoice(defaultVoice)
        }
      }
      
      loadVoices()
      synthRef.current.onvoiceschanged = loadVoices
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVoice = localStorage.getItem('readAloudVoice')
      const savedSpeed = localStorage.getItem('readAloudSpeed')
      
      if (savedSpeed) {
        setSpeed(parseFloat(savedSpeed))
      }
      
      if (savedVoice && voices.length > 0) {
        const voice = voices.find(v => v.name === savedVoice)
        if (voice) setSelectedVoice(voice)
      }
    }
  }, [voices])

  // Save preferences
  const savePreferences = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (selectedVoice) {
        localStorage.setItem('readAloudVoice', selectedVoice.name)
      }
      localStorage.setItem('readAloudSpeed', speed.toString())
    }
  }, [selectedVoice, speed])

  // Get text from editor
  const getTextFromEditor = useCallback(() => {
    if (!editor) return ''
    
    // Get selected text or all text
    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    
    if (hasSelection) {
      return editor.state.doc.textBetween(from, to, ' ')
    } else {
      // Get all text from the document
      return editor.state.doc.textContent
    }
  }, [editor])

  // Split text into sentences/paragraphs for navigation
  const splitIntoSegments = useCallback((text) => {
    // Split by paragraph breaks (double newlines) or sentence endings
    const segments = text
      .split(/\n\n+/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim())
    
    return segments.length > 0 ? segments : [text]
  }, [])

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    if (!editor) return
    
    // Remove previous highlight mark
    if (previousHighlightRef.current) {
      try {
        const { from, to } = previousHighlightRef.current
        editor.chain()
          .setTextSelection({ from, to })
          .unsetHighlight()
          .setTextSelection(editor.state.selection.anchor)
          .run()
      } catch (error) {
        console.error('Error clearing highlight:', error)
      }
      previousHighlightRef.current = null
    }
    
    // Clear DOM highlights
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll('.read-aloud-highlight, .read-aloud-current-word')
      elements.forEach(el => {
        el.classList.remove('read-aloud-highlight', 'read-aloud-current-word')
      })
      highlightedWordsRef.current.clear()
    }
  }, [editor])

  // Find text position in editor document
  const findTextPosition = useCallback((textOffset, fullText) => {
    if (!editor) return null

    const doc = editor.state.doc
    let currentOffset = 0
    let foundPos = null

    // Walk through the document to find the position
    doc.descendants((node, pos) => {
      if (foundPos !== null) return false
      
      if (node.isText) {
        const nodeText = node.text
        const nodeStart = currentOffset
        const nodeEnd = currentOffset + nodeText.length

        // Check if our target offset is within this text node
        if (textOffset >= nodeStart && textOffset <= nodeEnd) {
          const offsetInNode = textOffset - nodeStart
          foundPos = pos + offsetInNode
          return false
        }
        
        currentOffset = nodeEnd
      } else if (node.isBlock) {
        // Add newline for block nodes (except first)
        if (currentOffset > 0) {
          currentOffset += 1
        }
      }
      
      return true
    })

    return foundPos
  }, [editor])

  // Highlight word at index
  const highlightWord = useCallback((charIndex, text) => {
    if (!editor || charIndex < 0 || charIndex >= text.length) return

    // Find word boundaries
    const before = text.substring(0, charIndex)
    const after = text.substring(charIndex)
    
    // Find word start (first non-whitespace before charIndex)
    let wordStart = charIndex
    for (let i = charIndex - 1; i >= 0; i--) {
      if (/\s/.test(text[i])) {
        wordStart = i + 1
        break
      }
      if (i === 0) {
        wordStart = 0
        break
      }
    }
    
    // Find word end (first whitespace or punctuation after charIndex)
    let wordEnd = charIndex
    for (let i = charIndex; i < text.length; i++) {
      if (/\s/.test(text[i]) || /[.,!?;:]/.test(text[i])) {
        wordEnd = i
        break
      }
      if (i === text.length - 1) {
        wordEnd = text.length
        break
      }
    }

    // Find sentence boundaries for sentence highlighting
    const sentenceStart = Math.max(
      0,
      Math.max(
        before.lastIndexOf('.') + 1,
        Math.max(before.lastIndexOf('!') + 1, before.lastIndexOf('?') + 1)
      )
    )
    
    let sentenceEnd = text.length
    const afterText = text.substring(charIndex)
    const dotIndex = afterText.indexOf('.')
    const exclamIndex = afterText.indexOf('!')
    const questIndex = afterText.indexOf('?')
    
    if (dotIndex !== -1) sentenceEnd = Math.min(sentenceEnd, charIndex + dotIndex + 1)
    if (exclamIndex !== -1) sentenceEnd = Math.min(sentenceEnd, charIndex + exclamIndex + 1)
    if (questIndex !== -1) sentenceEnd = Math.min(sentenceEnd, charIndex + questIndex + 1)

    try {
      // Clear previous highlight
      if (previousHighlightRef.current) {
        const { from, to } = previousHighlightRef.current
        editor.chain()
          .setTextSelection({ from, to })
          .unsetHighlight()
          .run()
      }

      // Find positions in editor
      const wordStartPos = findTextPosition(wordStart, text)
      const wordEndPos = findTextPosition(wordEnd, text)
      const sentenceStartPos = findTextPosition(sentenceStart, text)
      const sentenceEndPos = findTextPosition(sentenceEnd, text)

      if (wordStartPos !== null && wordEndPos !== null) {
        // Store current highlight for clearing
        previousHighlightRef.current = { from: wordStartPos, to: wordEndPos }
        currentHighlightRef.current = { from: wordStartPos, to: wordEndPos }

        // Apply highlight mark to current word
        editor.chain()
          .setTextSelection({ from: wordStartPos, to: wordEndPos })
          .setHighlight({ color: '#ffff00' }) // Yellow highlight
          .setTextSelection(wordEndPos) // Move cursor to end of word
          .run()

        // Scroll to the word
        setTimeout(() => {
          const selection = editor.state.selection
          editor.commands.setTextSelection({ from: wordStartPos, to: wordEndPos })
          editor.commands.scrollIntoView()
          // Restore cursor position
          setTimeout(() => {
            editor.commands.setTextSelection(wordEndPos)
          }, 50)
        }, 10)

        // Add visual indicator class to editor for sentence highlighting
        if (typeof document !== 'undefined' && sentenceStartPos !== null && sentenceEndPos !== null) {
          setTimeout(() => {
            const editorElement = editor.view.dom
            // Remove previous sentence highlight
            editorElement.classList.remove('read-aloud-active')
            
            // Add class to indicate reading is active
            editorElement.classList.add('read-aloud-active')
          }, 10)
        }
      }
    } catch (error) {
      console.error('Error highlighting word:', error)
    }
  }, [editor, findTextPosition])

  // Speak text
  const speakText = useCallback((text, startIndex = 0) => {
    if (!synthRef.current || !text || text.trim().length === 0) return

    const utterance = new SpeechSynthesisUtterance(text)
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    utterance.rate = speed
    utterance.lang = selectedVoice?.lang || 'en-US'
    
    // Handle word boundaries for highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word' && event.charIndex !== undefined) {
        highlightWord(startIndex + event.charIndex, textContentRef.current)
      }
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setTimeout(() => {
        clearHighlights()
        // Remove all DOM highlights and classes
        if (typeof document !== 'undefined' && editor) {
          const editorElement = editor.view.dom
          editorElement.classList.remove('read-aloud-active')
        }
      }, 100)
      utteranceRef.current = null
    }
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error)
      setIsPlaying(false)
      setIsPaused(false)
      clearHighlights()
      utteranceRef.current = null
    }
    
    utterance.onpause = () => {
      setIsPaused(true)
    }
    
    utterance.onresume = () => {
      setIsPaused(false)
    }
    
    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
    setIsPlaying(true)
    setIsPaused(false)
  }, [selectedVoice, speed, highlightWord, clearHighlights])

  // Start reading
  const startReading = useCallback(() => {
    if (!editor) return

    const text = getTextFromEditor()
    if (!text || text.trim().length === 0) {
      alert('No text to read. Please select text or ensure the document has content.')
      return
    }

    textContentRef.current = text
    const segments = splitIntoSegments(text)
    setTextSegments(segments)
    setCurrentSegmentIndex(0)
    
    if (segments.length > 0) {
      speakText(segments[0], 0)
    }
  }, [editor, getTextFromEditor, splitIntoSegments, speakText])

  // Pause/Resume
  const togglePause = useCallback(() => {
    if (!synthRef.current) return

    if (isPaused) {
      synthRef.current.resume()
      setIsPaused(false)
    } else if (isPlaying) {
      synthRef.current.pause()
      setIsPaused(true)
    }
  }, [isPlaying, isPaused])

  // Stop reading
  const stopReading = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      clearHighlights()
      utteranceRef.current = null
    }
  }, [clearHighlights])

  // Next segment
  const nextSegment = useCallback(() => {
    if (currentSegmentIndex < textSegments.length - 1) {
      stopReading()
      const nextIndex = currentSegmentIndex + 1
      setCurrentSegmentIndex(nextIndex)
      const textBefore = textSegments.slice(0, nextIndex).join(' ')
      const charIndex = textBefore.length + (textBefore.length > 0 ? 1 : 0)
      speakText(textSegments[nextIndex], charIndex)
    }
  }, [currentSegmentIndex, textSegments, stopReading, speakText])

  // Previous segment
  const previousSegment = useCallback(() => {
    if (currentSegmentIndex > 0) {
      stopReading()
      const prevIndex = currentSegmentIndex - 1
      setCurrentSegmentIndex(prevIndex)
      const textBefore = textSegments.slice(0, prevIndex).join(' ')
      const charIndex = textBefore.length + (textBefore.length > 0 ? 1 : 0)
      speakText(textSegments[prevIndex], charIndex)
    }
  }, [currentSegmentIndex, textSegments, stopReading, speakText])

  // Handle voice change
  const handleVoiceChange = useCallback((voiceName) => {
    const voice = voices.find(v => v.name === voiceName)
    if (voice) {
      setSelectedVoice(voice)
      savePreferences()
    }
  }, [voices, savePreferences])

  // Handle speed change
  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed)
    savePreferences()
    
    // Update current utterance if playing
    if (isPlaying && utteranceRef.current) {
      const wasPaused = isPaused
      stopReading()
      const currentText = textSegments[currentSegmentIndex] || ''
      if (currentText) {
        const textBefore = textSegments.slice(0, currentSegmentIndex).join(' ')
        const charIndex = textBefore.length + (textBefore.length > 0 ? 1 : 0)
        speakText(currentText, charIndex)
        if (wasPaused) {
          setTimeout(() => synthRef.current?.pause(), 100)
        }
      }
    }
  }, [isPlaying, isPaused, currentSegmentIndex, textSegments, stopReading, speakText, savePreferences])

  // Close handler
  const handleClose = useCallback(() => {
    stopReading()
    onClose()
  }, [stopReading, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === ' ' && !e.shiftKey) {
        e.preventDefault()
        if (isPlaying) {
          togglePause()
        } else {
          startReading()
        }
      } else if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault()
        nextSegment()
      } else if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        previousSegment()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPlaying, togglePause, startReading, nextSegment, previousSegment])

  if (!isOpen) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <FaVolumeUp className="text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">Read Aloud</span>
        <button
          onClick={handleClose}
          className="ml-auto p-1 hover:bg-gray-100 rounded"
          title="Close"
        >
          <FaTimes className="w-3 h-3 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-1 p-2">
        {/* Previous */}
        <button
          onClick={previousSegment}
          disabled={currentSegmentIndex === 0}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous (Ctrl+←)"
        >
          <FaStepBackward className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? togglePause : startReading}
          className="p-2 hover:bg-gray-100 rounded"
          title={isPlaying ? (isPaused ? 'Resume (Space)' : 'Pause (Space)') : 'Play (Space)'}
        >
          {isPlaying && !isPaused ? (
            <FaPause className="w-4 h-4" />
          ) : (
            <FaPlay className="w-4 h-4" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextSegment}
          disabled={currentSegmentIndex >= textSegments.length - 1}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next (Ctrl+→)"
        >
          <FaStepForward className="w-4 h-4" />
        </button>

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Settings"
          >
            <FaCog className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64 z-10">
              <div className="space-y-4">
                {/* Voice Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Voice
                  </label>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed Control */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Speed: {speed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={speed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default ReadAloud

