
import { useEffect, useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  Minus
} from "lucide-react";

import { askAI, loadAIHistory } from "../services/ai";
import "../styles/ai.css";

const greeting = {
  role: "assistant",
  text: "안녕하세요! 매출도우미 AI입니다. 매장 관리를 무엇부터 도와드릴까요?"
};

export default function AIFloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([greeting]);

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
        console.error("AI 대화 기록 불러오기 실패:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const suggestions = [
    "오늘 매출 분석해 줘",
    "인기 상품을 알려 줘",
    "재고 부족 상품을 알려 줘",
    "다음 달 매출을 예측해 줘"
  ];

  async function sendMessage(value = input) {
    const message = value.trim();

    if (!message || loading) return;

    setMessages(prev => [
      ...prev,
      { role: "user", text: message }
    ]);

    setInput("");
    setLoading(true);

    try {
      const answer = await askAI(message);

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: answer }
      ]);
    } catch (error) {
      console.error("Gemini AI 오류:", error);

      let errorMessage =
        "AI 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.";

      if (error.code === "permission-denied") {
        errorMessage =
          "대화 기록 저장 권한이 없습니다. Firebase 보안 규칙을 확인해 주세요.";
      } else if (
        error.message?.toLowerCase().includes("app check")
      ) {
        errorMessage =
          "Firebase App Check 설정을 확인해 주세요.";
      } else if (
        error.message?.toLowerCase().includes("quota")
      ) {
        errorMessage =
          "AI 무료 사용 한도에 도달했을 수 있습니다. 잠시 후 다시 시도해 주세요.";
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: errorMessage }
      ]);
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
                <Bot size={21} />
              </div>

              <div>
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
                aria-label="채팅 최소화"
              >
                <Minus size={19} />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="채팅 닫기"
              >
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
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message assistant">
                <div className="ai-message-avatar">
                  <Bot size={16} />
                </div>

                <div className="ai-message-bubble">
                  답변을 작성하고 있어요...
                </div>
              </div>
            )}

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
              onChange={event => setInput(event.target.value)}
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
            Gemini AI · 대화 기록은 계정별로 저장됩니다.
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
