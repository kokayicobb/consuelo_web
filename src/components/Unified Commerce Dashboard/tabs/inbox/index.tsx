import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Send, Paperclip, X, Star, Archive, Trash2, Reply, Forward } from 'lucide-react';
import EmailComposer from './email/email-composer';

// Types
interface Message {
  id: string;
  client_id?: string;
  source: 'email' | 'linkedin' | 'reddit' | 'internal';
  from_address: string;
  from_name?: string;
  to_addresses: string[];
  subject?: string;
  body_text?: string;
  body_html?: string;
  preview_text?: string;
  sent_at?: string;
  received_at: string;
  read: boolean;
  starred: boolean;
  status: string;
  campaign_name?: string;
  tags?: string[];
  source_emoji?: string;
  display_name?: string;
}

interface Client {
  "Client ID": string;
  "Client": string;
  email: string;
  company?: string;
}

// Import your existing EmailComposer component


// Main Inbox Component
export default function UnifiedInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | undefined>();

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate fetching messages
    const mockMessages: Message[] = [
      {
        id: '1',
        source: 'email',
        from_address: 'james@vincenzo.com',
        from_name: 'James J Vincenzo',
        to_addresses: ['sales@yourcompany.com'],
        subject: 'Re: Business Funding Inquiry',
        preview_text: 'Hi Eyal, Thanks for reaching out, but I\'m not interested.',
        body_text: 'Hi Eyal, Thanks for reaching out, but I\'m not interested.',
        received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        starred: false,
        status: 'replied',
        source_emoji: '✉️',
        display_name: 'James J Vincenzo'
      },
      {
        id: '2',
        source: 'email',
        from_address: 'scott@elevateaccessnow.com',
        from_name: 'Scott Ready (CODA)',
        to_addresses: ['sales@yourcompany.com'],
        subject: 'Partnership Opportunity',
        preview_text: 'Yes, I would be the POC. Let\'s discuss how we might partner. My email is scott@elevateaccessnow.com',
        body_text: 'Yes, I would be the POC. Let\'s discuss how we might partner. My email is scott@elevateaccessnow.com',
        received_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        read: false,
        starred: true,
        status: 'replied',
        tags: ['hot-lead'],
        source_emoji: '✉️',
        display_name: 'Scott Ready (CODA)'
      },
      {
        id: '3',
        source: 'linkedin',
        from_address: 'devan.p@example.com',
        from_name: 'Devan P',
        to_addresses: ['sales@yourcompany.com'],
        subject: 'VC/PE Firm Funding',
        preview_text: 'Hi Eyal, thanks for the note. Not unless you\'re a VC or PE firm ready to invest:). How are you scaling your business?',
        body_text: 'Hi Eyal, thanks for the note. Not unless you\'re a VC or PE firm ready to invest:). How are you scaling your business?',
        received_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
        starred: false,
        status: 'replied',
        source_emoji: '💼',
        display_name: 'Devan P'
      }
    ];
    setMessages(mockMessages);

    // Mock clients data
    const mockClients: Client[] = [
      { "Client ID": '1', "Client": 'James Vincenzo', email: 'james@vincenzo.com', company: 'Vincenzo LLC' },
      { "Client ID": '2', "Client": 'Scott Ready', email: 'scott@elevateaccessnow.com', company: 'Elevate Access Now' },
      { "Client ID": '3', "Client": 'Devan P', email: 'devan.p@example.com', company: 'Example Corp' },
      { "Client ID": '4', "Client": 'Simon Kim', email: 'simon.kim@example.com', company: 'Kim Industries' },
      { "Client ID": '5', "Client": 'Raphael Bennett', email: 'raphael@example.com', company: 'Bennett & Co' }
    ];
    setClients(mockClients);
  }, []);

  const handleSendEmail = async (emailData: any) => {
    // Here you would call your actual API endpoint
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    // Add the sent message to the list
    const newMessage: Message = {
      id: Date.now().toString(),
      source: 'email',
      from_address: emailData.from,
      to_addresses: emailData.to,
      subject: emailData.subject,
      body_text: emailData.text,
      body_html: emailData.html,
      preview_text: emailData.text.substring(0, 200),
      sent_at: new Date().toISOString(),
      received_at: new Date().toISOString(),
      read: true,
      starred: false,
      status: 'sent',
      source_emoji: '✉️',
      display_name: 'You'
    };

    setMessages([newMessage, ...messages]);
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread' && msg.read) return false;
    if (filter === 'starred' && !msg.starred) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.display_name?.toLowerCase().includes(query) ||
        msg.subject?.toLowerCase().includes(query) ||
        msg.preview_text?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const toggleStar = (msgId: string) => {
    setMessages(messages.map(msg => 
      msg.id === msgId ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const markAsRead = (msgId: string) => {
    setMessages(messages.map(msg => 
      msg.id === msgId ? { ...msg, read: true } : msg
    ));
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setShowCompose(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4">
          <button
            onClick={() => {
              setReplyTo(undefined);
              setShowCompose(true);
            }}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>
        
        <nav className="flex-1">
          <button
            onClick={() => setFilter('all')}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${filter === 'all' ? 'bg-gray-100' : ''}`}
          >
            <span>Inbox</span>
            <span className="text-sm text-gray-500">{messages.length}</span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${filter === 'unread' ? 'bg-gray-100' : ''}`}
          >
            <span>Unread</span>
            <span className="text-sm text-gray-500">{messages.filter(m => !m.read).length}</span>
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${filter === 'starred' ? 'bg-gray-100' : ''}`}
          >
            <span>Starred</span>
            <span className="text-sm text-gray-500">{messages.filter(m => m.starred).length}</span>
          </button>
        </nav>
      </div>

      {/* Message List */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Prospects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-4 mt-4">
            <button className="flex items-center space-x-2 px-3 py-1 border rounded-md hover:bg-gray-50">
              <span>Campaign</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 px-3 py-1 border rounded-md hover:bg-gray-50">
              <span>Status</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 px-3 py-1 border rounded-md hover:bg-gray-50">
              <span>Tags</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 px-3 py-1 border rounded-md hover:bg-gray-50">
              <span>Date</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => {
                setSelectedMessage(message);
                markAsRead(message.id);
              }}
              className={`flex items-start p-4 border-b hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''} ${selectedMessage?.id === message.id ? 'bg-gray-100' : ''}`}
            >
              <input type="checkbox" className="mt-1 mr-3" onClick={(e) => e.stopPropagation()} />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(message.id);
                }}
                className="mr-3 text-gray-400 hover:text-yellow-500"
              >
                <Star className={`w-5 h-5 ${message.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{message.source_emoji}</span>
                      <span className={`font-medium ${!message.read ? 'font-semibold' : ''}`}>
                        {message.display_name}
                      </span>
                      {message.tags?.includes('hot-lead') && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Hot Lead</span>
                      )}
                    </div>
                    <div className={`text-sm ${!message.read ? 'font-semibold' : ''}`}>
                      {message.subject}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {message.preview_text}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 ml-4">
                    {new Date(message.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail */}
      {selectedMessage && (
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{selectedMessage.subject}</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{selectedMessage.source_emoji}</span>
                <div>
                  <div className="font-medium">{selectedMessage.display_name}</div>
                  <div className="text-sm text-gray-600">{selectedMessage.from_address}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(selectedMessage.received_at).toLocaleString()}
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedMessage.body_text}</p>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <button
                onClick={() => handleReply(selectedMessage)}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button className="p-2 border rounded-md hover:bg-gray-50">
                <Forward className="w-4 h-4" />
              </button>
              <button className="p-2 border rounded-md hover:bg-gray-50">
                <Archive className="w-4 h-4" />
              </button>
              <button className="p-2 border rounded-md hover:bg-gray-50 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {replyTo ? `Reply to ${replyTo.display_name}` : 'New Message'}
              </h2>
              <button
                onClick={() => {
                  setShowCompose(false);
                  setReplyTo(undefined);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Render your existing EmailComposer */}
            <div className="p-4">
              <EmailComposer 
                // Pass any props if needed, like pre-filled data for replies
                initialTo={replyTo?.from_address}
                initialSubject={replyTo ? `Re: ${replyTo.subject}` : undefined}
                onSuccess={() => {
                  setShowCompose(false);
                  setReplyTo(undefined);
                  // Optionally refresh the message list
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}