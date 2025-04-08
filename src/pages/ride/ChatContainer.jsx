
import { useState, useRef, useEffect } from 'react';

export default function ChatAgentUI() {
  // Sample chat sessions
  const [sessions, setSessions] = useState([
    { 
      id: 1, 
      name: 'Technical Support', 
      lastMessage: 'Have you tried restarting your device?',
      timestamp: '10:30 AM',
      unread: 0,
      avatar: '👨‍💻'
    },
    { 
      id: 2, 
      name: 'Billing Inquiry', 
      lastMessage: 'Your invoice has been processed',
      timestamp: 'Yesterday',
      unread: 2,
      avatar: '💰'
    },
    { 
      id: 3, 
      name: 'Product Information', 
      lastMessage: 'Yes, that feature is available in our premium plan',
      timestamp: 'Apr 5',
      unread: 0,
      avatar: '📦'
    },
    { 
      id: 4, 
      name: 'New Customer', 
      lastMessage: 'Welcome to our service! How can I help?',
      timestamp: 'Mar 28',
      unread: 0,
      avatar: '🎉'
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're in mobile view on component mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello!', sender: 'user' },
    { id: 2, text: 'Hi there! How can I help you today?', sender: 'agent' },
    { id: 3, text: 'I have a question about your services.', sender: 'user' },
    { id: 4, text: 'Of course! I\'d be happy to answer any questions you have about our services. What would you like to know?', sender: 'agent' }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    
    // Update the last message in the session list
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === activeSessionId 
          ? {...session, lastMessage: text, timestamp: 'Just now'} 
          : session
      )
    );
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const agentResponse = getAgentResponse(text);
      const agentMessage = {
        id: messages.length + 2,
        text: agentResponse,
        sender: 'agent',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, agentMessage]);
      setIsTyping(false);
      
      // Update the last message in the session list again
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === activeSessionId 
            ? {...session, lastMessage: agentResponse, timestamp: 'Just now'} 
            : session
        )
      );
    }, 1500);
  };
  
  // Simple response generator based on user input
  const getAgentResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return 'Hello there! How can I assist you today?';
    } else if (lowerText.includes('help')) {
      return 'I\'m here to help! Please let me know what you need assistance with.';
    } else if (lowerText.includes('bye') || lowerText.includes('goodbye')) {
      return 'Thank you for chatting with us! Have a great day!';
    } else if (lowerText.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help with?';
    } else if (lowerText.includes('service') || lowerText.includes('product')) {
      return 'We offer a wide range of services and products tailored to meet your needs. Would you like more specific information?';
    } else {
      return 'Thanks for your message. Can you please provide more details so I can better assist you?';
    }
  };

  const createNewSession = () => {
    const newId = Math.max(...sessions.map(s => s.id)) + 1;
    const newSession = {
      id: newId,
      name: 'New Conversation',
      lastMessage: 'How can I help you today?',
      timestamp: 'Just now',
      unread: 0,
      avatar: '💬'
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([{
      id: 1,
      text: 'How can I help you today?',
      sender: 'agent',
      timestamp: new Date().toISOString()
    }]);
    
    // If in mobile view, close the sidebar after selecting
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  };

  const switchSession = (sessionId) => {
    setActiveSessionId(sessionId);
    
    // Here you would typically fetch messages for the selected session
    // For demo purposes, we'll just update the messages based on the session
    if (sessionId === 1) {
      setMessages([
        { id: 1, text: 'Hello!', sender: 'user' },
        { id: 2, text: 'Hi there! How can I help you today?', sender: 'agent' },
        { id: 3, text: 'I have a question about your services.', sender: 'user' },
        { id: 4, text: 'Of course! I\'d be happy to answer any questions you have about our services. What would you like to know?', sender: 'agent' }
      ]);
    } else if (sessionId === 2) {
      setMessages([
        { id: 1, text: 'I have a question about my recent invoice', sender: 'user' },
        { id: 2, text: 'I\'d be happy to help with your billing inquiry. Can you provide your account number?', sender: 'agent' },
        { id: 3, text: 'My account number is AC-12345', sender: 'user' },
        { id: 4, text: 'Thank you. I can see your invoice was processed yesterday. The payment should reflect in 2-3 business days.', sender: 'agent' },
        { id: 5, text: 'Great, thank you!', sender: 'user' },
        { id: 6, text: 'Your invoice has been processed', sender: 'agent' }
      ]);
    } else if (sessionId === 3) {
      setMessages([
        { id: 1, text: 'Does your product support integration with third-party apps?', sender: 'user' },
        { id: 2, text: 'Yes, we offer API integration with many popular platforms. Which specific application are you interested in connecting with?', sender: 'agent' },
        { id: 3, text: 'I need to connect with Salesforce', sender: 'user' },
        { id: 4, text: 'Yes, that feature is available in our premium plan', sender: 'agent' }
      ]);
    } else if (sessionId === 4) {
      setMessages([
        { id: 1, text: 'Hi, I just signed up for your service', sender: 'user' },
        { id: 2, text: 'Welcome to our service! How can I help?', sender: 'agent' }
      ]);
    } else {
      setMessages([]);
    }
    
    // Mark messages as read
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId 
          ? {...session, unread: 0} 
          : session
      )
    );
    
    // If in mobile view, close the sidebar after selecting
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with session history */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transform transition-transform duration-300 ease-in-out 
        ${isMobileView ? 'absolute z-20 h-full' : 'relative'} 
        bg-white border-r border-gray-200 w-80 flex flex-col`}>
        
        {/* Sidebar header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <button 
            onClick={createNewSession}
            className="bg-indigo-500 hover:bg-indigo-400 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Search box */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {sessions.map(session => (
            <div 
              key={session.id} 
              onClick={() => switchSession(session.id)}
              className={`cursor-pointer p-4 border-b border-gray-100 hover:bg-gray-50 ${activeSessionId === session.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                  {session.avatar}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${activeSessionId === session.id ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {session.name}
                    </h3>
                    <span className="text-xs text-gray-500">{session.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 truncate w-40">{session.lastMessage}</p>
                    {session.unread > 0 && (
                      <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {session.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Support Agent</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-indigo-600 text-white p-4 shadow-md flex items-center">
          {isMobileView && (
            <button 
              className="mr-3 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {sessions.find(s => s.id === activeSessionId) && (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3 text-xl">
                {sessions.find(s => s.id === activeSessionId)?.avatar || '💬'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{sessions.find(s => s.id === activeSessionId)?.name || 'Chat'}</h2>
                <p className="text-xs text-indigo-200">Online | Typically replies in a few minutes</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-700 rounded-lg py-2 px-4 max-w-xs lg:max-w-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="bg-white p-4 shadow-md border-t border-gray-200">
          <div className="flex items-center">
            <textarea
              className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows="2"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(newMessage);
                }
              }}
            />
            <button
              className="bg-indigo-600 text-white rounded-lg py-2 px-4 ml-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
              onClick={() => handleSendMessage(newMessage)}
              disabled={!newMessage.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="ml-auto">Powered by ChatAgent</span>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay when sidebar is open */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className="flex flex-col max-w-xs lg:max-w-md">
        <div className={`rounded-lg py-2 px-4 ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-700 rounded-bl-none'
        }`}>
          {message.text}
        </div>
        <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formattedTime}
        </span>
      </div>
      
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-500 ml-2 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

