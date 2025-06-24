"use client"

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: string;
}

const markdownComponents: Components = {
  pre: ({ children }) => (
    <pre className="bg-gray-800 dark:bg-black rounded-lg p-4 overflow-x-auto my-2">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    const match = /language-(\w+)/.exec(className || '');
    return isInline ? (
      <code className="bg-gray-700/50 dark:bg-gray-900/50 rounded px-1 py-0.5">
        {children}
      </code>
    ) : (
      <SyntaxHighlighter
        style={dracula}
        language={match ? match[1] : undefined}
        PreTag="div"
        customStyle={{ borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.95em', margin: '0.5rem 0' }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  },
  a: ({ children, href }) => (
    <a href={href} className="text-blue-400 hover:text-blue-500 underline">
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="mb-4 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="ml-4">
      {children}
    </li>
  ),
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold mb-4 mt-6">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold mb-3 mt-5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold mb-2 mt-4">
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold border-b border-gray-300 dark:border-gray-600">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
      {children}
    </td>
  ),
};

export default function Home() {
  const [lastChosenModel, setLastChosenModel] = useState('llama3.2:latest');
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: uuidv4(), name: 'New Conversation', messages: [], model: 'llama3.2:latest' }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(conversations[0].id);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const messages = activeConversation ? activeConversation.messages : [];

  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeConversationId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        // If this is the first message and the name is still the placeholder, update the name
        let updatedName = conv.name;
        if (conv.messages.length === 0 && (conv.name === 'New Conversation' || conv.name.startsWith('Conversation '))) {
          const words = newMessage.content.split(' ');
          let topic = words.slice(0, 8).join(' ');
          if (topic.length > 40) topic = topic.slice(0, 40);
          if (newMessage.content.length > topic.length) topic += '...';
          updatedName = topic;
        }
        return { ...conv, messages: [...conv.messages, newMessage], name: updatedName };
      }
      return conv;
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          model: activeConversation.model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, { role: 'assistant', content: data.message.content }] }
          : conv
      ));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    const newConv = { id: uuidv4(), name: `Conversation ${conversations.length + 1}`, messages: [], model: lastChosenModel };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length === 1) {
      // If it's the last conversation, create a new one before deleting
      const newConv = { id: uuidv4(), name: 'New Conversation', messages: [], model: lastChosenModel };
      setConversations([newConv]);
      setActiveConversationId(newConv.id);
    } else {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (id === activeConversationId) {
        setActiveConversationId(conversations[0].id);
      }
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setLastChosenModel(newModel);
    setConversations(prev => prev.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, model: newModel }
        : conv
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // Sample message for empty conversation
  const samplePrompt = "What is AI?";
  const handleSampleClick = async () => {
    if (isLoading) return;
    setInputMessage(samplePrompt);
    // Simulate form submit with the sample prompt
    await sendMessage({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="flex min-h-screen font-[family-name:var(--font-geist-sans)] bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 shadow-lg">
        <button
          onClick={handleNewConversation}
          className="mb-4 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          + New Conversation
        </button>
        
        <div className="mt-4">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model
          </label>
          <select
            id="model-select"
            value={activeConversation.model}
            onChange={handleModelChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="llama3.2:latest">Llama 3</option>
            <option value="gemma">Gemma</option>
            <option value="mistral">Mistral</option>
            <option value="codellama">Code Llama</option>
            <option value="phi3">Phi 3</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar mt-4">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                conv.id === activeConversationId
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <span className="font-medium truncate flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-2 0c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6z" clipRule="evenodd" />
                </svg>
                {conv.name}
              </span>
              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className={`p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                  conv.id === activeConversationId
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-screen max-w-6xl flex flex-col">
          {/* Chat History */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar"
            id="chat-history"
            ref={chatHistoryRef}
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Welcome to Ullama!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-3 text-lg max-w-xl mx-auto">
                  Ullama is your AI assistant, ready to help you with questions, ideas, and everyday tasks. Whether you're curious about technology, need help with code, or just want to brainstorm, I'm here for you.
                </p>
                <p className="text-gray-700 dark:text-gray-200 mb-4 text-base font-medium">Here are some things you can try:</p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 text-base space-y-1 text-left max-w-md mx-auto">
                  <li>Ask about AI, science, or technology</li>
                  <li>Get help with programming or debugging code</li>
                  <li>Summarize articles or documents</li>
                  <li>Generate creative writing, emails, or ideas</li>
                  <li>And much more—just start typing!</li>
                </ul>
              </div>
            ) : messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none shadow-md' 
                    : ' dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-md'
                } px-6 py-3 rounded-2xl max-w-3xl duration-200`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-2xl rounded-bl-none max-w-2xl shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm p-6">
            <form onSubmit={sendMessage} ref={formRef} className="flex items-center gap-4 max-w-6xl mx-auto w-full">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full px-8 py-6 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xl shadow-md transition-all duration-200 resize-none overflow-y-hidden min-h-[56px] max-h-[220px]"
                  rows={1}
                  style={{ maxHeight: '220px' }}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg active:scale-[0.98]'
                } text-white px-6 py-4 rounded-full font-semibold transition-all duration-200 shadow-md flex items-center justify-center min-w-[3.5rem] h-[56px]`}
                style={{ alignSelf: 'center' }}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
