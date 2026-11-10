
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend
} from "firebase/ai";

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

[역할]
- 매장의 경영과 운영을 돕는다.
- 매출, 지출, 상품, 재고 데이터를 분석한다.
- 현재 전달된 매장 데이터를 최우선으로 참고한다.

[답변 규칙]
- 항상 자연스러운 한국어로 답변한다.
- 친절하고 이해하기 쉽게 설명한다.
- 사용자를 대표님이라고 부르지 않는다.
- 실제 데이터에 없는 수치를 만들지 않는다.
- 데이터가 없으면 데이터가 없다고 알린다.
- 이전 대화와 현재 데이터를 함께 참고한다.
- 긴 답변은 제목과 목록으로 정리한다.
- 필요하면 Markdown 표와 가로 구분선을 사용한다.
- 문단을 적절하게 나누어 읽기 쉽게 작성한다.
- 매출과 상품의 실제 데이터에 근거해 답변한다.
`;

function getMemoryCollection() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  return collection(
    db,
    "users",
    user.uid,
    "aiMessages"
  );
}

export async function loadAIHistory() {
  const q = query(
    getMemoryCollection(),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .reverse();
}

function buildStoreContext(storeState = {}) {
  const sales = Array.isArray(storeState.sales)
    ? storeState.sales
    : [];

  const products = Array.isArray(storeState.products)
    ? storeState.products
    : [];

  const expenses = Array.isArray(storeState.expenses)
    ? storeState.expenses
    : [];

  const totalSales = sales.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const lowStockProducts = products.filter(
    item => Number(item.stock) <= 5
  );

  return {
    dataStatus: {
      sales: Array.isArray(storeState.sales)
        ? "연결됨"
        : "미연결",

      products: Array.isArray(storeState.products)
        ? "연결됨"
        : "미연결",

      expenses: Array.isArray(storeState.expenses)
        ? "연결됨"
        : "미연결"
    },

    summary: {
      salesCount: sales.length,
      totalSalesAmount: totalSales,

      productCount: products.length,
      lowStockCount: lowStockProducts.length,

      expenseCount: expenses.length,
      totalExpensesAmount: totalExpenses
    },

    sales: sales.map(item => ({
      name: item.name || "이름 없음",
      date: item.date || "날짜 없음",
      amount: Number(item.amount) || 0,
      status: item.status || "상태 없음"
    })),

    products: products.map(item => ({
      name: item.name || "이름 없음",
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0
    })),

    expenses: expenses.map(item => ({
      name: item.name || "이름 없음",
      date: item.date || "날짜 없음",
      amount: Number(item.amount) || 0
    }))
  };
}

export async function askAI(
  message,
  storeState = {},
  onChunk = () => {}
) {
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error("질문을 입력해 주세요.");
  }

  const history = await loadAIHistory();

  const conversation = history
    .map(item => {
      const speaker =
        item.role === "user" ? "사용자" : "AI";

      return `${speaker}: ${item.text}`;
    })
    .join("\n");

  const currentStore = buildStoreContext(storeState);

  const prompt = `
${SYSTEM_PROMPT}

========================
[현재 매장 데이터]
========================

${JSON.stringify(currentStore, null, 2)}

========================
[이전 대화 기록]
========================

${conversation || "이전 대화가 없습니다."}

========================
[새로운 질문]
========================

${cleanMessage}

현재 매장 데이터와 이전 대화를 참고하여
새로운 질문에 정확하게 답변해라.
`;

  let answer = "";

  try {
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();

      if (text) {
        answer += text;
        onChunk(answer);
      }
    }

    await result.response;
  } catch (error) {
    console.error("Gemini 요청 실패:", error);
    throw error;
  }

  if (!answer.trim()) {
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
