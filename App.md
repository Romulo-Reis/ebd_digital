# Especificação — App Escola Bíblica Dominical (EBD)

## 1. Visão Geral

Aplicação web para gestão completa da Escola Bíblica Dominical (EBD), substituindo os registros manuais em papel por uma solução digital. O sistema permite o cadastro de alunos, organização de turmas (classes), matrícula de alunos, registro de frequência semanal e geração de relatórios por domingo e por trimestre.

**Nome sugerido:** EBD Manager  
**Idioma da interface:** Português (Brasil)  
**Público-alvo:** Secretário(a) da EBD, professores e superintendente da igreja

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18+ com TypeScript |
| Build tool | Vite |
| Estilização | Tailwind CSS |
| Componentes UI | shadcn/ui (baseado em Radix UI) |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod |
| Estado global | Zustand |
| Autenticação | Firebase Authentication |
| Banco de dados | Firebase Firestore |
| Hospedagem | Firebase Hosting |
| Regras de segurança | Firestore Security Rules |
| Testes | Vitest + React Testing Library |

---

## 3. Modelo de Dados (Firestore)

### 3.1 Coleções

#### `users/{userId}`
```ts
{
  uid: string;          // Firebase Auth UID
  email: string;
  nome: string;
  role: 'admin' | 'secretario' | 'professor';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `alunos/{alunoId}`
```ts
{
  nome: string;
  dataNascimento?: string;       // ISO 8601
  telefone?: string;
  responsavel?: string;          // para menores
  observacoes?: string;
  ativo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // userId
}
```

#### `classes/{classeId}`
```ts
{
  nome: string;
  descricao?: string;
  professorId?: string;          // userId
  professorNome?: string;        // desnormalizado para leitura rápida
  ativa: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### `matriculas/{matriculaId}`
```ts
{
  alunoId: string;
  classeId: string;
  alunoNome: string;             // desnormalizado
  classeNome: string;            // desnormalizado
  dataMatricula: Timestamp;
  ativo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### `aulas/{aulaId}`
```ts
{
  classeId: string;
  classeNome: string;            // desnormalizado
  data: Timestamp;               // data do domingo
  estadoTempo: 'bom' | 'ameacador' | 'chuvoso' | 'tempestuoso';
  quantidadeBiblia: number;
  quantidadeRevista: number;
  oferta: number;                // em reais
  visitantes: number;
  observacoes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### `registrosFrequencia/{registroId}`
```ts
{
  aulaId: string;
  matriculaId: string;
  alunoId: string;               // desnormalizado
  alunoNome: string;             // desnormalizado
  classeId: string;              // desnormalizado
  dataAula: Timestamp;           // desnormalizado para queries
  presente: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### 3.2 Índices Compostos (Firestore)

- `registrosFrequencia`: `classeId ASC` + `dataAula ASC`
- `registrosFrequencia`: `alunoId ASC` + `dataAula ASC`
- `aulas`: `classeId ASC` + `data ASC`
- `matriculas`: `classeId ASC` + `ativo ASC`

---

## 4. Autenticação e Controle de Acesso

### 4.1 Papéis (Roles)

| Role | Permissões |
|---|---|
| `admin` | Acesso total: CRUD em tudo, gerenciar usuários |
| `secretario` | CRUD em alunos, classes, matrículas, aulas e frequências; gerar relatórios |
| `professor` | Visualizar sua classe, registrar frequência das aulas da sua classe |

### 4.2 Regras do Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuthenticated() && getRole() == 'admin';
    }

    function isSecretario() {
      return isAuthenticated() && getRole() in ['admin', 'secretario'];
    }

    function isProfessor(classeId) {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/classes/$(classeId)).data.professorId == request.auth.uid;
    }

    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }

    match /alunos/{alunoId} {
      allow read: if isAuthenticated();
      allow create, update: if isSecretario();
      allow delete: if isAdmin();
    }

    match /classes/{classeId} {
      allow read: if isAuthenticated();
      allow create, update: if isSecretario();
      allow delete: if isAdmin();
    }

    match /matriculas/{matriculaId} {
      allow read: if isAuthenticated();
      allow create, update: if isSecretario();
      allow delete: if isAdmin();
    }

    match /aulas/{aulaId} {
      allow read: if isAuthenticated();
      allow create, update: if isSecretario() || isProfessor(resource.data.classeId);
      allow delete: if isAdmin();
    }

    match /registrosFrequencia/{registroId} {
      allow read: if isAuthenticated();
      allow create, update: if isSecretario() || isProfessor(resource.data.classeId);
      allow delete: if isAdmin();
    }
  }
}
```

---

## 5. Funcionalidades

### 5.1 Autenticação

- Login com e-mail e senha (Firebase Auth)
- Recuperação de senha por e-mail
- Logout com limpeza de estado local
- Tela de login com validação de campos
- Redirecionamento automático após login
- Proteção de rotas (rotas privadas com `ProtectedRoute`)

### 5.2 Gestão de Alunos

**Tela: Lista de Alunos**
- Tabela paginada com busca por nome
- Filtro: ativos / inativos
- Botão "Novo Aluno"
- Ações por linha: Editar, Inativar/Ativar, Ver detalhes

**Tela: Formulário de Aluno (criar/editar)**
- Campos: nome (obrigatório), data de nascimento, telefone, responsável, observações
- Validação com Zod
- Feedback visual de sucesso/erro

**Tela: Detalhe do Aluno**
- Dados cadastrais
- Classes em que está matriculado (com status)
- Histórico de frequência (percentual geral e por trimestre)

### 5.3 Gestão de Classes

**Tela: Lista de Classes**
- Cards ou tabela com nome, professor, total de matriculados
- Filtro: ativas / inativas
- Botão "Nova Classe"

**Tela: Formulário de Classe**
- Campos: nome (obrigatório), descrição, professor responsável (select de usuários com role professor/secretario/admin)

**Tela: Detalhe da Classe**
- Lista de alunos matriculados
- Histórico de aulas realizadas
- Botão para registrar nova aula

### 5.4 Matrículas

**Tela: Matrículas (acessível via detalhe da classe ou do aluno)**
- Listar alunos matriculados na classe com status
- Botão "Matricular Aluno": modal com busca e seleção de aluno
- Ação de cancelar matrícula (soft delete — `ativo: false`)
- Impede matrícula duplicada ativa na mesma classe

### 5.5 Registro de Aulas e Frequência

**Tela: Nova Aula**
- Data (padrão: domingo atual)
- Estado do tempo: Bom | Ameaçador | Chuvoso | Tempestuoso
- Quantidade de Bíblias, Revistas
- Oferta (valor monetário)
- Número de visitantes
- Observações opcionais
- Ao salvar, cria registros de frequência (`presente: false`) para todos os alunos com matrícula ativa na classe
- Após salvar, redireciona automaticamente para a tela de Lista de Presença da aula criada

**Tela: Editar Aula**
- Acessível via botão "Editar aula" na página de Lista de Presença
- Visível apenas para `admin` e `secretario` (professores não podem editar os metadados da aula)
- Pré-carrega todos os dados atuais da aula no formulário
- Campos editáveis: data, estado do tempo, quantidade de Bíblias, revistas, oferta, visitantes, observações
- **Não recria nem altera os registros de frequência existentes** — apenas atualiza os metadados da aula no documento `aulas/{aulaId}`
- Ao salvar, redireciona de volta para a página de Lista de Presença da aula (`/classes/:id/aulas/:aulaId`)
- Ao cancelar, retorna para a página de Lista de Presença sem salvar alterações
- Feedback visual de sucesso/erro via toast

**Tela: Lista de Presença (por aula)**
- Exibe lista de alunos matriculados ativos
- Toggle de presença por aluno (checkbox ou botão on/off)
- Indicação visual clara: presente (verde) / ausente (vermelho)
- Salvamento em tempo real (debounce de 500ms com feedback de sincronização)
- Contador: X presentes / Y total
- Botão "Editar aula" visível apenas para `admin` e `secretario`, que redireciona para `/classes/:id/aulas/:aulaId/editar`

### 5.6 Relatórios

**Relatório por Domingo (equivalente ao "Relatório" em papel)**
- Selecionar data (domingo)
- Tabela com colunas: Classe, Matriculados, Ausentes, Presentes, Visitantes, Total, Bíblias, Revistas, Ofertas
- Linha de Total Geral
- Linha "Domingo Anterior" (leitura automática do domingo imediatamente anterior)
- Campo de observações/anotações especiais
- Botão de impressão (CSS print-friendly) e exportação PDF

**Relatório de Frequência por Trimestre (equivalente ao "Registro de Frequência")**
- Selecionar classe e trimestre (1º/2º/3º/4º + ano)
- Tabela com: Nº, Nome do aluno, presença em cada domingo do trimestre (●/F), totais mensais e total do trimestre
- Resumo ao final: Matriculados, Ausentes, Presentes, Visitantes, Total Assistência, Bíblias, Revistas, Ofertas por domingo
- Botão de impressão e exportação PDF

**Painel (Dashboard)**
- Cards de resumo: total alunos ativos, total classes, frequência média do último mês
- Gráfico de linha: frequência por domingo (últimos 3 meses)
- Gráfico de barras: frequência por classe (domingo mais recente)
- Próximo domingo (data)

---

## 6. Estrutura de Rotas

```
/login                          → Tela de login
/recuperar-senha                → Recuperação de senha

/ (dashboard)                   → Painel principal (privado)

/alunos                         → Lista de alunos
/alunos/novo                    → Formulário novo aluno
/alunos/:id                     → Detalhe do aluno
/alunos/:id/editar              → Editar aluno

/classes                        → Lista de classes
/classes/nova                   → Formulário nova classe
/classes/:id                    → Detalhe da classe
/classes/:id/editar             → Editar classe
/classes/:id/aulas/nova              → Nova aula
/classes/:id/aulas/:aulaId           → Frequência da aula (lista de presença)
/classes/:id/aulas/:aulaId/editar    → Editar metadados da aula (admin e secretario)

/relatorios/domingo             → Relatório por domingo
/relatorios/frequencia          → Registro de frequência trimestral

/usuarios                       → Gerenciar usuários (admin only)
```

---

## 7. Estrutura de Pastas

```
src/
├── assets/                     # Ícones, logos
├── components/
│   ├── ui/                     # Componentes shadcn/ui gerados
│   ├── layout/
│   │   ├── AppLayout.tsx       # Layout com sidebar e header
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── shared/
│       ├── ProtectedRoute.tsx
│       ├── DataTable.tsx
│       ├── ConfirmDialog.tsx
│       └── LoadingSpinner.tsx
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RecuperarSenhaPage.tsx
│   │   └── useAuth.ts
│   ├── alunos/
│   │   ├── AlunosPage.tsx
│   │   ├── AlunoFormPage.tsx
│   │   ├── AlunoDetalhePage.tsx
│   │   ├── alunosService.ts
│   │   └── alunos.types.ts
│   ├── classes/
│   │   ├── ClassesPage.tsx
│   │   ├── ClasseFormPage.tsx
│   │   ├── ClasseDetalhePage.tsx
│   │   ├── classesService.ts
│   │   └── classes.types.ts
│   ├── matriculas/
│   │   ├── MatriculaModal.tsx
│   │   ├── matriculasService.ts
│   │   └── matriculas.types.ts
│   ├── aulas/
│   │   ├── AulaFormPage.tsx
│   │   ├── FrequenciaPage.tsx
│   │   ├── aulasService.ts
│   │   └── aulas.types.ts
│   ├── relatorios/
│   │   ├── RelatorioDomingoPage.tsx
│   │   ├── RelatorioFrequenciaPage.tsx
│   │   └── relatoriosService.ts
│   └── dashboard/
│       └── DashboardPage.tsx
├── lib/
│   ├── firebase.ts             # Inicialização Firebase
│   ├── firestore.ts            # Helpers Firestore
│   └── utils.ts
├── store/
│   └── authStore.ts            # Zustand: estado de autenticação
├── hooks/
│   ├── useFirestoreCollection.ts
│   └── useFirestoreDoc.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## 8. Diretrizes de UX/UI

### 8.1 Princípios Gerais

- **Simplicidade:** interface limpa, sem elementos desnecessários; foco na tarefa do usuário
- **Feedback imediato:** toda ação assíncrona deve exibir estado de carregamento (spinner ou skeleton) e confirmação de sucesso/erro via toast
- **Mobile-first:** layout responsivo, funcional em celulares (professores registrando frequência em sala)
- **Consistência:** usar sempre os mesmos componentes shadcn/ui; paleta de cores e tipografia uniformes

### 8.2 Tema Visual

- Paleta: tons de azul-escuro e azul-médio como cor primária, cinza neutro para backgrounds, verde para confirmações, vermelho para erros/ausências
- Tipografia: Inter (Google Fonts), sans-serif
- Ícones: Lucide Icons (integrado com shadcn/ui)
- Modo claro como padrão; modo escuro opcional (Tailwind `dark:`)

### 8.3 Componentes-chave

**Sidebar de navegação:**
- Ícone + rótulo para cada seção
- Indicador visual da rota ativa
- Colapsável em telas pequenas (menu hambúrguer)
- Exibir nome e role do usuário logado no rodapé

**Tabelas:**
- Skeleton loading no lugar das linhas enquanto carrega
- Estado vazio com mensagem e botão de ação ("Nenhum aluno cadastrado. Cadastrar agora →")
- Busca filtrada localmente para listas pequenas (<200 itens) ou com query Firestore para grandes volumes

**Formulários:**
- Validação em tempo real com mensagens inline abaixo do campo
- Botão de submit desabilitado durante envio
- Confirmação de saída se houver alterações não salvas (`beforeunload`)

**Lista de Presença:**
- Interface de toggle rápido: toque/clique alterna entre presente/ausente
- Cor de fundo da linha: verde claro (presente) / vermelho claro (ausente)
- Contador fixo no topo: "12 presentes · 8 ausentes · 20 total"
- Ícone de sincronização: exibir "Salvando…" / "Salvo ✓"

**Relatórios:**
- Ocultar sidebar e header no modo impressão (`@media print`)
- Layout fiel ao formulário físico da CPAD
- Botão "Imprimir" com `window.print()` e botão "Exportar PDF" com `jsPDF` ou `react-pdf`

### 8.4 Acessibilidade

- Todos os inputs com `<label>` associado via `htmlFor`
- Cores não são o único indicador de estado (ícone + texto acompanham a cor)
- Foco visível em todos os elementos interativos (`focus-visible`)
- Atributos `aria-label` em botões de ícone

---

## 9. Diretrizes de Segurança

### 9.1 Autenticação

- Sessão gerenciada pelo Firebase Auth SDK (token JWT renovado automaticamente)
- Nunca armazenar credenciais em `localStorage`; usar apenas o estado em memória via `onAuthStateChanged`
- Logout deve chamar `signOut(auth)` e limpar store Zustand
- Implementar timeout de sessão inativa (ex: após 8h sem uso)

### 9.2 Validação de Dados

- **Frontend:** validação com Zod em todos os formulários antes do envio
- **Backend:** Firestore Security Rules são a última linha de defesa; nunca confiar apenas no frontend
- Sanitizar strings antes de salvar (trim, remoção de HTML tags)
- Campos monetários (`oferta`) devem ser validados como número positivo com no máximo 2 casas decimais

### 9.3 Configuração do Firebase

- Variáveis de configuração do Firebase devem estar em `.env` (prefixo `VITE_`)
- O arquivo `.env` nunca deve ser commitado no Git; adicionar ao `.gitignore`
- Criar `.env.example` com os nomes das variáveis sem valores
- Restringir as chaves de API do Firebase no Google Cloud Console:
  - Restringir por referência HTTP (domínio de produção + `localhost` para dev)
  - Habilitar somente os serviços necessários (Auth, Firestore, Hosting)

### 9.4 Proteção de Rotas

- Todo componente de rota privada deve verificar autenticação via `ProtectedRoute`
- Verificar o `role` do usuário para rotas administrativas
- Em caso de acesso não autorizado, redirecionar para `/login` ou `/` conforme o caso

### 9.5 Auditoria

- Todos os documentos Firestore devem conter `createdBy` (UID do usuário) e `updatedAt`
- Registrar tentativas de acesso negado nos logs do Firebase

### 9.6 Regras de Ambiente

```
# .env.example
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 10. Inicialização do Firebase

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 11. Fluxo Principal de Uso (Happy Path)

```
1. Secretário faz login
2. Cadastra alunos novos em /alunos/novo
3. Cria classes em /classes/nova (define professor responsável)
4. Matricula alunos nas classes via /classes/:id (modal de matrícula)
5. No domingo, acessa /classes/:id/aulas/nova
   → Preenche data, estado do tempo, bíblias, revistas, oferta, visitantes
   → Salva → sistema cria registros de frequência para todos os matriculados ativos
6. Marca presença em /classes/:id/aulas/:aulaId (toggle por aluno)
7. Ao final do culto, acessa /relatorios/domingo
   → Seleciona a data → visualiza e imprime o Relatório do Domingo
8. Ao final do trimestre, acessa /relatorios/frequencia
   → Seleciona classe e trimestre → visualiza e imprime o Registro de Frequência
```

---

## 12. Convenções de Código

- **TypeScript strict mode** habilitado (`"strict": true` no tsconfig)
- Nenhum uso de `any`; preferir tipos explícitos ou `unknown` com narrowing
- Componentes React: Function Components com TypeScript; sem Class Components
- Hooks customizados prefixados com `use` (ex: `useAlunos`, `useFrequencia`)
- Services Firestore exportam funções puras (não classes), ex: `getAlunos()`, `createAula()`
- Imports absolutos configurados via `vite.config.ts` (`@/` → `src/`)
- Prettier + ESLint configurados; rodar `lint` e `format` antes de commitar

---

## 13. Scripts do Projeto

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives",
    "format": "prettier --write src",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "deploy": "npm run build && firebase deploy"
  }
}
```

---

## 14. Checklist de Desenvolvimento

### Fase 1 — Fundação
- [ ] Criar projeto Vite + React + TypeScript
- [ ] Configurar Tailwind CSS e shadcn/ui
- [ ] Criar projeto Firebase (Auth + Firestore + Hosting)
- [ ] Configurar `.env` e `firebase.ts`
- [ ] Implementar autenticação (login, logout, recuperação de senha)
- [ ] Implementar `ProtectedRoute` e verificação de role
- [ ] Criar `AppLayout` com Sidebar responsiva

### Fase 2 — CRUD Base
- [ ] Módulo Alunos (lista, formulário, detalhe)
- [ ] Módulo Classes (lista, formulário, detalhe)
- [ ] Módulo Matrículas (modal, listagem, cancelamento)

### Fase 3 — Registro de Aulas e Frequência
- [ ] Formulário de nova aula
- [ ] Criação automática de registros de frequência
- [ ] Tela de lista de presença com toggle e sync em tempo real
- [ ] Edição de aula: rota `/classes/:id/aulas/:aulaId/editar`, botão na FrequenciaPage restrito a admin/secretario, sem recriar registros de frequência

### Fase 4 — Relatórios
- [ ] Relatório por Domingo (tabela + impressão)
- [ ] Registro de Frequência Trimestral (tabela + impressão)
- [ ] Dashboard com cards e gráficos

### Fase 5 — Qualidade e Deploy
- [ ] Escrever Firestore Security Rules e testar com emulador
- [ ] Testes unitários dos services e hooks principais
- [ ] Otimização de performance (memoização, lazy loading de rotas)
- [ ] Deploy no Firebase Hosting
- [ ] Configurar regras de restrição da API key no Google Cloud Console
