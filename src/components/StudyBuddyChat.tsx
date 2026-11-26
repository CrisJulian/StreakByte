import { useEffect, useRef, useState } from 'react';
import { STARTER_PROMPTS } from '../data/studyBuddy';
import { useStreakByteStore } from '../store/useStreakByteStore';
import { Icon } from './Icon';

export function StudyBuddyChat() {
  const chat = useStreakByteStore((s) => s.chat);
  const lastMistake = useStreakByteStore((s) => s.lastMistake);
  const inActiveDuel = useStreakByteStore((s) => s.activeDuel?.status === 'active');
  const inActiveQuiz = useStreakByteStore(
    (s) => s.view === 'quiz' && Boolean(s.quiz) && !s.quiz?.submitted,
  );
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
        className={`fixed right-5 bottom-[calc(20px+env(safe-area-inset-bottom,0px))] z-40 grid place-items-center w-[58px] h-[58px] p-0 border-2 border-ink bg-panel shadow-[4px_4px_0_var(--cyan)] cursor-pointer transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 max-[760px]:bottom-[calc(72px+env(safe-area-inset-bottom,0px))] max-[760px]:right-3.5 max-[760px]:w-[52px] max-[760px]:h-[52px] ${chat.open ? 'max-[760px]:hidden' : ''
          }`}
      >
        <span className="buddy-logo w-11 h-11 max-[760px]:w-10 max-[760px]:h-10 block" aria-hidden="true" />
        {!chat.open && lastMistake && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber border-2 border-panel"
          />
        )}
      </button>

      {chat.open && (
        <section
          id="study-buddy-chat"
          role="dialog"
          aria-label="Study buddy chat"
          className="sb-pop fixed right-5 bottom-[calc(92px+env(safe-area-inset-bottom,0px))] z-40 flex flex-col w-[380px] max-w-[calc(100vw-24px)] h-[min(520px,calc(100dvh-130px))] bg-panel border border-ink shadow-[6px_6px_0_rgba(20,20,20,0.22)] overflow-hidden max-[760px]:left-3 max-[760px]:right-3 max-[760px]:w-auto max-[760px]:max-w-none max-[760px]:bottom-[calc(72px+env(safe-area-inset-bottom,0px))] max-[760px]:h-[min(70dvh,calc(100dvh-150px))]"
        >
          <header className="flex items-center gap-3 px-3.5 py-3 bg-[var(--dark-card)] text-white border-b border-[var(--dark-line)]">
            <span className="buddy-logo w-9 h-9 flex-none block" aria-hidden="true" />
            <div className="min-w-0">
              <b className="block text-[11px] uppercase tracking-[0.08em] leading-tight">
                Study buddy // BYTE-01
              </b>
              <small className="text-white/65 text-[10.5px]">
                {inActiveDuel
                  ? '1v1 Duel active · Anti-cheat on'
                  : inActiveQuiz
                    ? 'Quiz coaching · Hints only, no spoilers'
                    : 'Ask about your lessons'}
              </small>
            </div>
            <button
              type="button"
              onClick={() => {
                setChatOpen(false);
                fabRef.current?.focus();
              }}
              aria-label="Close chat"
              className="ml-auto grid place-items-center w-8 h-8 flex-none border border-[var(--dark-line)] bg-transparent text-white cursor-pointer transition-colors hover:border-white"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-3.5 bg-panel2 flex flex-col gap-2.5"
          >
            {chat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end max-w-[90%] ${msg.role === 'me' ? 'self-end' : ''
                  }`}
              >
                {msg.role === 'bot' && (
                  <span className="buddy-logo w-7 h-7 flex-none block" aria-hidden="true" />
                )}
                <p
                  className={`m-0 px-3 py-2.5 border whitespace-pre-wrap break-words text-[12px] leading-[1.45] ${msg.role === 'me'
                      ? 'bg-[var(--dark-card)] text-white border-[var(--dark-card)] font-medium'
                      : 'bg-panel text-ink border-line'
                    }`}
                >
                  {msg.text}
                </p>
              </div>
            ))}

            {chat.isLoading && (
              <div
                className="flex gap-2 items-end max-w-[90%]"
                role="status"
                aria-label="BYTE is typing"
              >
                <span className="buddy-logo w-7 h-7 flex-none block" aria-hidden="true" />
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 border border-line bg-panel text-muted">
                  <span className="w-1.5 h-1.5 bg-cyan animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-cyan animate-pulse [animation-delay:200ms]" />
                  <span className="w-1.5 h-1.5 bg-cyan animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            )}
          </div>

          {chat.showSuggestions && !inActiveDuel && (
            <div className="flex gap-1.5 flex-wrap px-3.5 py-2.5 border-t border-line bg-panel">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={chat.isLoading}
                  onClick={() => sendChatMessage(prompt)}
                  className="min-h-8 px-2.5 py-1 border border-line bg-panel text-ink font-semibold text-[10.5px] cursor-pointer transition-colors hover:border-ink hover:bg-panel2 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {lastMistake && !inActiveDuel && (
            <div className="px-3.5 pt-2 pb-1 border-t border-line bg-panel">
              <button
                type="button"
                disabled={chat.isLoading}
                onClick={() => sendChatMessage(lastMistake.prompt)}
                className="w-full flex items-center justify-between gap-2 min-h-9 px-3 py-1.5 border border-cyan bg-you text-left text-ink cursor-pointer transition-colors hover:brightness-95 disabled:opacity-50"
              >
                <span className="min-w-0">
                  <b className="block text-[10.5px] uppercase tracking-[0.05em] text-cyan">
                    Explain why I missed that
                  </b>
                  <small className="block text-[11px] text-muted truncate">{lastMistake.summary}</small>
                </span>
                <Icon name="send" className="w-4 h-4 text-cyan flex-none" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-line bg-panel">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              disabled={chat.isLoading}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={chat.isLoading ? 'BYTE is thinking…' : 'Ask a question…'}
              autoComplete="off"
              aria-label="Message"
              className="flex-1 min-w-0 min-h-10 px-3 border border-line bg-bg text-ink text-xs focus-visible:outline-none focus-visible:border-ink disabled:opacity-70"
            />
            <button
              type="submit"
              disabled={chat.isLoading || !draft.trim()}
              aria-label="Send"
              className="sb-cut-sm inline-flex items-center justify-center w-11 min-h-10 p-0 border border-cyan bg-cyan text-cyan-ink cursor-pointer transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="send" className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
