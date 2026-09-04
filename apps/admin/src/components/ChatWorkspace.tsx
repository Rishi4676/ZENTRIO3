import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, MessageSquare, Trash2 } from 'lucide-react';
import type { User, Project, ChatMessage } from '../types';

interface ChatWorkspaceProps {
  currentUser: User | null;
  messages: ChatMessage[];
  projects: Project[];
  sendChatMessage: (recipientId: string, content: string) => void;
  clearChannelMessages?: (channelId: string) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  currentUser,
  messages,
  projects,
  sendChatMessage,
  clearChannelMessages
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('internal-team');
  const [chatMessage, setChatMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter channels based on user role
  const isClient = currentUser?.role === 'client';
  const isWorker = currentUser?.role === 'worker';
  const isAdmin = currentUser?.role === 'admin';

  // Get available channels
  const channels = [
    ...(isClient ? [] : [{ id: 'internal-team', name: 'internal-team', description: 'Internal team discussions' }]),
    ...projects
      .filter(p => {
        if (isAdmin) return true;
        if (isWorker) return p.assignedWorkerId === currentUser?.id || p.assignedWorkerId === currentUser?.email;
        if (isClient) return p.clientId === currentUser?.email || p.clientId === 'client@company.com';
        return false;
      })
      .map(p => ({
        id: p.id,
        name: `project-${p.id.toLowerCase()}`,
        description: `Chat for ${p.title}`
      }))
  ];

  // Auto select first channel if current one is not available
  useEffect(() => {
    const channelExists = channels.some(c => c.id === selectedChannel);
    if (!channelExists && channels.length > 0) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  // Scroll to bottom on new messages or channel switch
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendChatMessage(selectedChannel, chatMessage.trim());
    setChatMessage('');
  };

  const filteredMessages = messages.filter(m => m.recipientId === selectedChannel);
  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-855 overflow-hidden flex flex-col md:flex-row h-[550px] shadow-sm">
      {/* Channels Sidebar */}
      <div className="w-full md:w-64 border-r border-slate-200/50 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-850">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            Collaboration Channels
          </h3>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {channels.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No active channels.</div>
          ) : (
            channels.map(c => {
              const active = c.id === selectedChannel;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChannel(c.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {c.id === 'internal-team' ? (
                    <Users className="w-4 h-4 shrink-0" />
                  ) : (
                    <Hash className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-grow flex flex-col h-full bg-white/10 dark:bg-slate-950/5">
        {/* Channel Header */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-855 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {selectedChannel === 'internal-team' ? (
                <Users className="w-4 h-4 text-indigo-500" />
              ) : (
                <Hash className="w-4 h-4 text-indigo-500" />
              )}
              #{currentChannel?.name || selectedChannel}
            </div>
            {clearChannelMessages && !isClient && (
              <button
                onClick={() => {
                  if (window.confirm(`Clear all messages in #${currentChannel?.name || selectedChannel}?`)) {
                    clearChannelMessages(selectedChannel);
                  }
                }}
                className="flex items-center space-x-1 text-[10px] font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            {currentChannel?.description}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 min-h-0 bg-slate-50/20 dark:bg-slate-950/5">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-800 mb-2 stroke-[1.5]" />
              <div className="text-xs font-bold">No Messages Yet</div>
              <div className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Send a greeting to start discussions in this channel!</div>
            </div>
          ) : (
            filteredMessages.map(msg => {
              const isSelf = msg.senderId === currentUser?.id || msg.senderId === currentUser?.email;
              return (
                <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs shadow-sm ${
                    isSelf
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-800/40'
                  }`}>
                    {!isSelf && (
                      <div className="text-[9px] font-bold uppercase tracking-wider mb-1 text-indigo-500 dark:text-indigo-400">
                        {msg.senderName} ({msg.senderRole.toUpperCase()})
                      </div>
                    )}
                    <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-[8px] text-right mt-1 opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <div className="p-3.5 border-t border-slate-200/50 dark:border-slate-855 bg-slate-50/30 dark:bg-slate-950/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              placeholder={`Write message to #${currentChannel?.name || 'channel'}...`}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-grow text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
