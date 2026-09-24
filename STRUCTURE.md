# 📁 Estrutura de Pastas do Projeto

## Visão Atual → Visão Futura

### Antes (Monolito)
```
App_Financas/
├── index.html              (1000+ linhas — CSS + JS inline)
├── financas.html           (1970+ linhas — CSS + JS inline)
├── life-dashboard.html     (2000+ linhas — CSS + JS inline)
└── README.md
```

### Depois (Modular)
```
App_Financas/
│
├── index.html              (150 linhas — apenas markup)
├── financas.html           (250 linhas — apenas markup)
├── life-dashboard.html     (300 linhas — apenas markup)
│
├── css/
│   ├── shared.css          (CSS compartilhado: variáveis, reset, tema)
│   ├── components.css      (Componentes reutilizáveis)
│   ├── layout.css          (Grid, flexbox, espaçamento)
│   ├── financas.css        (Estilos específicos do módulo)
│   └── life-dashboard.css  (Estilos específicos do módulo)
│
├── js/
│   ├── shared/
│   │   ├── theme.js        ✅ (Criado)
│   │   ├── storage.js      ✅ (Criado)
│   │   ├── formatters.js   ✅ (Criado)
│   │   ├── utils.js        ✅ (Criado)
│   │   └── README.md       ✅ (Criado)
│   │
│   ├── financas/
│   │   ├── state.js        (Estrutura de dados, defaults)
│   │   ├── logic.js        (Cálculos: ciclos, orçamento, etc)
│   │   ├── ui.js           (Renderização: cards, gráficos)
│   │   └── handlers.js     (Event listeners)
│   │
│   └── life-dashboard/
│       ├── state.js        (Estrutura de dados)
│       ├── logic.js        (Cálculos: hábitos, produtividade)
│       ├── ui.js           (Renderização: calendário, cards)
│       └── handlers.js     (Event listeners)
│
├── docs/
│   ├── ARCHITECTURE.md     (Decisões de design e padrões)
│   ├── DATA_MODEL.md       (Estrutura de dados com JSDoc)
│   ├── CONTRIBUTING.md     (Como contribuir)
│   └── CHANGELOG.md        (Histórico de versões)
│
├── README.md               (Documentação principal)
├── STRUCTURE.md            (Este arquivo)
└── .gitignore
```

---

## 📊 Organização de CSS

### **shared.css** (~200 linhas)
Fundação do design system, usado por todos.

```css
:root {
  /* Variáveis de cor */
  --bg: #fbf5ff;
  --card: #ffffff;
  --pink: #ffd7e6;
  /* ... etc ... */

  /* Variáveis de espaçamento */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;

  /* Variáveis de tipografia */
  --font-display: "Trebuchet MS", sans-serif;
  --font-body: "Segoe UI", sans-serif;

  /* Variáveis de transição */
  --transition: 200ms ease;
}

/* Reset global */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-body); }

/* Tema escuro */
[data-theme="dark"] {
  --bg: #191623;
  /* ... etc ... */
}
```

### **components.css** (~300 linhas)
Componentes reutilizáveis: botões, cards, inputs, etc.

```css
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 16px;
  box-shadow: var(--shadow);
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 9px 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.btn-pink { background: var(--pink-deep); color: white; }
.btn-ghost { background: var(--bg2); }

input, select {
  border: 2px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  /* ... etc ... */
}
```

### **layout.css** (~200 linhas)
Grids, flexbox, espaçamento responsivo.

```css
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.flex { display: flex; align-items: center; }
.between { justify-content: space-between; }
.gap-md { gap: 16px; }

@media (max-width: 760px) {
  .grid-2 { grid-template-columns: 1fr; }
}
```

### **financas.css** (~500 linhas)
Estilos específicos do módulo financeiro.

```css
#dashboard { display: grid; grid-template-columns: repeat(12, 1fr); }
.stat-pill { /* ... */ }
.transaction-item { /* ... */ }
/* ... estilos específicos ... */
```

### **life-dashboard.css** (~500 linhas)
Estilos específicos do life dashboard.

```css
.sidebar { width: 220px; /* ... */ }
.planner-grid { /* ... */ }
.habit-card { /* ... */ }
/* ... estilos específicos ... */
```

---

## 🧩 Organização de JavaScript

### **js/shared/** ✅ CONCLUÍDO
Módulos compartilhados reutilizáveis.

- `theme.js` — Gerenciador de tema
- `storage.js` — Abstração de localStorage
- `formatters.js` — Formatação de valores
- `utils.js` — Funções auxiliares

### **js/financas/** ⬜ PRÓXIMO
Refatorar as ~1970 linhas de JavaScript de `financas.html`:

**state.js** (~150 linhas)
```javascript
// Estrutura de dados, defaults, migrações
const FinancesDefaults = { /* ... */ };
const FinancesState = { /* ... */ };
```

**logic.js** (~400 linhas)
```javascript
// Cálculos puros: getCycleSummary, getFaturaSplit, etc
// Sem efeitos colaterais ou manipulação de DOM
const FinancesLogic = {
  getCycleSummary: (cycleName) => { /* ... */ },
  calculateMood: () => { /* ... */ }
};
```

**ui.js** (~600 linhas)
```javascript
// Apenas renderização
const FinancesUI = {
  renderStats: () => { /* ... */ },
  renderDashboard: () => { /* ... */ }
};
```

**handlers.js** (~300 linhas)
```javascript
// Apenas event listeners
const FinancesHandlers = {
  init: () => { /* wire up all listeners */ }
};
```

### **js/life-dashboard/** ⬜ PRÓXIMO
Estrutura similar para o life dashboard.

---

## 🔗 Fluxo de Carregamento (index.html)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- CSS -->
  <link rel="stylesheet" href="css/shared.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/layout.css">

  <!-- Não precisa de CSS específico (index é simples) -->
</head>
<body data-theme="light">
  <!-- Markup mínimo -->
  <div class="wrap">
    <header class="hero">...</header>
    <div class="overview">...</div>
  </div>

  <!-- Módulos compartilhados -->
  <script src="js/shared/theme.js"></script>
  <script src="js/shared/storage.js"></script>
  <script src="js/shared/formatters.js"></script>
  <script src="js/shared/utils.js"></script>

  <!-- App do index (minimal) -->
  <script>
    (async () => {
      Theme.init();

      // Lê dados de financas e life-dashboard do Storage
      const financeData = await Storage.get('finance-state-cute');
      const lifeData = await Storage.get('lifeDashboardData_v1');

      // Renderiza resumos
      renderFinanceSummary(JSON.parse(financeData));
      renderLifeSummary(JSON.parse(lifeData));
    })();
  </script>
</body>
</html>
```

---

## 🔗 Fluxo de Carregamento (financas.html)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- CSS Compartilhado -->
  <link rel="stylesheet" href="css/shared.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/layout.css">

  <!-- CSS Específico -->
  <link rel="stylesheet" href="css/financas.css">
</head>
<body data-theme="light">
  <div class="wrap">
    <!-- Markup -->
  </div>

  <!-- Módulos compartilhados -->
  <script src="js/shared/theme.js"></script>
  <script src="js/shared/storage.js"></script>
  <script src="js/shared/formatters.js"></script>
  <script src="js/shared/utils.js"></script>

  <!-- App financeiro -->
  <script src="js/financas/state.js"></script>
  <script src="js/financas/logic.js"></script>
  <script src="js/financas/ui.js"></script>
  <script src="js/financas/handlers.js"></script>

  <!-- Inicializar -->
  <script>
    (async () => {
      Theme.init();
      await FinancesApp.init();
    })();
  </script>
</body>
</html>
```

---

## 📈 Benefícios da Nova Estrutura

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Tamanho de cada HTML** | 1-2 MB | ~100 KB (markup apenas) |
| **Cache CSS** | Sem cache (inline) | Arquivo pode ser cacheado |
| **Duplicação de código** | ~300 linhas duplicadas | 0 — tudo centralizado |
| **Manutenibilidade** | Difícil (monolito) | Fácil (módulos isolados) |
| **Testabilidade** | Impossível | Possível (lógica separada) |
| **Reutilização** | Muito difícil | Fácil (módulos independentes) |

---

## 🚀 Roadmap

- ✅ **Fase 1:** Criar módulos compartilhados (feito)
- ⬜ **Fase 2:** Extrair CSS em arquivos
- ⬜ **Fase 3:** Refatorar financas.js em módulos
- ⬜ **Fase 4:** Refatorar life-dashboard.js em módulos
- ⬜ **Fase 5:** Atualizar HTMLs para usar novos módulos
- ⬜ **Fase 6:** Documentação (ARCHITECTURE.md, DATA_MODEL.md)

---

## 📝 Notas

- Esta estrutura é **totalmente compatível** com a funcionalidade atual
- Nenhuma quebra de funcionalidade será necessária
- Pode ser implementada **incrementalmente**
- Continua usando HTML/CSS/JS puro (sem build tools, opcionais depois)
