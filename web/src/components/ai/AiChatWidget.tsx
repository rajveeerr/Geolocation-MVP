import { useState, useEffect, useMemo, useRef } from 'react';
import { useAiChat, type AiChatMessage } from '@/hooks/useAi';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';
import { MessageCircle, X, Send, Sparkles, MapPin, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface AiChatWidgetProps {
  className?: string;
}

export const AiChatWidget = ({ className }: AiChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const aiChat = useAiChat();
  const { location } = useGeolocation(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = useMemo(
    () => [
      'What deals are near me right now?',
      'How can I reach Platinum faster?',
      'Show me the best happy hour tonight.',
      'What can I get with my points?',
    ],
    [],
  );

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content:
            "Hey! I'm Yohop AI. I know your points, streaks and nearby deals. Ask me things like “What deals are near me right now?” or “How can I reach Platinum faster?”",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, aiChat.isPending]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || aiChat.isPending) return;

    setHasInteracted(true);
    const nextMessages: AiChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');

    try {
      const res = await aiChat.mutateAsync({
        message: trimmed,
        lat: location?.latitude,
        lng: location?.longitude,
        history: nextMessages,
      });
      setMessages([...nextMessages, { role: 'model', content: res.reply }]);
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : 'Something went wrong. Please try again in a moment.';
      setMessages([
        ...nextMessages,
        {
          role: 'model',
          content: `I couldn't respond just now: ${fallback}`,
        },
      ]);
    }
  };

  const subtitle = useMemo(() => {
    if (!location) {
      return 'Ask about nearby deals, streaks, coins and more.';
    }
    return `You’re near ${location.city || 'your city'} — ask what’s hot right now.`;
  }, [location]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-4 right-4 z-40 flex justify-end sm:bottom-6 sm:right-6',
        className,
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto mb-2 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white/95 shadow-2xl shadow-neutral-900/10 backdrop-blur-sm sm:max-w-sm"
          >
            <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-neutral-900">Yohop AI</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-emerald-600">Online</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Your live concierge for deals, streaks & loyalty.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {location && (
                  <div className="hidden items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 sm:flex">
                    <MapPin className="h-3 w-3" />
                    <span>{location.city || 'Nearby'}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setHasInteracted(false);
                  }}
                  className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close Yohop AI assistant"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto px-4 pb-3 pt-2 text-xs sm:max-h-[24rem]">
              <p className="mb-1 text-[11px] text-neutral-500">{subtitle}</p>

              {!hasInteracted && (
                <div className="mb-1 flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => {
                          void handleSend();
                        }, 0);
                      }}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700 transition hover:bg-neutral-900 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={`${msg.role}-${index}-${msg.content.slice(0, 8)}`}
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-3 py-1.5 leading-snug shadow-sm',
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-neutral-900 text-white'
                        : 'rounded-bl-sm bg-neutral-100 text-neutral-900',
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {aiChat.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-neutral-100 px-3 py-1.5 text-[11px] text-neutral-500">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:80ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:160ms]" />
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            <div className="border-t border-neutral-100 bg-neutral-50/80 px-3 py-2.5">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Ask Yohop AI anything about deals, streaks or points…"
                  className="max-h-16 min-h-[32px] flex-1 resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || aiChat.isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-neutral-900/25 ring-0 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neutral-900/40"
          aria-label="Open Yohop AI assistant"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

