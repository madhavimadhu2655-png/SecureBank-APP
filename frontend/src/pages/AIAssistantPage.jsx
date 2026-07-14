import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'How much did I spend this month?',
  'Where am I spending the most?',
  'How can I save more money?',
  'Should I invest in mutual funds?',
  'What is my spending trend?',
  'Tips to reduce my bills',
];

// Mock user financial context
const getUserContext = (user) => `
You are a helpful personal finance assistant for SecureBank app.
The user's name is ${user?.name || 'User'}.
Their account balance is ₹${user?.balance?.toLocaleString('en-IN') || '0'}.
Monthly spending data (simulated):
- Food & Dining: ₹3,200
- Bills & Recharge: ₹1,450
- Shopping: ₹2,800
- Transport: ₹900
- Health: ₹500
- Transfers: ₹5,000
Total spent this month: ₹13,850
Total received: ₹45,000 (salary)
Savings rate: 69%
Active SIPs: 2 (₹3,000/month total)
Gold holdings: 2.456g

Provide personalized, practical financial advice. Keep responses concise and friendly.
Use Indian Rupee (₹) context. Mention specific amounts from the data above when relevant.
Format responses with clear sections when needed. Use emojis occasionally to be friendly.
`;

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your SecureBank AI assistant.\n\nI can help you understand your spending, savings tips, investment advice, and more. What would you like to know?`,
    }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      // Build conversation for Claude API
      const conversationMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: msg }
      ];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: getUserContext(user),
          messages: conversationMessages,
        }),
      });

      const data = await response.json();
      const replyText = data.content?.[0]?.text || "I'm having trouble connecting right now. Please try again.";

      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      // Fallback responses if API fails
      const fallbacks = {
        'spend': `📊 This month you've spent **₹13,850** total:\n\n• 🍔 Food & Dining: ₹3,200 (23%)\n• 🛒 Shopping: ₹2,800 (20%)\n• ⚡ Bills: ₹1,450 (10%)\n• 💸 Transfers: ₹5,000 (36%)\n\nYour savings rate is an excellent **69%**! 🎉`,
        'save': `💡 Great question! Here are personalized tips:\n\n1. **Food** (₹3,200/mo) — Try cooking at home 2 extra days/week. Save ~₹800\n2. **Shopping** (₹2,800/mo) — Wait 48 hours before buying. Save ~₹1,000\n3. **Increase SIP** — Bump your ₹3,000 SIP to ₹5,000 for faster wealth growth\n\nYou're already saving ₹31,150/month which is great! 🚀`,
        'invest': `📈 Based on your profile:\n\n✅ **You're already doing great:**\n• ₹3,000/month in SIPs\n• 2.45g of Digital Gold\n\n💡 **Suggestions:**\n• Increase SIP to ₹5,000 — you can afford it\n• Start an emergency fund (3-6 months expenses = ~₹42,000)\n• Consider HDFC Balanced Advantage for lower risk\n\nYour net worth is growing! 💪`,
        'default': `I can help you with:\n\n📊 **Spending analysis** — where your money goes\n💰 **Savings tips** — personalized to your habits\n📈 **Investment advice** — SIPs, gold, FDs\n🧮 **EMI calculations** — loan planning\n📅 **Bill reminders** — never miss a payment\n\nWhat would you like to explore?`,
      };
      const key = msg.toLowerCase().includes('spend') ? 'spend' : msg.toLowerCase().includes('save') ? 'save' : msg.toLowerCase().includes('invest') ? 'invest' : 'default';
      setMessages(prev => [...prev, { role: 'assistant', content: fallbacks[key] }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={`${i > 0 ? 'mt-1' : ''} leading-relaxed`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              🤖
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">AI Finance Assistant</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-gray-400">Powered by Claude AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-tr-sm'
                : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
            }`}>
              {formatMessage(msg.content)}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm flex-shrink-0 mt-1 font-bold text-purple-700 dark:text-purple-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">🤖</div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay:`${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts + Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 space-y-3">
        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_PROMPTS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-3 py-2 rounded-full font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 min-h-[44px]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              className="w-full bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none resize-none max-h-24 leading-relaxed"
              placeholder="Ask about your spending, savings, investments..."
              rows={1}
              style={{ height: 'auto' }}
            />
          </div>
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="w-11 h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-2xl flex items-center justify-center text-white transition flex-shrink-0">
            ➤
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">AI may make mistakes. Always verify financial decisions.</p>
      </div>
    </div>
  );
}
