# EBD Manager — CLAUDE.md

Aplicação web para gestão digital da Escola Bíblica Dominical (EBD), substituindo registros em papel. Especificação completa em [App.md](App.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18+ com TypeScript (strict mode) |
| Build | Vite |
| Estilização | Tailwind CSS |
| Componentes UI | shadcn/ui (Radix UI) |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod |
| Estado global | Zustand |
| Auth + DB + Hosting | Firebase (Auth, Firestore, Hosting) |
| Testes | Vitest + React Testing Library |

## Comandos

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # tsc && vite build
npm run lint         # ESLint em src/
npm run format       # Prettier em src/
npm run test         # Vitest
npm run deploy       # build + firebase deploy
```

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/           # Componentes shadcn/ui (não editar manualmente)
│   ├── layout/       # AppLayout, Sidebar, Header
│   └── shared/       # ProtectedRoute, DataTable, ConfirmDialog, LoadingSpinner
├── features/
│   ├── auth/         # LoginPage, RecuperarSenhaPage, useAuth
│   ├── alunos/       # AlunosPage, AlunoFormPage, AlunoDetalhePage, alunosService, alunos.types
│   ├── classes/      # ClassesPage, ClasseFormPage, ClasseDetalhePage, classesService, classes.types
│   ├── matriculas/   # MatriculaModal, matriculasService, matriculas.types
│   ├── aulas/        # AulaFormPage, FrequenciaPage, aulasService, aulas.types
│   ├── relatorios/   # RelatorioDomingoPage, RelatorioFrequenciaPage, relatoriosService
│   └── dashboard/    # DashboardPage
├── lib/
│   ├── firebase.ts   # Inicialização do Firebase (lê vars VITE_FIREBASE_*)
│   ├── firestore.ts  # Helpers genéricos do Firestore
│   └── utils.ts
├── store/
│   └── authStore.ts  # Zustand: estado de autenticação
├── hooks/
│   ├── useFirestoreCollection.ts
│   └── useFirestoreDoc.ts
└── types/index.ts
```

Imports absolutos: `@/` aponta para `src/` (configurado no `vite.config.ts`).

## Modelo de dados (Firestore)

Coleções: `users`, `alunos`, `classes`, `matriculas`, `aulas`, `registrosFrequencia`.

Todo documento deve ter `createdAt`, `updatedAt` e `createdBy` (UID do usuário).

Campos desnormalizados (ex: `alunoNome`, `classeNome`) existem intencionalmente para leitura rápida — não remover.

Índices compostos necessários:
- `registrosFrequencia`: `classeId ASC + dataAula ASC` e `alunoId ASC + dataAula ASC`
- `aulas`: `classeId ASC + data ASC`
- `matriculas`: `classeId ASC + ativo ASC`

## Roles e permissões

| Role | Permissões |
|---|---|
| `admin` | CRUD total + gerenciar usuários |
| `secretario` | CRUD em alunos, classes, matrículas, aulas e frequências; relatórios |
| `professor` | Visualizar sua classe + registrar frequência das suas aulas |

As Firestore Security Rules são a última linha de defesa — nunca confiar só no frontend.

## Convenções de código

- TypeScript strict (`"strict": true`); proibido usar `any`
- Apenas Function Components; sem Class Components
- Hooks customizados prefixados com `use` (ex: `useAlunos`, `useFrequencia`)
- Services Firestore exportam funções puras, não classes (ex: `getAlunos()`, `createAula()`)
- Rodar `lint` e `format` antes de commitar

## Variáveis de ambiente

Configuração do Firebase via `.env` (nunca commitar — está no `.gitignore`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Referência: `.env.example` na raiz do projeto.

## Segurança

- Nunca armazenar credenciais em `localStorage`; usar `onAuthStateChanged` do Firebase Auth
- Logout deve chamar `signOut(auth)` e limpar o store Zustand
- Sanitizar strings antes de salvar (trim, remover HTML)
- Campo `oferta`: número positivo com até 2 casas decimais
- Todas as rotas privadas passam pelo componente `ProtectedRoute`

## UX importante

- **Mobile-first**: professores usam o app no celular para marcar presença em sala
- Toda ação assíncrona exibe loading (spinner/skeleton) e feedback via toast
- Lista de presença: toggle por aluno com debounce de 500ms e indicador "Salvando… / Salvo ✓"
- Relatórios: ocultar sidebar e header no `@media print`; layout fiel ao formulário físico da CPAD
- Estado vazio em tabelas deve ter mensagem + botão de ação

## Fases de desenvolvimento

1. **Fase 1** — Fundação: Vite + Firebase + autenticação + layout com sidebar
2. **Fase 2** — CRUD base: alunos, classes, matrículas
3. **Fase 3** — Aulas e frequência: formulário de aula + presença com sync em tempo real
4. **Fase 4** — Relatórios: Relatório do Domingo, Frequência Trimestral, Dashboard
5. **Fase 5** — Qualidade e deploy: Security Rules, testes, performance, Firebase Hosting
