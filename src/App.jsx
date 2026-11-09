import { useState } from "react";
import {
  LayoutDashboard, TrendingUp, TrendingDown, Package,
  Boxes, BrainCircuit, Users, Megaphone, FileText,
  Settings, Search, Bell, Plus, ArrowUpRight,
  ArrowDownRight, ShoppingBag, Menu, X, ChevronRight,
  Wallet, CircleAlert, CalendarDays, Sparkles,
  MoreHorizontal, Eye, Download
} from "lucide-react";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const menuItems = [
  { name: "홈", icon: LayoutDashboard },
  { name: "매출 관리", icon: TrendingUp },
  { name: "지출 관리", icon: TrendingDown },
  { name: "상품 관리", icon: Package },
  { name: "재고 관리", icon: Boxes },
  { name: "AI 분석", icon: BrainCircuit },
  { name: "직원 공유", icon: Users },
  { name: "구매자 홍보", icon: Megaphone },
  { name: "보고서", icon: FileText },
  { name: "설정", icon: Settings }
];

const chartData = [
  { day: "1일", sales: 120000 },
  { day: "3일", sales: 180000 },
  { day: "5일", sales: 150000 },
  { day: "7일", sales: 240000 },
  { day: "9일", sales: 210000 },
  { day: "11일", sales: 320000 },
  { day: "13일", sales: 280000 },
  { day: "15일", sales: 390000 },
  { day: "17일", sales: 340000 },
  { day: "19일", sales: 460000 },
  { day: "21일", sales: 410000 },
  { day: "23일", sales: 520000 },
  { day: "25일", sales: 480000 },
  { day: "27일", sales: 610000 },
  { day: "29일", sales: 570000 }
];

const initialSales = [
  { id: 1, name: "무선 블루투스 이어폰", date: "11월 9일", amount: 39000, status: "결제 완료" },
  { id: 2, name: "스마트폰 거치대", date: "11월 9일", amount: 15000, status: "결제 완료" },
  { id: 3, name: "휴대용 보조배터리", date: "11월 8일", amount: 28000, status: "결제 완료" },
  { id: 4, name: "USB-C 충전 케이블", date: "11월 8일", amount: 9000, status: "결제 완료" }
];

const initialProducts = [
  { id: 1, name: "무선 블루투스 이어폰", price: 39000, stock: 12 },
  { id: 2, name: "스마트폰 거치대", price: 15000, stock: 4 },
  { id: 3, name: "휴대용 보조배터리", price: 28000, stock: 21 },
  { id: 4, name: "USB-C 충전 케이블", price: 9000, stock: 2 }
];

const money = value => Number(value || 0).toLocaleString("ko-KR") + "원";

function App() {
  const [active, setActive] = useState("홈");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sales, setSales] = useState(initialSales);
  const [products, setProducts] = useState(initialProducts);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [search, setSearch] = useState("");

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);

  function addSale(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    const newSale = {
      id: Date.now(),
      name: data.get("name"),
      date: "11월 9일",
      amount: Number(data.get("amount")),
      status: "결제 완료"
    };

    if (!newSale.name || newSale.amount <= 0) return;

    setSales([newSale, ...sales]);
    setShowSaleForm(false);
    event.target.reset();
  }

  function addProduct(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    const newProduct = {
      id: Date.now(),
      name: data.get("name"),
      price: Number(data.get("price")),
      stock: Number(data.get("stock"))
    };

    if (!newProduct.name || newProduct.price < 0) return;

    setProducts([...products, newProduct]);
    setShowProductForm(false);
    event.target.reset();
  }

  function renderPage() {
    switch (active) {
      case "홈":
        return <Dashboard
          sales={sales}
          products={products}
          totalSales={totalSales}
          onAddSale={() => setShowSaleForm(true)}
        />;

      case "매출 관리":
        return <SalesPage
          sales={sales}
          onAdd={() => setShowSaleForm(true)}
          search={search}
        />;

      case "지출 관리":
        return <ExpensesPage />;

      case "상품 관리":
        return <ProductsPage
          products={products}
          onAdd={() => setShowProductForm(true)}
          search={search}
        />;

      case "재고 관리":
        return <InventoryPage products={products} />;

      case "AI 분석":
        return <AIPage />;

      case "직원 공유":
        return <EmployeesPage />;

      case "구매자 홍보":
        return <PromotionPage products={products} />;

      case "보고서":
        return <ReportsPage />;

      case "설정":
        return <SettingsPage />;

      default:
        return <Dashboard
          sales={sales}
          products={products}
          totalSales={totalSales}
          onAddSale={() => setShowSaleForm(true)}
        />;
    }
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <TrendingUp size={22} />
          </div>
          <span>매출도우미</span>
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="store-label">WORKSPACE</div>

        <div className="store-selector">
          <div className="store-avatar">S</div>
          <div className="store-info">
            <strong>내 매장</strong>
            <span>기본 워크스페이스</span>
          </div>
          <ChevronRight size={17} />
        </div>

        <div className="menu-label">메뉴</div>

        <nav className="side-menu">
          {menuItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`menu-item ${active === item.name ? "active" : ""}`}
                onClick={() => {
                  setActive(item.name);
                  setMobileMenu(false);
                  setSearch("");
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {item.name === "AI 분석" && (
                  <span className="new-tag">AI</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon">
              <Sparkles size={18} />
            </div>
            <strong>무료 플랜</strong>
            <p>매출도우미를 이용해 주셔서 감사합니다.</p>
            <button onClick={() => setActive("설정")}>
              플랜 살펴보기 <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="profile">
            <div className="profile-avatar">U</div>
            <div className="profile-info">
              <strong>내 계정</strong>
              <span>사용자</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>매출도우미</span>
              <ChevronRight size={15} />
              <strong>{active}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="검색하기"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>

            <button className="icon-button notification-button">
              <Bell size={19} />
              <span />
            </button>

            <div className="top-avatar">U</div>
          </div>
        </header>

        <section className="page-content">
          {renderPage()}
        </section>

        <footer className="footer">
          <span>© 2026 매출도우미</span>
          <span>테스트 버전 · 데이터는 임시 저장됩니다.</span>
        </footer>
      </main>

      {showSaleForm && (
        <Modal title="새 매출 등록" onClose={() => setShowSaleForm(false)}>
          <form onSubmit={addSale} className="modal-form">
            <label>
              상품명
              <input name="name" placeholder="상품명을 입력하세요" required />
            </label>
            <label>
              판매 금액
              <input name="amount" type="number" min="1" placeholder="예: 30000" required />
            </label>
            <button className="primary-button" type="submit">
              매출 등록하기
            </button>
          </form>
        </Modal>
      )}

      {showProductForm && (
        <Modal title="새 상품 등록" onClose={() => setShowProductForm(false)}>
          <form onSubmit={addProduct} className="modal-form">
            <label>
              상품명
              <input name="name" placeholder="상품명을 입력하세요" required />
            </label>
            <label>
              판매 가격
              <input name="price" type="number" min="0" placeholder="예: 30000" required />
            </label>
            <label>
              재고 수량
              <input name="stock" type="number" min="0" placeholder="예: 10" required />
            </label>
            <button className="primary-button" type="submit">
              상품 등록하기
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function PageHeader({ title, description, action, onAction }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && (
        <button className="primary-button" onClick={onAction}>
          <Plus size={17} /> {action}
        </button>
      )}
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">
        {change && (
          <span className="stat-change">
            <ArrowUpRight size={14} /> {change}
          </span>
        )}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function Dashboard({ sales, products, totalSales, onAddSale }) {
  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <>
      <PageHeader
        title="안녕하세요! 👋"
        description="오늘의 매장 현황을 한눈에 확인해 보세요."
        action="매출 등록"
        onAction={onAddSale}
      />

      <div className="welcome-banner">
        <div>
          <span className="banner-eyebrow">SALES HELPER</span>
          <h2>사업 관리, 이제 한곳에서.</h2>
          <p>매출부터 재고까지 스마트하게 관리하세요.</p>
        </div>
        <div className="banner-decoration">
          <div className="banner-circle circle-one" />
          <div className="banner-circle circle-two" />
          <TrendingUp size={78} />
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>매장 현황</h2>
          <span>2026년 11월 기준 · 테스트 데이터</span>
        </div>
        <button className="text-button">
          <CalendarDays size={16} /> 이번 달
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="이번 달 매출"
          value={money(totalSales)}
          change="+12.8%"
          subtitle="지난달 대비"
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="총 지출"
          value="₩320,000"
          change="+4.2%"
          subtitle="지난달 대비"
          icon={TrendingDown}
          color="orange"
        />
        <StatCard
          title="예상 순이익"
          value={money(totalSales - 320000)}
          subtitle="매출 - 지출"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="판매 건수"
          value={`${sales.length}건`}
          subtitle="이번 달 누적"
          icon={ShoppingBag}
          color="purple"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h3>매출 추이</h3>
              <p>이번 달 매출 변화</p>
            </div>
            <button className="more-button">
              <MoreHorizontal size={21} />
            </button>
          </div>

          <div className="chart-legend">
            <span className="legend-dot" />
            매출
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3478f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3478f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#98a2b3", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#98a2b3", fontSize: 11 }}
                  tickFormatter={value => `${value / 10000}만`}
                />
                <Tooltip
                  formatter={value => money(value)}
                  contentStyle={{
                    border: "1px solid #edf0f5",
                    borderRadius: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3478f6"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel ai-panel">
          <div className="ai-heading">
            <div className="ai-icon"><Sparkles size={20} /></div>
            <span>AI INSIGHT</span>
          </div>
          <h3>매장 분석 요약</h3>
          <p className="ai-description">
            테스트 데이터 기반의 예시 분석입니다.
          </p>

          <div className="insight-item">
            <div className="insight-symbol positive">↗</div>
            <div>
              <strong>매출 증가 추세</strong>
              <p>이번 달 매출이 증가하는 흐름입니다.</p>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-symbol warning">!</div>
            <div>
              <strong>재고 확인 필요</strong>
              <p>재고가 적은 상품 {lowStock.length}개를 확인하세요.</p>
            </div>
          </div>

          <button className="ai-link" onClick={() => window.dispatchEvent(new Event("open-ai-page"))}>
            AI 분석 살펴보기 <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="dashboard-grid bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>최근 매출</h3>
              <p>최근 등록된 매출 내역</p>
            </div>
            <span className="panel-count">{sales.length}건</span>
          </div>
          <SalesTable sales={sales.slice(0, 4)} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>재고 알림</h3>
              <p>재고가 부족한 상품</p>
            </div>
            <CircleAlert size={19} className="warning-icon" />
          </div>

          {lowStock.length === 0 ? (
            <div className="empty-state">재고 부족 상품이 없습니다.</div>
          ) : lowStock.map(product => (
            <div className="stock-alert" key={product.id}>
              <div className="product-placeholder">
                <Package size={20} />
              </div>
              <div className="stock-alert-info">
                <strong>{product.name}</strong>
                <span>재고 {product.stock}개</span>
              </div>
              <badge className="stock-badge">부족</badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SalesTable({ sales }) {
  if (!sales.length) {
    return <div className="empty-state">등록된 매출이 없습니다.</div>;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th>날짜</th>
            <th>금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(item => (
            <tr key={item.id}>
              <td className="table-name">{item.name}</td>
              <td>{item.date}</td>
              <td className="table-money">{money(item.amount)}</td>
              <td><span className="status-pill">{item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SalesPage({ sales, onAdd, search }) {
  const filtered = sales.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="매출 관리"
        description="판매 내역을 등록하고 관리하세요."
        action="매출 등록"
        onAction={onAdd}
      />
      <div className="stats-grid compact-stats">
        <StatCard title="총 매출" value={money(sales.reduce((s, x) => s + x.amount, 0))} icon={Wallet} color="blue" subtitle="현재 등록된 매출" />
        <StatCard title="판매 건수" value={`${sales.length}건`} icon={ShoppingBag} color="purple" subtitle="전체 등록 건수" />
      </div>
      <div className="panel">
        <div className="panel-header">
          <div><h3>전체 매출 내역</h3><p>등록된 매출을 확인하세요.</p></div>
          <button className="secondary-button"><Download size={16} /> 내보내기</button>
        </div>
        <SalesTable sales={filtered} />
      </div>
    </>
  );
}

function ExpensesPage() {
  return (
    <>
      <PageHeader title="지출 관리" description="매장의 지출을 기록하고 관리하세요." />
      <div className="stats-grid compact-stats">
        <StatCard title="이번 달 지출" value="₩320,000" icon={TrendingDown} color="orange" subtitle="테스트 데이터" />
        <StatCard title="지출 건수" value="4건" icon={FileText} color="purple" subtitle="테스트 데이터" />
      </div>
      <div className="panel">
        <div className="panel-header"><div><h3>지출 내역</h3><p>예시 지출 데이터</p></div></div>
        <div className="simple-list">
          {[
            ["상품 매입 비용", "₩180,000"],
            ["배송비", "₩60,000"],
            ["포장재 구매", "₩45,000"],
            ["광고비", "₩35,000"]
          ].map(([name, amount]) => (
            <div className="simple-list-row" key={name}>
              <span>{name}</span><strong>{amount}</strong>
            </div>
          ))}
        </div>
        <div className="empty-note">지출 등록 기능은 다음 개발 단계에서 구현합니다.</div>
      </div>
    </>
  );
}

function ProductsPage({ products, onAdd, search }) {
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader title="상품 관리" description="판매 중인 상품과 가격을 관리하세요." action="상품 등록" onAction={onAdd} />
      <div className="panel">
        <div className="panel-header"><div><h3>내 상품</h3><p>총 {products.length}개 상품</p></div></div>
        <div className="product-grid">
          {filtered.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image"><Package size={34} /></div>
              <div className="product-card-content">
                <strong>{product.name}</strong>
                <h3>{money(product.price)}</h3>
                <span>재고 {product.stock}개</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function InventoryPage({ products }) {
  return (
    <>
      <PageHeader title="재고 관리" description="상품별 재고 현황을 확인하세요." />
      <div className="stats-grid compact-stats">
        <StatCard title="등록 상품" value={`${products.length}개`} icon={Package} color="blue" subtitle="전체 상품" />
        <StatCard title="재고 부족" value={`${products.filter(p => p.stock <= 5).length}개`} icon={CircleAlert} color="orange" subtitle="5개 이하 상품" />
      </div>
      <div className="panel">
        <div className="panel-header"><div><h3>재고 현황</h3><p>상품별 현재 수량</p></div></div>
        <div className="simple-list">
          {products.map(product => (
            <div className="inventory-row" key={product.id}>
              <div><strong>{product.name}</strong><span>{money(product.price)}</span></div>
              <strong className={product.stock <= 5 ? "low-stock" : "normal-stock"}>{product.stock}개</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AIPage() {
  return (
    <>
      <PageHeader title="AI 분석" description="AI가 매장의 데이터를 분석하고 인사이트를 제공합니다." />
      <div className="ai-big-card">
        <div className="ai-icon large"><Sparkles size={28} /></div>
        <h2>매장의 가능성을 분석해 보세요.</h2>
        <p>매출과 지출 데이터를 바탕으로 유용한 분석을 제공할 예정입니다.</p>
        <span className="coming-label">AI 연결 준비 중</span>
      </div>
      <div className="stats-grid">
        <StatCard title="매출 분석" value="준비 중" icon={TrendingUp} color="blue" subtitle="매출 추세 분석" />
        <StatCard title="재고 예측" value="준비 중" icon={Boxes} color="orange" subtitle="재고 부족 예측" />
        <StatCard title="판매 추천" value="준비 중" icon={BrainCircuit} color="purple" subtitle="상품 판매 분석" />
      </div>
    </>
  );
}

function EmployeesPage() {
  return (
    <>
      <PageHeader title="직원 공유" description="직원을 초대하고 업무 권한을 관리하세요." />
      <div className="panel">
        <div className="empty-illustration"><Users size={38} /></div>
        <h3 className="center-title">함께 매장을 관리해 보세요.</h3>
        <p className="center-description">직원 초대와 권한 설정 기능을 준비하고 있습니다.</p>
        <div className="feature-list">
          <div><Users size={18} /> 직원 초대</div>
          <div><Eye size={18} /> 매출·재고 열람 권한</div>
          <div><Settings size={18} /> 역할별 권한 설정</div>
        </div>
      </div>
    </>
  );
}

function PromotionPage({ products }) {
  return (
    <>
      <PageHeader title="구매자 홍보" description="구매자에게 보여줄 상품 홍보 페이지를 관리하세요." />
      <div className="promotion-info">
        <Megaphone size={23} />
        <div><strong>구매자 공개 페이지</strong><p>공개 상품 정보만 구매자에게 표시하도록 설계됩니다.</p></div>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image"><ShoppingBag size={34} /></div>
            <div className="product-card-content">
              <strong>{product.name}</strong>
              <h3>{money(product.price)}</h3>
              <span>공개 페이지 연결 준비 중</span>
            </div>
          </div>
        ))}
      </div>
      <p className="privacy-note">구매자 페이지에는 판매 원가, 순이익, 내부 통계 및 직원 정보가 노출되지 않도록 별도 공개 데이터를 사용해야 합니다.</p>
    </>
  );
}

function ReportsPage() {
  return (
    <>
      <PageHeader title="보고서" description="매장의 운영 현황을 보고서로 확인하세요." />
      <div className="panel report-card">
        <FileText size={42} />
        <h3>보고서 기능 준비 중</h3>
        <p>매출·지출·재고 데이터를 모아 보고서를 생성할 예정입니다.</p>
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" description="계정과 매장 환경을 관리하세요." />
      <div className="panel settings-list">
        {[
          ["계정 정보", "프로필과 로그인 정보 관리"],
          ["매장 정보", "매장 이름과 기본 정보"],
          ["직원 권한", "직원별 접근 권한 관리"],
          ["알림 설정", "알림 수신 환경 관리"],
          ["요금제", "무료 및 유료 플랜 확인"]
        ].map(([title, description]) => (
          <div className="settings-row" key={title}>
            <div><strong>{title}</strong><span>{description}</span></div>
            <ChevronRight size={19} />
          </div>
        ))}
      </div>
    </>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-button" onClick={onClose}><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default App;
