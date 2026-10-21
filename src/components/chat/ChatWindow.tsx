import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  ShieldCheck,
  CheckCheck,
  Clock,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { ChatConversation } from '../../types';
import { formatBengaliDate } from '../../lib/utils';

interface ChatWindowProps {
  initialChatId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialChatId }) => {
  const { user, isAdmin } = useAuth();
  const { chatConversations, activeChatMessages, sendMessage } = useLibrary();

  const [activeChatId, setActiveChatId] = useState<string>(
    initialChatId || chatConversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const currentMessages = activeChatId ? activeChatMessages[activeChatId] || [] : [];
  const activeConversation = chatConversations.find((c) => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage(activeChatId, textToSend);
  };

  return (
    <div className="bg-white rounded-card border border-brand-border shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px] max-h-[85vh]">
      {/* Left Chat List Panel */}
      <aside className={`w-full md:w-80 border-r border-brand-border flex flex-col bg-gray-50/50 ${
        activeChatId && 'hidden md:flex'
      }`}>
        <div className="p-4 border-b border-brand-border bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-brand-text text-base">লাইব্রেরি চ্যাট</h2>
          </div>
          <span className="text-xs bg-primary-soft text-primary font-bold px-2 py-0.5 rounded-full">
            সক্রিয়
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {chatConversations.length === 0 ? (
            <div className="p-8 text-center text-brand-muted">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs">কোনো সক্রিয় বার্তা নেই</p>
            </div>
          ) : (
            chatConversations.map((conv) => {
              const isSelected = conv.id === activeChatId;
              const titleName = isAdmin ? conv.borrowerName : 'আব্দুর রহমান (দায়িত্বশীল)';

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveChatId(conv.id)}
                  className={`w-full p-3.5 text-left transition flex gap-3 items-start ${
                    isSelected ? 'bg-primary-soft/60 border-l-4 border-primary' : 'hover:bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-primary font-bold flex items-center justify-center text-sm border border-emerald-200">
                      {titleName.slice(0, 1)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-brand-text truncate">{titleName}</h4>
                      <span className="text-[10px] text-gray-400">১০ মে</span>
                    </div>
                    <p className="text-xs text-primary font-medium truncate mt-0.5">
                      {conv.bookTitle}
                    </p>
                    <p className="text-xs text-brand-muted truncate mt-0.5">
                      {conv.lastMessagePreview || 'চ্যাট শুরু হয়েছে...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Chat Thread Panel */}
      <main className={`flex-1 flex flex-col bg-white ${!activeChatId && 'hidden md:flex'}`}>
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-brand-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChatId('')}
                  className="md:hidden p-1.5 rounded-lg text-brand-muted hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center">
                  {isAdmin
                    ? activeConversation.borrowerName.slice(0, 1)
                    : 'আ'}
                </div>
                <div>
                  <h3 className="font-bold text-brand-text text-sm sm:text-base flex items-center gap-1.5">
                    {isAdmin ? activeConversation.borrowerName : 'আব্দুর রহমান (দায়িত্বশীল)'}
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </h3>
                  <p className="text-xs text-primary font-medium">
                    বই: {activeConversation.bookTitle}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                  অনলাইন
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-brand-bg/40">
              {currentMessages.map((msg) => {
                const isMe = msg.senderUid === user?.uid || (user?.role === 'admin' && msg.senderRole === 'admin');

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white border border-brand-border text-brand-text rounded-bl-none'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[11px] font-bold text-primary mb-1">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isMe ? 'text-emerald-100' : 'text-gray-400'
                        }`}
                      >
                        <span>{formatBengaliDate(msg.createdAt)}</span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 bg-white border-t border-brand-border flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="এখানে মেসেজ লিখুন..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-gray-50/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition disabled:opacity-40 shadow-sm shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-brand-muted">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="font-bold text-brand-text text-base mb-1">একটি চ্যাট নির্বাচন করুন</h3>
            <p className="text-xs text-brand-muted max-w-xs">
              বই ধার নেওয়ার অনুমোদনের পর দায়িত্বশীল ভাইয়ের সাথে বার্তা আদান-প্রদান করতে বামপাশ থেকে চ্যাট বেছে নিন।
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
