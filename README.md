# 🚗 Fernandes Auto Tech — MVP

Sistema completo de Estética Automotiva Premium com Landing Page, Dashboard do Cliente e Painel Administrativo.

---

## 📦 Estrutura do Projeto

```
fernandeslavajato/
├── database/
│   └── schema.sql          ← Execute no PostgreSQL primeiro
├── backend/
│   ├── .env.example        ← Copie para .env e preencha
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── db.js
│       ├── middleware/
│       ├── controllers/
│       └── routes/
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        └── pages/
            ├── LandingPage.jsx
            ├── ClientDashboard.jsx
            ├── AdminLogin.jsx
            └── AdminDashboard.jsx
```

---

## 🗄️ Passo 1 — Banco de Dados (PostgreSQL)

1. Abra o **PGAdmin** ou um terminal `psql`
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE fernandes_autotech;
   ```
3. Execute o schema:
   ```bash
   psql -U postgres -d fernandes_autotech -f database/schema.sql
   ```
   Ou cole o conteúdo de `database/schema.sql` diretamente no Query Tool do PGAdmin.

---

## ⚙️ Passo 2 — Backend (Node.js)

```bash
cd backend

# 1. Copiar variáveis de ambiente
copy .env.example .env      # Windows
# cp .env.example .env      # Linux/Mac

# 2. Editar o .env com suas configurações
#    - DB_PASSWORD: sua senha do PostgreSQL
#    - JWT_SECRET: uma chave aleatória forte
#    - ADMIN_EMAIL e ADMIN_PASSWORD: suas credenciais
#    - WHATSAPP_NUMERO: seu número (ex: 5511999999999)

# 3. Instalar dependências
npm install

# 4. Rodar em modo desenvolvimento
npm run dev
```

O backend rodará em: `http://localhost:3001`

Teste se está funcionando: `http://localhost:3001/api/health`

---

## 🎨 Passo 3 — Frontend (React + Vite)

```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. Rodar o servidor de desenvolvimento
npm run dev
```

O frontend rodará em: `http://localhost:5173`

> O proxy do Vite encaminha automaticamente `/api/*` → `http://localhost:3001`

---

## 🔐 Acesso ao Painel Admin

- URL: `http://localhost:5173/admin/login`
- Email: o que você definiu em `.env` → `ADMIN_EMAIL`
- Senha: o que você definiu em `.env` → `ADMIN_PASSWORD`

---

## 📱 Rotas do Sistema

| Rota                    | Descrição                             | Acesso     |
|-------------------------|---------------------------------------|------------|
| `/`                     | Landing Page pública                  | Público    |
| `/status/:token`        | Dashboard do cliente (link único)     | Público    |
| `/admin/login`          | Login do administrador                | Público    |
| `/admin`                | Painel administrativo                 | Admin JWT  |

---

## 🔗 API Endpoints

| Método | Endpoint                            | Descrição                  |
|--------|-------------------------------------|----------------------------|
| POST   | `/api/agendamentos`                 | Criar agendamento          |
| GET    | `/api/agendamentos/status/:token`   | Status do cliente          |
| GET    | `/api/agendamentos`                 | Listar todos (admin)       |
| GET    | `/api/agendamentos/patio`           | Veículos no pátio (admin)  |
| PUT    | `/api/agendamentos/:id/status`      | Mudar status (admin)       |
| POST   | `/api/agendamentos/:id/checklist`   | Adicionar foto (admin)     |
| GET    | `/api/servicos`                     | Listar serviços            |
| GET    | `/api/clientes`                     | Listar clientes (admin)    |
| GET    | `/api/relatorios/resumo`            | Resumo financeiro (admin)  |
| GET    | `/api/relatorios/faturamento`       | Gráfico faturamento (admin)|
| POST   | `/api/auth/login`                   | Login admin                |

---

## 🛠️ Stack Tecnológica

| Camada    | Tecnologia                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, React Router v6         |
| Backend   | Node.js, Express 4                      |
| Banco     | PostgreSQL 14+                          |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| Upload    | Multer (fotos do checklist)             |
| Estilo    | CSS puro (Dark/Glassmorphism)           |
| Fonte     | Inter (Google Fonts)                    |

---

## 🎨 Design System

| Token         | Valor      |
|---------------|------------|
| `--bg`        | `#0f172a`  |
| `--blue`      | `#3b82f6`  |
| `--purple`    | `#8b5cf6`  |
| Fonte         | Inter      |
| Layout        | Mobile First |

---

## 📋 Fluxo de Status do Serviço

```
recebido → em_lavagem → detalhamento → finalizado → pronto_retirada
```

---

## ✅ Funcionalidades Implementadas

- [x] Landing Page com Hero animado + cards de serviços
- [x] Formulário de agendamento com link WhatsApp para o dono
- [x] Dashboard do cliente com status em tempo real (polling 30s)
- [x] Kanban do pátio com atualização de status em 1 clique
- [x] Checklist de entrada com upload de fotos
- [x] Relatório financeiro com gráfico (diário/semanal/mensal)
- [x] CRM de clientes com botão WhatsApp direto
- [x] Login admin com JWT
- [x] Schema PostgreSQL completo com triggers e views
- [x] Design Dark/Glassmorphism totalmente responsivo

---

## 📞 Suporte

Desenvolvido para **Fernandes Auto Tech** — Estética Automotiva Premium.
