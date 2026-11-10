
import { useEffect, useState, useRef } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  Minus,
  Copy,
  Check
} from "lucide-react";

import { askAI, loadAIHistory } from "../services/ai";
import "../styles/ai.css";

const greeting = {
  role: "assistant",
  text: "안녕하세요! 매출도우미 AI입니다. 매장 관리를 무엇부터 도와드릴까요?"
};

function MarkdownMessage({ text }) {
  return (
    <div className="ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          hr: () => (
            <hr className="ai-markdown-divider" />
          ),

          table: ({ children }) => (
            <div className="ai-markdown-table-wrap">
              <table>{children}</table>
            </div>
          ),

          pre: ({ children }) => (
            <pre className="ai-code-block">
              {children}
            </pre>
          ),

          code: ({ children, className }) => {
            const inline = !className;

            return (
              <code
                className={
                  inline
                    ? "ai-inline-code"
                    : `ai-code ${className || ""}`
                }
              >
                {children}
              </code>
            );
          },

          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          blockquote: ({ children }) => (
            <blockquote className="ai-markdown-quote">
              {children}
            </blockquote>
          )
        }}
      >
        {text || " "}
      </ReactMarkdown>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  }

  return (
    <button
      type="button"
      className="ai-copy-button"
      onClick={copyText}
      aria-label="답변 복사"
    >
      {copied ? (
        <Check size={15} />
      ) : (
        <Copy size={15} />
      )}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

export default function AIFloatingAssistant({
  sales = [],
  products = []
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([greeting]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let active = true;

    loadAIHistory()
      .then(history => {
        if (!active || history.length === 0) return;

        setMessages([
          greeting,
          ...history.map(item => ({
            role: item.role,
            text: item.text
          }))
        ]);
      })
      .catch(error => {
        console.error("AI 기록 불러오기 실패:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  const suggestions = [
    "현재 매장 상황을 분석해 줘",
    "인기 상품을 알려 줘",
    "재고 부족 상품을 알려 줘",
    "매출을 높일 방법을 추천해 줘"
  ];

  async function sendMessage(value = input) {
    const message = value.trim();

    if (!message || loading) return;

    const responseId =
      `${Date.now()}-${Math.random()}`;

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        text: message
      },
      {
        id: responseId,
        role: "assistant",
        text: "",
        streaming: true
      }
    ]);

    setInput("");
    setLoading(true);

    try {
      const answer = await askAI(
        message,
        {
          sales,
          products
        },
        streamedText => {
          setMessages(prev =>
            prev.map(item =>
              item.id === responseId
                ? {
                    ...item,
                    text: streamedText
                  }
                : item
            )
          );
        }
      );

      setMessages(prev =>
        prev.map(item =>
          item.id === responseId
            ? {
                ...item,
                text: answer,
                streaming: false
              }
            : item
        )
      );
    } catch (error) {
      console.error("Gemini AI 오류:", error);

      let errorMessage =
        "AI 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.";

      if (
        error.code === "permission-denied"
      ) {
        errorMessage =
          "대화 기록 저장 권한이 없습니다. Firebase 보안 규칙을 확인해 주세요.";
      } else if (
        error.code === "resource-exhausted" ||
        error.message?.toLowerCase().includes("quota")
      ) {
        errorMessage =
          "AI 무료 사용 한도에 도달했을 수 있습니다.";
      } else if (
        error.message?.toLowerCase().includes("app check")
      ) {
        errorMessage =
          "Firebase App Check 설정을 확인해 주세요.";
      } else if (error.message) {
        errorMessage = `AI 오류: ${error.message}`;
      }

      setMessages(prev =>
        prev.map(item =>
          item.id === responseId
            ? {
                ...item,
                text: errorMessage,
                streaming: false
              }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="ai-chat-window">

          <div className="ai-chat-header">
            <div className="ai-chat-brand">
              <div className="ai-avatar">
                <Bot size={22} />
              </div>

              <div className="ai-brand-text">
                <strong>매출도우미 AI</strong>
                <span>
                  <i /> Gemini AI
                </span>
              </div>
            </div>

            <div className="ai-chat-controls">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="최소화"
              >
                <Minus size={19} />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          <div className="ai-chat-status">
            <span className="ai-status-dot" />
            매장 데이터 연결
            <span className="ai-status-count">
              상품 {products.length}개 · 매출 {sales.length}건
            </span>
          </div>

          <div className="ai-chat-messages">

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`ai-message ${message.role}`}
              >
                {message.role === "assistant" && (
                  <div className="ai-message-avatar">
                    <Bot size={17} />
                  </div>
                )}

                <div className="ai-message-content">
                  <div className="ai-message-bubble">
                    {message.role === "assistant" ? (
                      <>
                        {message.text ? (
                          <MarkdownMessage text={message.text} />
                        ) : (
                          <div className="ai-thinking">
                            <span />
                            <span />
                            <span />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="ai-user-text">
                        {message.text}
                      </div>
                    )}
                  </div>

                  {message.role === "assistant" &&
                    message.text &&
                    !message.streaming && (
                      <CopyButton text={message.text} />
                    )}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="ai-suggestions">
                <span>추천 질문</span>

                {suggestions.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendMessage(item)}
                  >
                    <Sparkles size={14} />
                    {item}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          <form
            className="ai-chat-input"
            onSubmit={event => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={event =>
                setInput(event.target.value)
              }
              placeholder="AI에게 질문하기..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="메시지 전송"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="ai-chat-footer">
            AI 답변은 실제 연결된 매장 데이터를 참고합니다.
          </div>

        </div>
      )}

      <button
        className={`ai-floating-button ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="AI 비서 열기"
      >
        {open ? (
          <X size={25} />
        ) : (
          <MessageCircle size={25} />
        )}

        {!open && (
          <span className="ai-button-glow" />
        )}
      </button>
    </>
  );
}
