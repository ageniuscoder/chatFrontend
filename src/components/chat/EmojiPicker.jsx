import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

// Emoji data organized by categories
const EMOJI_CATEGORIES = {
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '😊', '😇', '🙂', '🙃', '😉', '😌',
    '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒',
    '😞', '😔', '😢', '😭', '😤', '😡', '🤬', '🤯', '😳', '🤥', '😴', '🤤', '🤢', '🤮',
    '🤧', '🤒', '🤕', '🤑', '🤠'
  ],
  'Animals & Nature': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸', '🙈', '🙉', '🙊', '🌸',
    '🌹', '🌻', '🌼', '🌳', '🌴', '🌵', '🌞', '🌟'
  ],
  'Food & Drink': [
    '🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍔', '🍕', '🌭', '🌮', '🍟', '🍣', '🍦', '☕',
    '🍵', '🍺'
  ],
  'Activity & Travel': [
    '⚽', '🏀', '🏈', '⚾', '🏃‍♂️', '💃', '🕺', '🎉', '🎊', '🚗', '✈️', '🚀', '🏠', '🗽',
    '🏝️'
  ],
  'Objects & Symbols': [
    '❤️', '💔', '💕', '🔥', '✨', '💡', '📚', '📱', '💻', '💰', '👍', '👎', '🙏', '👏',
    '💪', '🤝', '👌', '✌️', '🤟', '👋', '🤙'
  ]
};

// Get emoji names for accessibility
const getEmojiName = (emoji) => {
  const emojiNames = {
    '😀': 'grinning face',
    '😃': 'grinning face with big eyes',
    '😄': 'grinning face with smiling eyes',
    '😁': 'beaming face with smiling eyes',
    '😆': 'grinning squinting face',
    '😅': 'grinning face with sweat',
    '🤣': 'rolling on the floor laughing',
    '😂': 'face with tears of joy',
    '😊': 'smiling face with smiling eyes',
    '😇': 'smiling face with halo',
    '🙂': 'slightly smiling face',
    '🙃': 'upside-down face',
    '😉': 'winking face',
    '😌': 'relieved face',
    '😍': 'smiling face with heart-eyes',
    '🥰': 'smiling face with hearts',
    '😘': 'face blowing a kiss',
    '😗': 'kissing face',
    '😙': 'kissing face with smiling eyes',
    '😚': 'kissing face with closed eyes',
    '😋': 'face savoring food',
    '😜': 'winking face with tongue',
    '🤪': 'zany face',
    '😎': 'smiling face with sunglasses',
    '🤩': 'star-struck',
    '🥳': 'partying face',
    '😏': 'smirking face',
    '😒': 'unamused face',
    '😞': 'disappointed face',
    '😔': 'pensive face',
    '😢': 'crying face',
    '😭': 'loudly crying face',
    '😤': 'face with steam from nose',
    '😡': 'pouting face',
    '🤬': 'face with symbols on mouth',
    '🤯': 'exploding head',
    '😳': 'flushed face',
    '🤥': 'lying face',
    '😴': 'sleeping face',
    '🤤': 'drooling face',
    '🤢': 'nauseated face',
    '🤮': 'face vomiting',
    '🤧': 'sneezing face',
    '🤒': 'face with thermometer',
    '🤕': 'face with head-bandage',
    '🤑': 'money-mouth face',
    '🤠': 'cowboy hat face',
    '🐶': 'dog face',
    '🐱': 'cat face',
    '🐭': 'mouse face',
    '🐹': 'hamster face',
    '🐰': 'rabbit face',
    '🦊': 'fox face',
    '🐻': 'bear face',
    '🐼': 'panda face',
    '🦁': 'lion',
    '🐸': 'frog',
    '🙈': 'see-no-evil monkey',
    '🙉': 'hear-no-evil monkey',
    '🙊': 'speak-no-evil monkey',
    '🌸': 'cherry blossom',
    '🌹': 'rose',
    '🌻': 'sunflower',
    '🌼': 'blossom',
    '🌳': 'deciduous tree',
    '🌴': 'palm tree',
    '🌵': 'cactus',
    '🌞': 'sun with face',
    '🌟': 'glowing star',
    '🍎': 'red apple',
    '🍊': 'tangerine',
    '🍋': 'lemon',
    '🍉': 'watermelon',
    '🍇': 'grapes',
    '🍓': 'strawberry',
    '🍔': 'hamburger',
    '🍕': 'pizza',
    '🌭': 'hot dog',
    '🌮': 'taco',
    '🍟': 'french fries',
    '🍣': 'sushi',
    '🍦': 'soft ice cream',
    '☕': 'hot beverage',
    '🍵': 'teacup without handle',
    '🍺': 'beer mug',
    '⚽': 'soccer ball',
    '🏀': 'basketball',
    '🏈': 'american football',
    '⚾': 'baseball',
    '🏃‍♂️': 'man running',
    '💃': 'woman dancing',
    '🕺': 'man dancing',
    '🎉': 'party popper',
    '🎊': 'confetti ball',
    '🚗': 'automobile',
    '✈️': 'airplane',
    '🚀': 'rocket',
    '🏠': 'house',
    '🗽': 'statue of liberty',
    '🏝️': 'desert island',
    '❤️': 'red heart',
    '💔': 'broken heart',
    '💕': 'two hearts',
    '🔥': 'fire',
    '✨': 'sparkles',
    '💡': 'light bulb',
    '📚': 'books',
    '📱': 'mobile phone',
    '💻': 'laptop',
    '💰': 'money bag',
    '👍': 'thumbs up',
    '👎': 'thumbs down',
    '🙏': 'folded hands',
    '👏': 'clapping hands',
    '💪': 'flexed biceps',
    '🤝': 'handshake',
    '👌': 'OK hand',
    '✌️': 'victory hand',
    '🤟': 'love-you gesture',
    '👋': 'waving hand',
    '🤙': 'call me hand'
  };
  
  return emojiNames[emoji] || 'emoji';
};

const EmojiPicker = ({ onSelect, onClose, anchorRef, pickerWidth, pickerHeight }) => {
  const pickerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Smileys & People');
  const [recentlyUsed, setRecentlyUsed] = useState([]);

  // Load recently used emojis from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyUsedEmojis');
      if (stored) {
        setRecentlyUsed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently used emojis", e);
    }
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    onSelect(emoji);
    
    // Update recently used emojis
    const newUsed = [emoji, ...recentlyUsed.filter(e => e !== emoji)].slice(0, 15);
    setRecentlyUsed(newUsed);
    
    try {
      localStorage.setItem('recentlyUsedEmojis', JSON.stringify(newUsed));
    } catch (e) {
      console.error("Failed to save recently used emojis", e);
    }
  };

  // Filter emojis based on search term
  const filteredEmojis = Object.entries(EMOJI_CATEGORIES).reduce((acc, [category, emojis]) => {
    const categoryEmojis = emojis.filter(emoji => 
      getEmojiName(emoji).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (categoryEmojis.length > 0) {
      acc[category] = categoryEmojis;
    }
    
    return acc;
  }, {});

  const isSearchActive = searchTerm.length > 0;

  // Close picker when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target) && 
          !anchorRef?.current?.contains(e.target)) {
        onClose();
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, anchorRef]);

  return (
    <div
      ref={pickerRef}
      className="emoji-picker"
      style={{ width: pickerWidth, maxHeight: pickerHeight }}
      role="dialog"
      aria-label="Emoji picker"
    >
      {/* Search bar */}
      <div className="emoji-search">
        <Search className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />
      </div>

      {/* Category tabs */}
      <div className="emoji-tabs">
        {recentlyUsed.length > 0 && (
          <button
            onClick={() => { setActiveTab('Recent'); setSearchTerm(''); }}
            className={`tab ${activeTab === 'Recent' ? 'active' : ''}`}
            type="button"
          >
            Recent
          </button>
        )}
        {Object.keys(EMOJI_CATEGORIES).map(category => (
          <button
            key={category}
            onClick={() => { setActiveTab(category); setSearchTerm(''); }}
            className={`tab ${activeTab === category ? 'active' : ''}`}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="emoji-grid-container">
        {isSearchActive ? (
          Object.entries(filteredEmojis).map(([category, emojis]) => (
            <div key={category} className="emoji-category">
              <h3 className="category-title">{category}</h3>
              <div className="emoji-grid">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="emoji-button"
                    aria-label={`Insert ${getEmojiName(emoji)} emoji`}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <>
            {activeTab === 'Recent' && recentlyUsed.length > 0 && (
              <div className="emoji-category">
                <h3 className="category-title">Recently Used</h3>
                <div className="emoji-grid">
                  {recentlyUsed.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="emoji-button"
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
              <div 
                key={category} 
                className={`emoji-category ${!isSearchActive && activeTab && activeTab !== category ? 'hidden' : ''}`}
              >
                <h3 className="category-title">{category}</h3>
                <div className="emoji-grid">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="emoji-button"
                      aria-label={`Insert ${getEmojiName(emoji)} emoji`}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style jsx>{`
        .emoji-picker {
          position: absolute;
          bottom: 3.5rem;
          right: 0;
          overflow: hidden;
          background-color: #2d3748;
          border: 1px solid #6b46c1;
          border-radius: 1rem;
          padding: 0.5rem;
          box-shadow: 0 10px 25px rgba(107, 70, 193, 0.7);
          z-index: 100;
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
          transform-origin: bottom right;
          animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .emoji-search {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          padding: 0.25rem;
          background-color: #4a5568;
          border-radius: 0.5rem;
          position: sticky;
          top: 0;
          z-index: 20;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
        }
        
        .search-icon {
          width: 1rem;
          height: 1rem;
          color: #a0aec0;
          margin-left: 0.25rem;
        }
        
        .search-input {
          flex: 1;
          background: transparent;
          font-size: 0.875rem;
          color: white;
          margin-left: 0.5rem;
          border: none;
          outline: none;
        }
        
        .search-input::placeholder {
          color: #a0aec0;
        }
        
        .emoji-tabs {
          display: flex;
          overflow-x: auto;
          gap: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #4a5568;
          position: sticky;
          top: 2.5rem;
          background-color: #2d3748;
          z-index: 10;
        }
        
        .emoji-tabs::-webkit-scrollbar {
          height: 0.5rem;
          background-color: transparent;
        }
        
        .emoji-tabs::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 0.5rem;
        }
        
        .emoji-tabs::-webkit-scrollbar-thumb:hover {
          background-color: #6366f1;
        }
        
        .tab {
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 9999px;
          background-color: #4a5568;
          color: #a0aec0;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        
        .tab:hover {
          background-color: rgba(74, 85, 104, 0.7);
        }
        
        .tab.active {
          background-color: rgba(72, 187, 120, 0.8);
          color: white;
        }
        
        .emoji-grid-container {
          flex: 1;
          overflow-y: auto;
          margin-top: 0.5rem;
          padding: 0.25rem;
        }
        
        .emoji-grid-container::-webkit-scrollbar {
          width: 0.5rem;
          background-color: transparent;
        }
        
        .emoji-grid-container::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 0.5rem;
        }
        
        .emoji-grid-container::-webkit-scrollbar-thumb:hover {
          background-color: #6366f1;
        }
        
        .emoji-category {
          margin-bottom: 1rem;
        }
        
        .emoji-category.hidden {
          display: none;
        }
        
        .category-title {
          color: #a0aec0;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        
        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .emoji-button {
          padding: 0.25rem;
          border-radius: 0.5rem;
          font-size: 1.125rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: system-ui, sans-serif;
        }
        
        .emoji-button:hover {
          background-color: #4a5568;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default React.memo(EmojiPicker);