# 🎨 CSS Compartilhado (`css/`)

Arquivos CSS reutilizáveis entre `index.html`, `financas.html` e `life-dashboard.html`.

## 📋 Arquivos

### 1. **shared.css** — Design System Centralizado
Fundação visual do projeto: variáveis, reset, tema claro/escuro, tipografia base.

#### Variáveis CSS
```css
:root {
  /* Cores */
  --bg, --card, --ink, --pink, --lilac, --mint, --butter, --peach, --sky

  /* Tipografia */
  --font-display, --font-body

  /* Espaçamento */
  --spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl, --spacing-2xl

  /* Sombras */
  --shadow, --shadow-lg, --shadow-hover

  /* Transições */
  --transition, --transition-smooth
}
```

#### Tema Escuro
Automático via `[data-theme="dark"]` — sincroniza com `Theme.js`.

#### Reset Global
- Box-sizing border-box para todos os elementos
- Tipografia normalizada
- Scrollbar customizado
- Suporte a `prefers-reduced-motion`

---

### 2. **components.css** — Componentes Reutilizáveis
Componentes prontos para usar: cards, botões, badges, tabelas, modals.

#### Cards
```html
<div class="card">
  <div class="card-header">
    <h3>Título</h3>
    <button class="btn-ghost">Ação</button>
  </div>
  <p>Conteúdo...</p>
</div>
```

#### Botões
```html
<button class="btn btn-pink">Botão primário</button>
<button class="btn btn-ghost">Botão secundário</button>
<button class="btn btn-text">Link-style</button>
<button class="btn btn-icon">🌙</button>
```

#### Badges & Pills
```html
<span class="badge mint">Ativo</span>
<span class="badge peach">Alerta</span>
<span class="pill">Tag reutilizável</span>
```

#### Toggle Segments
```html
<div class="toggle-seg">
  <button class="active">Opção 1</button>
  <button>Opção 2</button>
  <button>Opção 3</button>
</div>
```

#### Barra de Progresso
```html
<div class="bar-track">
  <div class="bar-fill fill-mint" style="width: 65%"></div>
</div>
```

#### Tabelas
```html
<table>
  <thead>
    <tr><th>Coluna 1</th><th>Coluna 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Dado 1</td><td>Dado 2</td></tr>
  </tbody>
</table>
```

---

### 3. **layout.css** — Grids, Flexbox, Espaçamento
Utilitários para layout responsivo.

#### Container
```html
<div class="container">Conteúdo com max-width</div>
<div class="wrap">Conteúdo com padding e margin</div>
```

#### Flexbox
```html
<div class="flex gap-lg">Item 1, Item 2, Item 3</div>
<div class="flex-between">Left, Right</div>
<div class="flex-center">Centralizado</div>
```

#### Grid
```html
<div class="grid-2">2 colunas em desktop, 1 em mobile</div>
<div class="grid-3">3 colunas</div>
<div class="grid-auto">Responsivo automático</div>
```

#### Espaçamento
```html
<div class="p-lg">Padding large</div>
<div class="mt-lg">Margin top large</div>
<div class="gap-lg">Gap 16px em flexbox/grid</div>
```

#### Responsivo
```css
@media (max-width: 760px) {
  .grid-2 { grid-template-columns: 1fr; } /* 2 → 1 coluna */
  .hidden-mobile { display: none; }
  .flex-col-mobile { flex-direction: column; }
}
```

---

## 🔗 Como Usar em HTML

Carregar em ordem:

```html
<link rel="stylesheet" href="css/shared.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/financas.css"> <!-- se for financas.html -->
```

### Exemplo Completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu App</title>

  <!-- CSS Compartilhado -->
  <link rel="stylesheet" href="css/shared.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/layout.css">

  <!-- CSS Específico (opcional) -->
  <link rel="stylesheet" href="css/financas.css">
</head>
<body data-theme="light">
  <div class="wrap">
    <header>
      <h1>Meu Projeto</h1>
      <button id="themeBtn" class="btn btn-icon">🌙</button>
    </header>

    <div class="grid-2 gap-lg">
      <div class="card">
        <h2>Card 1</h2>
        <p>Conteúdo...</p>
        <button class="btn btn-pink">Ação</button>
      </div>

      <div class="card">
        <h2>Card 2</h2>
        <p>Conteúdo...</p>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="js/shared/theme.js"></script>
  <script>
    Theme.init();
  </script>
</body>
</html>
```

---

## 🎨 Variáveis CSS (Referência Rápida)

### Cores
| Variável | Light | Dark |
|----------|-------|------|
| `--bg` | #fbf5ff | #191623 |
| `--card` | #ffffff | #211d2c |
| `--ink` | #574f6b | #f0ecf8 |
| `--pink` | #ffd7e6 | #4d3341 |
| `--lilac` | #e6d9ff | #3d3454 |
| `--mint` | #d3f5e3 | #284339 |

### Espaçamento
- `--spacing-xs` = 4px
- `--spacing-sm` = 8px
- `--spacing-md` = 12px
- `--spacing-lg` = 16px
- `--spacing-xl` = 20px
- `--spacing-2xl` = 24px

### Border Radius
- `--radius-sm` = 12px
- `--radius-md` = 14px
- `--radius-lg` = 18px
- `--radius-full` = 999px

---

## ⚙️ Customização

### Mudar Paleta de Cores
Edite apenas `shared.css`:

```css
:root {
  --pink: #sua-cor-aqui;
  --lilac: #sua-cor-aqui;
  /* ... etc ... */
}
```

### Mudar Tipografia
```css
:root {
  --font-display: "Sua fonte display";
  --font-body: "Sua fonte body";
}
```

### Adicionar Componentes Novos
Se precisa de um novo componente reutilizável, adicione em `components.css` (não em arquivos específicos).

---

## 🎯 Princípios

- **DRY (Don't Repeat Yourself):** Nenhum CSS duplicado
- **Responsivo por padrão:** Mobile-first com breakpoints
- **Dark mode automático:** Sincroniza com `Theme.js`
- **Acessível:** Suporte a `prefers-reduced-motion`, `prefers-color-scheme`
- **Performance:** Sem imports desnecessários, sem sombras pesadas

---

## 📊 Tamanho dos Arquivos

| Arquivo | Tamanho (minificado) |
|---------|---------------------|
| shared.css | ~4 KB |
| components.css | ~7 KB |
| layout.css | ~6 KB |
| **Total** | **~17 KB** |

*(Versus ~50 KB de CSS inline em cada HTML = ~150 KB total)*

---

## 🔄 Próximos Passos

1. ✅ Criar CSS compartilhado (feito)
2. ⬜ Referência em index.html
3. ⬜ Referência em financas.html
4. ⬜ Referência em life-dashboard.html
5. ⬜ Remover CSS inline dos HTMLs
6. ⬜ Criar css/financas.css e css/life-dashboard.css específicas
