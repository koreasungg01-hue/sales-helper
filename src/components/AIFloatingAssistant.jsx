
import { useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  Minus
} from "lucide-react";
import "../styles/ai.css";

export default function AIFloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "안녕하세요! 매출도우미 AI입니다. 매장 관리를 무엇부터 도와드릴까요?"
    }
  ]);

  const suggestions = [
    "오늘 매출 분석해 줘",
    "인기 상품을 알려 줘",
    "재고 부족 상품을 알려 줘",
    "다음 달 매출을 예측해 줘"
  ];

  function sendMessage(value = input) {
    const message = value.trim();

    if (!message) return;

    setMessages(prev => [
      ...prev,
      { role: "user", content: message },
      {
        role: "assistant",
        content:
          "질문을 받았어요! 현재 AI 서버 연결을 준비 중입니다. 다음 개발 단계에서 실제 매출·상품·재고 데이터를 분석하도록 연결할게요."
      }
    ]);

    setInput("");
  }

  return (
    <>
      {open && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-brand">
              <div className="ai-avatar">
                <Bot size={21} />
              </div>

              <div>
                <strong>매출도우미 AI</strong>
                <span>
                  <i /> AI 비서
                </span>
              </div>
            </div>

            <div className="ai-chat-controls">
              <button onClick={() => setOpen(false)}>
                <Minus size={19} />
              </button>

              <button onClick={() => setOpen(false)}>
                <X size={19} />
              </button>
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`ai-message ${message.role}`}
              >
                {message.role === "assistant" && (
                  <div className="ai-message-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div className="ai-message-bubble">
                  {message.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="ai-suggestions">
                <span>추천 질문</span>

                {suggestions.map(item => (
                  <button
                    key={item}
                    onClick={() => sendMessage(item)}
                  >
                    <Sparkles size={14} />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="ai-chat-input"
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="AI에게 질문하기..."
            />

            <button
              type="submit"
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </form>

          <div className="ai-chat-footer">
            AI 답변은 실제 매장 데이터 연결 후 제공됩니다.
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
        {!open && <span className="ai-button-glow" />}
      </button>
    </>
  );
}
