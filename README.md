# 🌷 Meu Espaço

## Assistente com Gemini via Supabase Edge Functions

Arquitetura: `GitHub Pages → Supabase Auth/PostgreSQL (RLS) → Edge Function (orquestradora + especialistas) → Gemini API`.
O navegador envia apenas a pergunta autenticada para a função `ai-assistant`; a chave Gemini nunca vai para o GitHub Pages. A função valida o JWT, consulta somente os registros autorizados pelo RLS do usuário, limita o contexto por assunto e salva no máximo o histórico recente usado na conversa.

### Insights, não apenas respostas

O assistente usa uma arquitetura de especialistas. Antes de chamar a IA, a função calcula sinais objetivos — fluxo do mês, comparação com o mês anterior, categorias relevantes, orçamento, concentração da carteira e médias de humor/energia. Depois, aciona apenas os especialistas necessários e uma orquestradora entrega um resumo priorizado, evidências, próxima melhor ação e o nível de confiança.

- **Investimentos:** concentração, distribuição e aportes; não recomenda compra ou venda de ativos.
- **Movimentações:** mudanças de gasto, orçamento e fluxo de caixa.
- **Humor & rotina:** padrões prudentes entre humor, energia, hábitos e tarefas; não faz diagnóstico de saúde.

No botão **Insights da Fadinha**, selecione uma dessas leituras ou use **Leitura completa** para combinar todas. Para publicar a evolução, execute novamente `npx supabase functions deploy ai-assistant` após atualizar os arquivos.

### Configuração manual da IA

1. Execute novamente [supabase/schema.sql](supabase/schema.sql) no SQL Editor.
2. Instale a CLI do Supabase e autentique-se: `npx supabase login`.
3. Vincule o projeto: `npx supabase link --project-ref SEU_PROJECT_REF`.
4. Defina o secret, sem incluí-lo no repositório: `npx supabase secrets set GEMINI_API_KEY=SUA_CHAVE`.
5. Publique: `npx supabase functions deploy ai-assistant`.
6. Em Authentication → URL Configuration, mantenha as URLs do GitHub Pages e de localhost já descritas abaixo.

Credenciais públicas no frontend: Project URL e Publishable key. Secrets exclusivamente no Supabase: `GEMINI_API_KEY` (e qualquer service-role, caso seja usada futuramente). Nunca publique esses valores.

## Supabase: configuração obrigatória

O frontend continua estático e compatível com GitHub Pages. A arquitetura é:

```text
GitHub Pages → Supabase Auth → PostgreSQL → Row Level Security
```

1. Crie um projeto em [Supabase](https://supabase.com/dashboard).
2. No **SQL Editor**, execute [supabase/schema.sql](supabase/schema.sql). Ele cria as entidades de finanças e planner, índice, timestamps, RLS e policies por `auth.uid()`.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **Publishable** (ou `anon` legada). Preencha-as em [js/supabase.js](js/supabase.js). Essas duas credenciais podem estar no frontend; nunca use `service_role`, senha do banco ou tokens administrativos.
4. Em **Authentication → URL Configuration**, defina a Site URL como `https://USUARIO.github.io/REPOSITORIO/` e adicione estas Redirect URLs:

   - `https://USUARIO.github.io/REPOSITORIO/**`
   - `http://localhost:8000/**`

5. Em **Authentication → Providers → Email**, mantenha Email habilitado. Para testes simples, você pode desativar a confirmação de e-mail; em produção, mantenha-a ligada e configure o template de confirmação.
6. Publique normalmente no GitHub Pages. Não há Node, build ou servidor próprio.

Para testar localmente: execute `python -m http.server 8000` na pasta e acesse `http://localhost:8000/login.html`.

Na primeira autenticação, o app detecta as chaves legadas `finance-state-cute` e `lifeDashboardData_v1`, envia tudo para o banco e só grava o marcador de migração quando o envio termina. Os dados locais não são apagados; portanto, não há perda em caso de falha ou interrupção. O marcador é específico da conta.

As páginas privadas aguardam a validação de sessão antes de carregar dados e redirecionam para `login.html` quando necessário. As operações no banco são assíncronas e erros de salvamento são mostrados ao usuário e registrados no console.

---

Um ecossistema pessoal, leve e totalmente local para organizar **finanças, rotina, hábitos, foco e planejamento** em uma interface única.

O projeto é composto por três páginas principais:

- `index.html` — página inicial e visão geral do ecossistema
- `financas.html` — controle financeiro pessoal
- `life-dashboard.html` — planner pessoal, hábitos, foco e acompanhamento da rotina

Tudo foi desenvolvido em **HTML, CSS e JavaScript puro**, sem framework ou backend próprio. Os dados privados ficam no Supabase e são protegidos por autenticação e RLS.

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
- leitura dos resumos dos módulos pelo Supabase;
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

Os aplicativos utilizam o Supabase como mecanismo principal de persistência.

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

- exige conexão com o Supabase para sincronizar dados entre dispositivos;
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
