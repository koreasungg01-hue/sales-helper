import { useState } from "react";
import { loginUser, registerUser, loginWithGoogle } from "./services/auth";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
    } catch (err) {
      const messages = {
        "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "auth/email-already-in-use": "이미 가입된 이메일입니다.",
        "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
        "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
        "auth/popup-closed-by-user": "Google 로그인이 취소되었습니다."
      };

      setError(messages[err.code] || "로그인에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
    } catch (err) {
      setError(
        err.code === "auth/popup-closed-by-user"
          ? "Google 로그인이 취소되었습니다."
          : "Google 로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">↗</div>
          <strong>매출도우미</strong>
        </div>

        <h1>
          {mode === "login" ? "다시 만나서 반가워요!" : "새 계정 만들기"}
        </h1>

        <p className="auth-description">
          {mode === "login"
            ? "로그인하고 매장 관리를 시작하세요."
            : "매출도우미와 함께 스마트하게 관리하세요."}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">
            이메일
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </label>

          <label className="auth-label">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호 6자 이상"
              minLength={6}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "처리 중..."
              : mode === "login"
                ? "로그인"
                : "회원가입"}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <button
          className="auth-google"
          onClick={handleGoogle}
          disabled={loading}
        >
          <strong>G</strong> Google로 계속하기
        </button>

        <div className="auth-switch">
          {mode === "login"
            ? "아직 계정이 없으신가요?"
            : "이미 계정이 있으신가요?"}

          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "회원가입" : "로그인"}
          </button>
        </div>

        <p className="auth-footer">
          © 2026 매출도우미
        </p>
      </div>
    </div>
  );
}
