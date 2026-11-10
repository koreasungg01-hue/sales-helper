
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";

import app, { auth, db } from "./firebase";

const ai = getAI(app, {
  backend: new GoogleAIBackend()
});

const model = getGenerativeModel(ai, {
  model: "gemini-3.8-flash"
});

const SYSTEM_PROMPT = `
너는 매출도우미의 전문 AI 비서다.

- 항상 한국어로 답변한다.
- 친절하고 간결하게 설명한다.
- 매출, 지출, 상품, 재고 관리에 전문적으로 답변한다.
- 실제로 전달받지 않은 수치를 지어내지 않는다.
- 데이터가 없으면 없다고 알린다.
- 이전 대화 내용을 참고한다.
`;

function getMemoryCollection() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  return collection(db, "users", user.uid, "aiMessages");
}

export async function loadAIHistory() {
  const q = query(
    getMemoryCollection(),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })).reverse();
}

export async function askAI(message) {
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error("질문을 입력해 주세요.");
  }

  const history = await loadAIHistory();

  const conversation = history
    .map(item => {
      const speaker = item.role === "user" ? "사용자" : "AI";
      return `${speaker}: ${item.text}`;
    })
    .join("\n");

  const prompt = `
${SYSTEM_PROMPT}

[이전 대화]
${conversation || "이전 대화가 없습니다."}

[새 질문]
사용자: ${cleanMessage}

AI:
`;

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, 30000);

  let answer;

  try {
    const result = await model.generateContent(prompt, {
      signal: controller.signal
    });

    answer = result.response.text();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI 응답 시간이 30초를 초과했습니다. 연결 상태나 모델 설정을 확인해 주세요.");
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!answer) {
    throw new Error("AI가 답변을 생성하지 못했습니다.");
  }

  const messages = getMemoryCollection();

  await addDoc(messages, {
    role: "user",
    text: cleanMessage,
    createdAt: serverTimestamp()
  });

  await addDoc(messages, {
    role: "assistant",
    text: answer,
    createdAt: serverTimestamp()
  });

  return answer;
}
