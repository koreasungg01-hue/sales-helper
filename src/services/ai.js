
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

[역할]
- 매장의 현재 상황을 분석한다.
- 매출, 지출, 상품, 재고를 관리하도록 돕는다.
- 전달받은 실제 데이터를 적극적으로 활용한다.

[답변 규칙]
- 항상 한국어로 답변한다.
- 친절하고 이해하기 쉽게 설명한다.
- 실제 데이터에 없는 수치를 절대로 만들어내지 않는다.
- 데이터가 부족하면 부족하다고 알린다.
- 이전 대화와 현재 매장 데이터를 함께 참고한다.
- 질문에 직접적으로 답변한다.
- 사용자를 대표님이라고 부르지 않는다.
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

// AI에게 전달할 현재 매장 데이터 정리
function buildStoreContext(storeState = {}) {
  const sales = Array.isArray(storeState.sales)
    ? storeState.sales
    : [];

  const products = Array.isArray(storeState.products)
    ? storeState.products
    : [];

  const totalSales = sales.reduce(
    (sum, sale) => sum + (Number(sale.amount) || 0),
    0
  );

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    product => Number(product.stock) <= 5
  );

  return {
    dataStatus: {
      salesLoaded: Array.isArray(storeState.sales),
      productsLoaded: Array.isArray(storeState.products)
    },

    summary: {
      salesCount: sales.length,
      totalSalesAmount: totalSales,
      productCount: totalProducts,
      lowStockCount: lowStockProducts.length
    },

    sales: sales.map(sale => ({
      name: sale.name,
      date: sale.date,
      amount: Number(sale.amount) || 0,
      status: sale.status
    })),

    products: products.map(product => ({
      name: product.name,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0
    }))
  };
}

export async function askAI(message, storeState = {}) {
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

====================
[현재 매장 상태]
====================

${JSON.stringify(currentStore, null, 2)}

====================
[이전 대화 기록]
====================

${conversation || "이전 대화가 없습니다."}

====================
[사용자의 새로운 질문]
====================

${cleanMessage}

위의 현재 매장 상태와 이전 대화 기록을 참고하여
사용자의 질문에 정확하게 답변해라.
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
      throw new Error(
        "AI 응답 시간이 30초를 초과했습니다."
      );
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
