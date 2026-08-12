# 🌷 Meu Espaço

Um ecossistema pessoal, leve e totalmente local para organizar **finanças, rotina, hábitos, foco e planejamento** em uma interface única.

O projeto é composto por três páginas principais:

- `index.html` — página inicial e visão geral do ecossistema
- `financas.html` — controle financeiro pessoal
- `life-dashboard.html` — planner pessoal, hábitos, foco e acompanhamento da rotina

Tudo foi desenvolvido em **HTML, CSS e JavaScript puro**, sem frameworks ou dependências externas obrigatórias. Os dados ficam armazenados no próprio navegador com `localStorage`, permitindo uso offline depois que os arquivos estiverem disponíveis localmente.

---

## ✨ Visão geral

A página **Meu Espaço** funciona como uma central para os dois aplicativos. Ela mostra resumos rápidos de finanças e produtividade e oferece acesso direto ao módulo financeiro e ao Life Dashboard.

O ecossistema compartilha uma linguagem visual em tons pastel, componentes arredondados, modo claro/escuro e navegação responsiva para desktop e dispositivos móveis.

---

## 📁 Estrutura do projeto

```text
.
├── index.html
├── financas.html
├── life-dashboard.html
└── README.md
```

### `index.html`

Página inicial do ecossistema.

Principais recursos:

- saudação dinâmica de acordo com o horário;
- alternância entre tema claro e escuro;
- resumo financeiro com saldo, faturas e investimentos;
- resumo do Life Dashboard com tarefas, hábitos e tempo de foco;
- leitura direta dos dados dos outros aplicativos via `localStorage`;
- links para abrir os módulos de Finanças e Life Dashboard.

---

## 💰 Finanças — `financas.html`

O módulo **Financinhas da Fadinha 💖** centraliza o acompanhamento financeiro pessoal.

### Dashboard financeiro

A tela inicial apresenta uma leitura rápida do mês, incluindo:

- saldo em conta;
- faturas com vencimento nos dias 01 e 15;
- total investido;
- saldo de Vale-Refeição;
- compras parceladas em andamento;
- leitura do ciclo financeiro atual;
- insights automáticos do mês;
- gráficos por categoria, banco e cartão.

### Ciclos financeiros

O aplicativo organiza o mês em ciclos, permitindo acompanhar separadamente:

- entradas;
- contas;
- consumo;
- investimentos;
- saldo transportado do ciclo anterior;
- despesas de terceiros;
- valores reembolsáveis.

### Orçamento

É possível criar e editar categorias de orçamento, definir tetos mensais e acompanhar quanto ainda resta em cada categoria.

O cálculo diferencia gastos próprios de compras de terceiros e despesas reembolsáveis.

### Investimentos

O módulo de investimentos permite:

- cadastrar aplicações;
- definir metas;
- informar banco ou corretora;
- acompanhar o valor atual;
- visualizar distribuição da carteira;
- visualizar distribuição por instituição.

Movimentações do tipo investimento e saque podem atualizar automaticamente os saldos das aplicações cadastradas.

### Dívidas e compras de terceiros

Compras feitas para outras pessoas podem ser classificadas separadamente do consumo pessoal.

O sistema permite:

- cadastrar pessoas;
- registrar compras atribuídas a terceiros;
- acompanhar valor total devido e valor já pago;
- registrar pagamentos;
- vincular um pagamento a uma compra específica;
- acompanhar pagamentos parciais.

### Reembolsos

Despesas reembolsáveis podem ser registradas e posteriormente vinculadas a pagamentos recebidos.

O aplicativo acompanha:

- valor bruto da despesa;
- valor recebido;
- valor ainda pendente;
- status do reembolso;
- custo líquido da despesa.

### Lançamentos

A área de lançamentos suporta:

- gastos;
- receitas;
- investimentos;
- saques;
- abatimentos de fatura.

Também é possível informar:

- descrição;
- valor;
- data;
- categoria;
- banco ou cartão;
- forma de pagamento;
- fatura do dia 01 ou 15;
- parcelamento;
- classificação como gasto próprio, compra de terceiro ou reembolsável.

Compras parceladas podem gerar automaticamente as parcelas futuras.

### Análises

A aba de análises oferece uma visão mais detalhada do comportamento financeiro, com:

- entradas do mês;
- gastos próprios;
- total investido;
- resultado mensal;
- comparação com o mês anterior;
- histórico das faturas;
- gastos por categoria;
- gastos por banco ou cartão;
- tendências de entradas e consumo;
- visão de parcelamentos;
- insights automáticos.

### Milhas

Também existe um pequeno controle de milhas, com:

- meta total;
- saldo acumulado;
- distribuição entre programas como XP, Livelo e Smiles;
- operações para adicionar ou remover milhas.

### Backup e exportação

O módulo financeiro permite:

- exportar backup em JSON;
- importar backup em JSON;
- exportar movimentações em CSV;
- apagar apenas as movimentações;
- resetar todos os dados do aplicativo.

---

## 🌸 Life Dashboard — `life-dashboard.html`

O **Life Dashboard** é um planner pessoal completo para rotina, produtividade, hábitos e reflexão.

### Dashboard

A visão geral reúne indicadores como:

- tarefas concluídas;
- hábitos concluídos;
- humor médio;
- energia média;
- progresso do mês;
- dias produtivos;
- sequência de produtividade;
- livros lidos;
- corridas;
- treinos;
- consumo de água;
- resumo da semana e do mês.

### Daily Planner

O planner diário permite registrar:

- Top 3 prioridades;
- checklist de tarefas;
- agenda livre com horário e descrição;
- eventos sincronizados do Monthly Planner;
- treino de força;
- Pilates;
- corrida em quilômetros;
- consumo de água;
- humor;
- nível de energia;
- gratidão do dia;
- notas livres.

Também é possível:

- navegar entre dias;
- duplicar os dados do dia anterior;
- limpar um dia;
- salvar manualmente;
- mover tarefas pendentes para o dia seguinte.

Ao mover pendências, o sistema evita duplicar tarefas com o mesmo texto já existentes no dia seguinte.

### Diário da Gratidão

As gratidões registradas no Daily Planner são reunidas automaticamente em um **Diário da Gratidão**.

Cada entrada é exibida com:

- dia da semana;
- data;
- texto registrado.

O Monthly Review também apresenta automaticamente as gratidões daquele mês, evitando manter um segundo campo manual separado.

### Weekly Planner

O planner semanal oferece:

- objetivo principal da semana;
- horas de estudo;
- treinos planejados;
- livros;
- objetivos por dia;
- checklist por dia;
- treino planejado por dia;
- avaliação semanal em estrelas;
- vitórias;
- desafios;
- melhor momento;
- lição aprendida.

Eventos cadastrados no Monthly Planner também aparecem automaticamente no respectivo dia da visão semanal.

### Monthly Planner

O calendário mensal permite:

- navegar entre meses;
- visualizar dias com tarefas;
- visualizar dias com hábitos concluídos;
- visualizar dias com eventos;
- cadastrar datas importantes com data e descrição;
- abrir diretamente o Daily Planner ao clicar em um dia.

Os eventos mensais funcionam como uma fonte central de dados para o Daily Planner e Weekly Planner.

### Habit Tracker

O Habit Tracker permite criar hábitos personalizados com:

- nome;
- categoria;
- cor;
- check-ins diários;
- visão dos últimos sete dias;
- calendário mensal;
- percentual de conclusão;
- sequência atual;
- melhor sequência;
- número de check-ins no mês.

### Pomodoro

O módulo Pomodoro inclui:

- tempo de foco configurável;
- pausa curta;
- pausa longa;
- quantidade de blocos antes da pausa longa;
- avanço automático opcional;
- assunto da sessão;
- curso;
- categoria;
- histórico das sessões do dia;
- tempo focado;
- sessões concluídas e interrompidas.

As sessões são persistidas e alimentam o resumo da página inicial.

### Monthly Review

A revisão mensal permite registrar:

- conquistas;
- desafios;
- aprendizados;
- livros lidos com autor e avaliação;
- treinos;
- corridas;
- dias dormindo bem;
- valor economizado;
- nota do mês;
- palavra do mês;
- objetivo para o próximo mês.

As gratidões do mês são preenchidas automaticamente a partir das entradas do Daily Planner.

### Configurações

O Life Dashboard oferece:

- tema claro e escuro;
- escolha de cor principal;
- escolha de cor secundária;
- exportação dos dados em JSON;
- importação de backup;
- reset completo dos dados;
- salvamento automático local.

Também existem atalhos de teclado para ações frequentes.

---

## 🔄 Integração entre as páginas

Os três arquivos funcionam de forma independente, mas compartilham dados por meio das chaves de armazenamento local.

### Chaves usadas

```text
finance-state-cute
lifeDashboardData_v1
homeThemePref
```

A página `index.html` lê os dados dos dois aplicativos para montar o resumo inicial.

Isso significa que, ao atualizar informações em `financas.html` ou `life-dashboard.html`, o resumo exibido em `index.html` acompanha os dados armazenados no mesmo navegador.

> Os dados não são enviados para um servidor. Eles ficam armazenados localmente no navegador utilizado.

---

## 🚀 Como executar

Como o projeto não possui build, dependências ou backend, basta manter os três arquivos HTML na mesma pasta.

### Opção 1 — abrir diretamente

Abra `index.html` no navegador.

```text
index.html
```

Os links internos levam para:

```text
financas.html
life-dashboard.html
```

### Opção 2 — servidor local

Para evitar eventuais restrições do navegador com arquivos locais, também é possível servir a pasta com um servidor HTTP simples.

Com Python:

```bash
python -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

---

## 💾 Persistência de dados

Os aplicativos utilizam `localStorage` como principal mecanismo de persistência.

Consequências importantes:

- os dados ficam associados ao navegador e ao domínio/origem utilizados;
- limpar os dados do navegador pode apagar as informações salvas;
- abrir o projeto em outro navegador ou dispositivo não transfere automaticamente os dados;
- backups JSON são recomendados para preservar informações importantes.

O Life Dashboard também realiza salvamentos locais periódicos, enquanto o aplicativo financeiro salva o estado após alterações.

---

## 🛟 Backup recomendado

Para evitar perda de dados:

1. exporte periodicamente o JSON de cada aplicativo;
2. guarde os arquivos em uma pasta segura ou serviço de nuvem;
3. antes de limpar dados do navegador, faça uma exportação;
4. utilize a opção de importação para restaurar um backup quando necessário.

---

## 📱 Responsividade

O projeto possui estilos responsivos para diferentes tamanhos de tela.

Entre os comportamentos implementados estão:

- navegação lateral no desktop;
- menu recolhível no Life Dashboard;
- layouts em uma ou duas colunas em telas menores;
- cards reorganizados para dispositivos móveis;
- calendários, grids e métricas adaptáveis.

---

## 🎨 Design

A identidade visual do projeto utiliza:

- lavanda;
- rosa;
- menta;
- azul claro;
- amarelo suave;
- pêssego;
- superfícies claras e arredondadas;
- modo escuro nos módulos compatíveis.

O objetivo visual é manter a organização funcional sem perder uma estética acolhedora e pessoal. 🌷

---

## 🧰 Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla
- Web Storage API (`localStorage`)
- `Intl.NumberFormat`
- SVG gerado em JavaScript para algumas visualizações
- Web Audio API para o aviso sonoro do Pomodoro

Não há dependências de npm, bundler ou framework de frontend.

---

## 🔐 Privacidade

O projeto foi desenhado para funcionar localmente.

Por padrão:

- não existe backend;
- não existe autenticação;
- não existe banco de dados remoto;
- não existe sincronização automática entre dispositivos;
- os dados permanecem no navegador, salvo quando o usuário exporta arquivos manualmente.

Por isso, o aplicativo é adequado principalmente para uso pessoal em um dispositivo ou navegador controlado pelo próprio usuário.

---

## ⚠️ Limitações atuais

Alguns pontos importantes da arquitetura atual:

- os dados dependem do `localStorage` do navegador;
- não há sincronização em nuvem;
- não há contas de usuário;
- o backup precisa ser feito manualmente;
- abrir os arquivos em origens diferentes pode criar armazenamentos separados;
- os módulos financeiro e de planejamento utilizam estruturas de dados próprias.

---

## 🌱 Possíveis evoluções

Algumas melhorias futuras compatíveis com a arquitetura do projeto:

- sincronização opcional entre dispositivos;
- PWA instalável;
- backup automático em nuvem;
- importação/exportação consolidada dos dois aplicativos;
- relatórios anuais;
- filtros avançados para o Diário da Gratidão;
- visualização de tarefas carregadas de dias anteriores;
- notificações de eventos e hábitos;
- integração opcional com calendário;
- gráficos adicionais para produtividade e finanças.

---

## 📄 Licença

Nenhuma licença foi definida nos arquivos fornecidos.

Se o projeto for publicado em um repositório público, adicione uma licença apropriada, como MIT, Apache-2.0 ou outra compatível com o uso pretendido.

---

<p align="center">
  feito com carinho para sua vida florescer 🌷✨
</p>
