# 📦 Módulos Compartilhados (`js/shared/`)

Módulos reutilizáveis entre `index.html`, `financas.html` e `life-dashboard.html`.

## 📋 Conteúdo

### 1. **theme.js** — Gerenciador de Tema
Centraliza a lógica claro/escuro usada em todos os 3 arquivos.

#### API
```javascript
Theme.init()              // Inicializar (chamar uma vez)
Theme.getCurrent()        // Obter tema atual ('light' ou 'dark')
Theme.apply(theme)        // Aplicar tema
Theme.toggle()            // Alternar tema
Theme.DARK, Theme.LIGHT   // Constantes
```

#### Uso
```html
<button id="themeBtn" title="Alternar tema">🌙</button>

<script src="js/shared/theme.js"></script>
<script>
  // Uma vez na inicialização
  Theme.init();
</script>
```

---

### 2. **storage.js** — Abstração de Armazenamento
Camada unificada para localStorage + futuras integrações (PWA, Electron).

#### API
```javascript
await Storage.get(key, fallback)      // Obter valor
await Storage.set(key, value)         // Salvar valor
await Storage.remove(key)             // Remover chave
await Storage.clear()                 // Limpar tudo
```

#### Uso
```javascript
// Salvar
const success = await Storage.set('finance-state-cute', JSON.stringify(state));

// Carregar
const data = await Storage.get('finance-state-cute', '{}');
const state = JSON.parse(data);

// Remover
await Storage.remove('finance-state-cute');
```

#### Benefícios
- Trata erros automaticamente
- Pronto para PWA (service workers)
- Fallback automático se localStorage indisponível

---

### 3. **formatters.js** — Formatadores Centralizados
Elimina duplicação de formatação entre financas e life-dashboard.

#### API
```javascript
Formatters.money(1234.56)                    // "R$ 1.234,56"
Formatters.money(1234.56, {compact: true})   // "R$ 1,2k"
Formatters.money(1234.56, {noDecimal: true}) // "R$ 1.235"

Formatters.date('2026-09-24')                       // "24/09/2026"
Formatters.date('2026-09-24', {format: 'weekday'})  // "seg, 24 set"
Formatters.date('2026-09-24', {format: 'full'})     // "segunda-feira, 24 de setembro de 2026"

Formatters.duration(90)        // "1h 30m"
Formatters.duration(45)        // "45 min"

Formatters.percentage(45, 100) // "45%"
Formatters.decimal(1234.5, 2)  // "1234.50"

Formatters.toISO(24, 9, 2026)   // "2026-09-24"
Formatters.yearMonth('2026-09-24') // "2026-09"
```

#### Uso
```javascript
// Antes (duplicado em 3 arquivos)
const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});
document.getElementById('balance').textContent = money.format(1234.56);

// Depois (centralizado)
document.getElementById('balance').textContent = Formatters.money(1234.56);
```

---

### 4. **utils.js** — Utilidades Gerais
Funções auxiliares comuns.

#### API
```javascript
Utils.getElement(id)           // document.getElementById() com bônus
Utils.getElements(selector)    // document.querySelectorAll()

Utils.today()                  // Data ISO de hoje
Utils.currentMonth()           // Ano-mês atual

Utils.percentage(45, 100)      // Percentual 0-100
Utils.deepClone(obj)           // Clone profundo
Utils.groupBy(arr, keyFn)      // Agrupar array
Utils.merge(obj1, obj2)        // Mesclar objetos

Utils.isEmpty(value)           // Verificar se vazio
Utils.capitalize(str)          // Capitalizar string
Utils.truncate(str, length)    // Cortar com "…"
Utils.isValidEmail(email)      // Validar email

Utils.debounce(fn, delay)      // Debounce
Utils.throttle(fn, limit)      // Throttle
```

#### Uso
```javascript
// Dados compartilhados
const now = Utils.today();         // "2026-09-24"
const year = Utils.currentMonth(); // "2026-09"

// Agrupar transações por categoria
const byCategory = Utils.groupBy(transactions, t => t.category);

// Funções de performance
const onResize = Utils.debounce(() => {
  renderDashboard();
}, 300);
window.addEventListener('resize', onResize);
```

---

## 🔗 Como Usar em Seus Arquivos HTML

Adicione os imports no `<head>` de cada HTML, **em ordem**:

```html
<!-- Módulos compartilhados -->
<script src="js/shared/theme.js"></script>
<script src="js/shared/storage.js"></script>
<script src="js/shared/formatters.js"></script>
<script src="js/shared/utils.js"></script>

<!-- Seu código específico -->
<script src="js/financas/app.js"></script>
```

---

## 🎯 Substituir Código Existente

### Exemplo 1: Theme
**Antes** (duplicado 3 vezes)
```javascript
const THEME_KEY='homeThemePref';
function applyTheme(theme){
  document.body.setAttribute('data-theme',theme);
  $('themeBtn').textContent=theme==='dark'?'☀️':'🌙';
  try{localStorage.setItem(THEME_KEY,theme)}catch(e){}
}
```

**Depois** (uma linha)
```javascript
Theme.init();
```

---

### Exemplo 2: Formatação de Moeda
**Antes** (duplicado em financas + index)
```javascript
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
document.getElementById('homeBalance').textContent=money.format(balance);
```

**Depois** (centralizado)
```javascript
document.getElementById('homeBalance').textContent = Formatters.money(balance);
```

---

### Exemplo 3: Obter Hoje
**Antes** (escrito inline cada vez)
```javascript
const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
```

**Depois**
```javascript
const today = Utils.today();
```

---

## 📊 Redução de Código

| Área | Antes | Depois | Redução |
|------|-------|--------|---------|
| Tema | ~50 linhas × 3 | 70 linhas | **~80 linhas** |
| Formatadores | ~30 linhas × 2 | 120 linhas | **~40 linhas** |
| Utilitários | Duplicado | 200 linhas | **~100 linhas** |
| **Total** | **~700 linhas duplicadas** | **~400 linhas centralizadas** | **~300 linhas** |

---

## 🔄 Próximos Passos

1. ✅ Criar módulos compartilhados (feito)
2. ⬜ Referenciar em index.html
3. ⬜ Referenciar em financas.html  
4. ⬜ Referenciar em life-dashboard.html
5. ⬜ Refatorar código duplicado
6. ⬜ Organizar em estrutura de pastas

---

## 💡 Notas

- Todos os módulos usam IIFE (Immediately Invoked Function Expression) para evitar poluição global
- Compatível com browsers modernos (ES6+)
- Sem dependências externas
- Pronto para bundle com esbuild, Rollup, ou webpack se necessário
