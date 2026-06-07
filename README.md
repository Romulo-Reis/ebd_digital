# EBD Manager

Aplicação web para gestão digital da Escola Bíblica Dominical (EBD), substituindo os registros manuais em papel por uma solução online.

## Funcionalidades

- **Alunos** — cadastro, edição, ativação/inativação
- **Classes** — criação e gerenciamento de turmas com professor responsável
- **Matrículas** — matrícula e cancelamento de alunos por classe
- **Aulas e Frequência** — registro de aulas dominicais com marcação de presença em tempo real (toggle com sincronização automática)
- **Relatório do Domingo** — resumo de todas as classes do domingo com comparativo do domingo anterior, pronto para impressão
- **Registro de Frequência Trimestral** — tabela ●/F por aluno e domingo, com totais e percentuais, pronto para impressão
- **Painel (Dashboard)** — visão geral com total de alunos, classes ativas e frequência média

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| `admin` | Acesso total, incluindo gerenciamento de usuários |
| `secretario` | CRUD de alunos, classes, matrículas, aulas e frequências; relatórios |
| `professor` | Visualiza sua classe e registra frequência das suas aulas |

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS + shadcn/ui |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod |
| Estado global | Zustand |
| Backend / Banco | Firebase (Auth + Firestore) |
| Hospedagem | Firebase Hosting |

## Pré-requisitos

- Node.js 18+
- Conta no [Firebase](https://firebase.google.com) com um projeto criado (Auth + Firestore + Hosting habilitados)
- Firebase CLI instalado globalmente: `npm install -g firebase-tools`

## Configuração

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd edb_digital
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Firebase:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

As credenciais estão disponíveis no Firebase Console em **Configurações do Projeto → Seus aplicativos → SDK de configuração**.

### 3. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Criando o primeiro usuário

O app usa Firebase Authentication. Para criar o primeiro usuário administrador:

1. No Firebase Console, vá em **Authentication → Users → Adicionar usuário** e crie o e-mail/senha.
2. Copie o UID gerado.
3. No Firestore, crie o documento `users/{UID}` com os campos:

```json
{
  "uid": "SEU_UID",
  "email": "seu@email.com",
  "nome": "Seu Nome",
  "role": "admin"
}
```

Os próximos usuários podem ser criados da mesma forma, usando `role: "secretario"` ou `role: "professor"`.

## Scripts disponíveis

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (TypeScript + Vite)
npm run preview    # preview do build local
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Vitest
npm run deploy     # build + deploy no Firebase Hosting
```

## Deploy

```bash
firebase login
firebase use --add   # selecione o projeto Firebase
npm run deploy
```

## Estrutura do projeto

```
src/
├── components/
│   ├── ui/          # Componentes shadcn/ui
│   ├── layout/      # AppLayout, Sidebar, Header
│   └── shared/      # ProtectedRoute, LoadingSpinner, ConfirmDialog
├── features/
│   ├── auth/        # Login, recuperação de senha, hook de autenticação
│   ├── alunos/      # Listagem, formulário e detalhe de alunos
│   ├── classes/     # Listagem, formulário e detalhe de classes
│   ├── matriculas/  # Modal de matrícula e service
│   ├── aulas/       # Formulário de aula e página de frequência
│   ├── relatorios/  # Relatório do Domingo e Frequência Trimestral
│   ├── dashboard/   # Painel principal
│   └── usuarios/    # Listagem de usuários (admin)
├── lib/
│   ├── firebase.ts  # Inicialização do Firebase
│   ├── firestore.ts # Helpers genéricos de CRUD
│   └── utils.ts     # Formatação de datas, moeda, etc.
├── store/
│   └── authStore.ts # Estado de autenticação (Zustand)
└── types/
    └── index.ts     # Tipos TypeScript globais
```

## Segurança

- As **Firestore Security Rules** (`firestore.rules`) garantem que cada perfil só acessa o que lhe é permitido — a validação no frontend é complementar, nunca exclusiva.
- As credenciais do Firebase ficam em `.env` (nunca commitado no Git).
- O arquivo `.env.example` documenta as variáveis necessárias sem expor valores reais.
- Recomenda-se restringir a API Key do Firebase no Google Cloud Console para o domínio de produção.
