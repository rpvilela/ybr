# Análise de Regras de Negócio por Tela

**Projeto:** checkpoint (Next.js 15, React 19)  
**Data da análise:** 11/03/2026  
**Escopo:** Regras de negócio implementadas em cada tela do sistema.

---

## Visão geral

O sistema é um **gerenciador de tarefas/checkpoints** com estado global em `TaskContext`, persistência em `localStorage` e telas: Dashboard, Tarefas do Dia, Detalhe da Tarefa, Relatórios e o fluxo de Nova Tarefa (modal). As regras de negócio estão concentradas no contexto e nos handlers de formulário/comentário das páginas e do modal.

---

## 1. Camada compartilhada (Contexto e componente global)

### 1.1 `context/TaskContext.tsx`

Regras de negócio centrais (não vinculadas a uma tela específica):

| Regra | Descrição |
|-------|-----------|
| **Persistência de tarefas** | Ao carregar: se existir `taskflow_tasks` no `localStorage`, as tarefas são restauradas; caso contrário, são usadas as tarefas padrão e gravadas no `localStorage`. |
| **Sincronização ao alterar tarefas** | Sempre que a lista `tasks` é alterada (e os dados já foram carregados), o estado é persistido em `localStorage` com a chave `taskflow_tasks`. |
| **Criação de tarefa** | `addTask`: recebe dados da tarefa sem `id` e `comments`; gera `id` com `Date.now().toString()` e inicializa `comments: []`; insere a nova tarefa no início da lista. |
| **Atualização de tarefa** | `updateTask(id, updates)`: aplica `updates` parcialmente na tarefa com o `id` informado; as demais tarefas permanecem inalteradas. |
| **Adição de comentário** | `addComment(taskId, comment)`: em cada comentário são gerados `id` (timestamp) e `createdAt` (data/hora atual em ISO); o comentário é adicionado ao array `comments` da tarefa com o `taskId` informado. |
| **Modal Nova Tarefa** | Estado `isNewTaskModalOpen` e ação `setIsNewTaskModalOpen` controlam abertura/fechamento do modal em qualquer tela que use o Header com botão "Nova Tarefa". |
| **Usuário atual** | `currentUser` é fixo (Alex Silva, usuário do array na posição 3); usado para identificar o autor dos comentários e exibição no Header. |

**Tipos que definem o domínio:**  
`TaskStatus`, `TaskPriority`, estrutura de `Task`, `User`, `Comment` — determinam o que pode ser persistido e exibido nas telas.

---

## 2. Dashboard (`/` — `app/page.tsx`)

| Regra | Descrição |
|-------|-----------|
| **Checkpoints de Hoje** | Exibe até 3 tarefas cuja prioridade é **Urgente**, **Em progresso** ou **Finalizado** (filtro por prioridade, limitado a 3 itens). |
| **Todas as Tarefas** | Lista tarefas com prioridade **Normal**, **Alta Prioridade**, **Equipe**, **Pessoal** ou **Encerramento** (exclui Urgente, Em progresso e Finalizado já mostrados em “Checkpoints de Hoje”). |
| **Exibição de responsáveis** | Para cada tarefa, os responsáveis são obtidos a partir de `assigneeIds` e da lista global `users` (apenas exibição, sem alteração). |
| **Indicação de conclusão** | Para prioridade **Finalizado** é exibido “Concluído” (com estilo riscado); caso contrário, “Pendente”. |
| **Navegação** | Links para detalhe da tarefa (`/tarefas/[id]`) e para listagem completa (`/tarefas`). |
| **Botão Nova Tarefa** | Header com `showNewTaskButton={true}`; ao clicar, abre o modal (regra de abertura no contexto). |

Não há criação/edição de tarefas nem de comentários nesta tela; apenas leitura e critérios de filtro/exibição.

---

## 3. Tarefas do Dia / Checkpoints de Hoje (`/tarefas` — `app/tarefas/page.tsx`)

| Regra | Descrição |
|-------|-----------|
| **Filtro de checkpoints** | Lista apenas tarefas com prioridade **Alta Prioridade**, **Equipe**, **Pessoal** ou **Encerramento** (critério fixo no código). |
| **Exibição** | Cards com título, descrição, prioridade, imagem (se houver), link para detalhe e botões “Concluir” e “Editar”. |
| **Botões Concluir e Editar** | Apenas UI; **não há implementação** que chame `updateTask` (status não é alterado ao clicar). |
| **Filtros de data e responsável/time** | Os controles “Alterar Data”, “Responsável” e “Time” são estáticos (texto/chips fixos); **não há lógica** que filtre a lista por data ou responsável/time. |
| **Contagem “Pendentes”** | Valor exibido (ex.: “4 Pendentes”) não é calculado a partir das tarefas; é informativo/estático. |
| **Nova Tarefa** | Header com botão que abre o modal (mesma regra do contexto). |

Resumo: a única regra de negócio efetiva nesta tela é **quais prioridades entram na lista**; ações de concluir/editar e filtros por data/responsável/time não estão implementados.

---

## 4. Detalhe da Tarefa (`/tarefas/[id]` — `app/tarefas/[id]/page.tsx`)

| Regra | Descrição |
|-------|-----------|
| **Tarefa inexistente** | Se não existir tarefa com `id` da rota, exibe mensagem “Tarefa não encontrada” e botão “Voltar” (navegação via `router.back()`). |
| **Exibição de dados** | Exibe título, prioridade, time, responsáveis (a partir de `users` e `assigneeIds`), checkpoint (data formatada), link Slack (se houver), descrição e comentários. |
| **Adicionar comentário** | Campo de texto e botão “Enviar”. **Regra:** só adiciona comentário se o texto (após `trim`) não for vazio; ao enviar: chama `addComment(task.id, { userId: currentUser.id, text: newComment })`, depois limpa o campo. O contexto gera `id` e `createdAt` do comentário. |
| **Ordenação de comentários** | Comentários são exibidos na ordem em que estão no array (ordem de inclusão). |
| **Botões “Marcar como Concluída” e “Alterar Checkpoint”** | Apenas UI; **não há implementação** que chame `updateTask` para alterar status ou data. |

Resumo: a única regra de negócio implementada nesta tela é **validação (comentário não vazio) + adição de comentário** associado ao usuário atual; conclusão e alteração de checkpoint não estão implementados.

---

## 5. Modal Nova Tarefa (`components/NewTaskModal.tsx`)

Usado a partir do Header (Dashboard e Tarefas do Dia). Regras:

| Regra | Descrição |
|-------|-----------|
| **Exibição** | Modal só é renderizado quando `isNewTaskModalOpen` é `true` (controlado pelo contexto). |
| **Campos obrigatórios** | Título, Time responsável, Próximo Checkpoint (data) e Descrição são `required` no HTML; envio é bloqueado pelo navegador se estiverem vazios. |
| **Criação ao enviar** | No submit: monta objeto com título, team, nextCheckpoint (ISO da data informada ou data atual), description, slackLink, assigneeIds (lista de IDs selecionados), **status: 'Aguardando'** e **priority: 'Normal'** fixos; chama `addTask` do contexto. |
| **Responsáveis** | Lista de usuários do contexto; seleção/desseleção por clique (`toggleAssignee`): adiciona ou remove o `id` do usuário em `selectedAssignees`; múltipla escolha permitida; pode ser zero responsáveis. |
| **Link Slack** | Opcional; enviado como string (sem validação de URL no código). |
| **Pós-criação** | Após `addTask`: fecha o modal (`setIsNewTaskModalOpen(false)`) e reseta todos os campos do formulário (título, time, data, descrição, slack, responsáveis). |

Resumo: regras de negócio aqui são **validação mínima (required)**, **valores fixos de status e prioridade para nova tarefa**, **seleção múltipla de responsáveis** e **reset do formulário após criar**.

---

## 6. Relatórios (`/relatorios` — `app/relatorios/page.tsx`)

| Regra | Descrição |
|-------|-----------|
| **Uso de dados** | A página importa `tasks` do contexto (`useTasks()`), mas **não utiliza** essa variável para calcular métricas, gráficos ou tabelas. |
| **Métricas e gráficos** | Total de Tarefas (128), Concluídas (94), Em Atraso (12), gráfico de área, pizza por status e barras por time são **dados estáticos** (constantes `data`, `pieData` e valores fixos no JSX). |
| **Tabela “Últimos Checkpoints”** | Linhas são estáticas (não vêm da lista `tasks`). |
| **Busca e exportar** | Campo “Buscar relatório” e botão “Exportar” são apenas UI; **sem lógica** de filtro ou exportação. |

Resumo: na tela de Relatórios **não há regras de negócio implementadas** sobre os dados reais do sistema; a tela é apenas visual com dados mockados.

---

## 7. Resumo por tela

| Tela | Regras de negócio implementadas |
|------|----------------------------------|
| **Contexto** | Persistência em localStorage, addTask, updateTask, addComment, controle do modal e usuário atual. |
| **Dashboard** | Filtro de “Checkpoints de Hoje” (prioridades + limite 3), filtro de “Todas as Tarefas” (outras prioridades), exibição de responsáveis e estado Concluído/Pendente. |
| **Tarefas do Dia** | Filtro por prioridades (Alta Prioridade, Equipe, Pessoal, Encerramento). Concluir/Editar e filtros de data/responsável/time não implementados. |
| **Detalhe da Tarefa** | Comentário não vazio + addComment com usuário atual. Concluir e Alterar Checkpoint não implementados. |
| **Modal Nova Tarefa** | Campos obrigatórios, status/prioridade fixos, múltiplos responsáveis, reset após criar. |
| **Relatórios** | Nenhuma regra sobre dados reais; dados estáticos. |

---

## 8. Observações

- **Botões sem ação:** “Concluir”, “Editar”, “Marcar como Concluída”, “Alterar Checkpoint” e filtros de data/responsável/time não alteram estado nem chamam `updateTask`.
- **Relatórios:** idealmente deveriam usar `tasks` (e possivelmente agrupamentos por status/time/data) para refletir o estado real do sistema.
- **Validação:** não há uso de Zod/React Hook Form; validação restringe-se a `required` no HTML e `trim` no comentário.

Documento gerado para armazenamento em `documentacao/`.
