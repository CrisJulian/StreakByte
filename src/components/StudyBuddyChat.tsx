import { useEffect, useRef, useState } from 'react';
import { STARTER_PROMPTS } from '../data/studyBuddy';
import { useStreakByteStore } from '../store/useStreakByteStore';
import { Icon } from './Icon';

export function StudyBuddyChat() {
  const chat = useStreakByteStore((s) => s.chat);
  const lastMistake = useStreakByteStore((s) => s.lastMistake);
  const setChatOpen = useStreakByteStore((s) => s.setChatOpen);
  const sendChatMessage = useStreakByteStore((s) => s.sendChatMessage);
  const [draft, setDraft] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chat.open) return;
    inputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChatOpen(false);
        fabRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chat.open, setChatOpen]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [chat.messages.length, chat.open, chat.isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendChatMessage(draft);
    setDraft('');
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        aria-label={chat.open ? 'Close study buddy chat' : 'Open study buddy chat'}
        aria-expanded={chat.open}
        aria-controls="study-buddy-chat"
        onClick={() => setChatOpen(!chat.open)}
        className={`fixed right-5 bottom-[calc(20px+env(safe-area-inset-bottom,0px))] z-40 grid place-items-center w-16 h-16 p-0 border-2 border-cyan rounded-full bg-panel2 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom,0px))] max-[760px]:right-3.5 max-[760px]:w-[58px] max-[760px]:h-[58px] ${
          chat.open ? 'max-[760px]:hidden' : ''
        }`}
      >
        <span className="buddy-logo w-12 h-12 max-[760px]:w-11 max-[760px]:h-11 block" aria-hidden="true" />
        {!chat.open && lastMistake && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber border-2 border-panel"
          />
        )}
      </button>

      {chat.open && (
        <section
          id="study-buddy-chat"
          role="dialog"
          aria-label="Study buddy chat"
          className="sb-pop fixed right-5 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] z-40 flex flex-col w-[380px] max-w-[calc(100vw-24px)] h-[min(540px,calc(100dvh-140px))] bg-panel border border-line rounded-2xl overflow-hidden max-[760px]:left-3 max-[760px]:right-3 max-[760px]:w-auto max-[760px]:max-w-none max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom,0px))] max-[760px]:h-[min(70dvh,calc(100dvh-150px))]"
        >
          <header className="flex items-center gap-3 px-3.5 py-3 border-b border-line">
            <span className="buddy-logo w-10 h-10 flex-none block" aria-hidden="true" />
            <div>
              <b className="block leading-tight">Study buddy</b>
              <small className="text-muted text-[0.8125rem]">Ask about your lessons</small>
            </div>
            <button
              type="button"
              onClick={() => {
                setChatOpen(false);
                fabRef.current?.focus();
              }}
              aria-label="Close chat"
              className="ml-auto grid place-items-center w-10 h-10 flex-none border border-transparent rounded-full bg-panel2 text-ink cursor-pointer transition-colors hover:border-muted"
            >
              <Icon name="x" />
            </button>
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
          >
            {chat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end max-w-[92%] ${
                  msg.role === 'me' ? 'self-end' : ''
                }`}
              >
                {msg.role === 'bot' && (
                  <span className="buddy-logo w-[30px] h-[30px] flex-none block" aria-hidden="true" />
                )}
                <p
                  className={`m-0 px-3.5 py-2.5 rounded-[14px] whitespace-pre-wrap break-words text-[0.9375rem] leading-[1.45] ${
                    msg.role === 'me'
                      ? 'bg-cyan text-cyan-ink rounded-br-[4px] font-medium'
                      : 'bg-panel2 text-ink rounded-bl-[4px]'
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            ))}

            {chat.isLoading && (
              <div
                className="flex gap-2 items-end max-w-[92%]"
                role="status"
                aria-label="BYTE is typing"
              >
                <span className="buddy-logo w-[30px] h-[30px] flex-none block" aria-hidden="true" />
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-[14px] rounded-bl-[4px] bg-panel2 text-muted">
                  <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-cyan animate-pulse [animation-delay:200ms]" />
                  <span className="w-2 h-2 rounded-full bg-cyan animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            )}
          </div>

          {chat.showSuggestions && (
            <div className="flex gap-2 flex-wrap px-4 pb-3">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={chat.isLoading}
                  onClick={() => sendChatMessage(prompt)}
                  className="min-h-10 px-3 border border-line rounded-full bg-transparent text-ink font-medium text-[0.8125rem] cursor-pointer transition-colors hover:bg-panel2 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {lastMistake && (
            <div className="px-3.5 pt-2.5 pb-1 border-t border-line bg-bg/50">
              <button
                type="button"
                disabled={chat.isLoading}
                onClick={() => sendChatMessage(lastMistake.prompt)}
                className="w-full flex items-center justify-between gap-2 min-h-10 px-3 py-2 rounded-xl border border-cyan/40 bg-cyan/10 text-left text-ink cursor-pointer transition-colors hover:bg-cyan/20 disabled:opacity-50"
              >
                <span className="min-w-0">
                  <b className="block text-xs text-cyan">Explain why I missed that</b>
                  <small className="block text-xs text-muted truncate">{lastMistake.summary}</small>
                </span>
                <Icon name="send" className="w-4 h-4 text-cyan flex-none" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-line">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              disabled={chat.isLoading}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={chat.isLoading ? 'BYTE is thinking…' : 'Ask a question…'}
              autoComplete="off"
              aria-label="Message"
              className="flex-1 min-w-0 min-h-11 px-3.5 border border-line rounded-[10px] bg-bg text-ink text-base focus-visible:outline-none focus-visible:border-cyan disabled:opacity-70"
            />
            <button
              type="submit"
              disabled={chat.isLoading || !draft.trim()}
              aria-label="Send"
              className="inline-flex items-center justify-center w-[46px] min-h-11 p-0 border border-cyan rounded-[10px] bg-cyan text-cyan-ink cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="send" className="w-[18px] h-[18px]" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
