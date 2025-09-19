import React,{useState,useRef,useEffect} from 'react';
import { Edit2, Trash, CornerDownRight, Check, CheckCheck, Clock } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/dateUtils';

const MessageBubble = ({ message, isOwn, showAvatar,onEdit, onDelete, onForward}) => {
   const [showMenu, setShowMenu] = useState(false);
   const bubbleRef = useRef(null);
   let longPressTimeout = useRef(null);

   const handleLongPress=(e)=>{
    //prevent default context menu
    e.preventDefault();
    e.stopPropagation();

    // Show the custom menu
    setShowMenu(true);
   }

   const handleMouseDown=(e)=>{
    // Start the long press timer
    longPressTimeout.current = setTimeout(() => handleLongPress(e), 500); // 500ms for long press
   }
   
   const handleMouseUp=()=>{
    // Clear the long press timer
    clearTimeout(longPressTimeout.current);
   }

   const handleOutsideClick=(e)=>{
    if(bubbleRef.current && !bubbleRef.current.contains(e.target)){
        setShowMenu(false);
    }
  }

  useEffect(()=>{
    document.addEventListener('mousedown',handleOutsideClick);
    return ()=>{
        document.removeEventListener('mousedown',handleOutsideClick);
    }
  },[bubbleRef])


  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-purple-300" />;
      default:
        return null;
    }
  };

  const bubbleClasses = isOwn
    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-blue-800/30'
    : 'bg-gray-700 text-gray-100 rounded-bl-none shadow-lg shadow-gray-900/30';
  
  // Conditionally add a bottom margin to space out the blocks of messages
  const messageBlockMargin = showAvatar ? 'mb-2' : '';

  return (
    <div 
    ref={bubbleRef}
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
    onContextMenu={handleLongPress}
    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end mb-1.5 ${messageBlockMargin}`}>
      {/* Container for Avatar or Spacer */}
      {!isOwn ? (
        <div className="flex-shrink-0" style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.5rem' }}>
          {showAvatar && (
            <Avatar
              src={message.sender_avatar}
              alt={message.sender_username}
              size="sm"
            />
          )}
        </div>
      ) : (
        // Spacer for sent messages to maintain alignment
        showAvatar && <div className="w-6 flex-shrink-0 mr-1" />
      )}
      
      {/* Message Bubble and Neon Glow */}
      <div className={`relative px-4 py-2 rounded-2xl max-w-[65%] lg:max-w-[50%] break-words whitespace-pre-wrap ${bubbleClasses}`}>
        {/* Sender name for group chats */}
        {!isOwn && message.sender_username && showAvatar && (
          <div className="text-xs font-bold mb-0.5 text-purple-300 drop-shadow-sm">{message.sender_username}</div>
        )}
        
        {/* Message content */}
        <div className="text-sm leading-relaxed break-words">
          {message.content}
        </div>
        
        {/* Time and status */}
        <div className={`flex items-center justify-end space-x-1 mt-0.5 text-xs opacity-80 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
          <span>
            {formatMessageTime(message.sent_at)}
          </span>
          {isOwn && getStatusIcon()}
        </div>
        {showMenu && (
          <div className={`absolute top-0 transform ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} z-20`}>
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 text-sm flex flex-col space-y-1">
              {isOwn && (
                <>
                  <button onClick={() => { onEdit(message); setShowMenu(false); }} className="flex items-center space-x-2 text-white hover:bg-gray-700 px-3 py-1 rounded-md">
                    <Edit2 size={16} /><span>Edit</span>
                  </button>
                  <button onClick={() => { onDelete(message.id); setShowMenu(false); }} className="flex items-center space-x-2 text-red-400 hover:bg-gray-700 px-3 py-1 rounded-md">
                    <Trash size={16} /><span>Delete</span>
                  </button>
                </>
              )}
              <button onClick={() => { onForward(message); setShowMenu(false); }} className="flex items-center space-x-2 text-blue-400 hover:bg-gray-700 px-3 py-1 rounded-md">
                <CornerDownRight size={16} /><span>Forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;