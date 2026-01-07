# Deploy no Fly.io - Guia Completo

## Pré-requisitos

1. Conta no [Fly.io](https://fly.io)
2. Conta no [TiDB Cloud](https://tidb.cloud) (banco de dados MySQL gratuito)
3. Repositório GitHub conectado ao Fly.io

---

## 1. Configurar TiDB Cloud (Banco de Dados)

### 1.1 Criar Cluster no TiDB
1. Acesse https://tidb.cloud e faça login
2. Clique em **Create Cluster** → **Developer Tier** (gratuito)
3. Escolha região (preferencialmente **East US** ou **West US** para latência menor com Fly.io)
4. Aguarde a criação do cluster (~5 minutos)

### 1.2 Obter String de Conexão
1. No TiDB Cloud, vá em **Connect** → **Get Connection String**
2. Copie a string no formato:
   ```
   mysql -h gateway01.us-east-1.prod.cloud.tidb.cloud -P 4000 -u xxxxxx -p --ssl-ca=/path/to/ca.pem
   ```
3. Extraia os valores:
   - `DB_HOST`: gateway01.us-east-1.prod.cloud.tidb.cloud
   - `DB_PORT`: 4000
   - `DB_USER`: seu usuário
   - `DB_PASSWORD`: sua senha
   - `DB_NAME`: test (ou o nome do banco)

---

## 2. Configurar Variáveis de Ambiente no Fly.io

### 2.1 Via CLI (Recomendado)

```bash
# Instalar CLI do Fly.io
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"

# Fazer login
fly auth login

# Ir para o diretório do backend
cd backend

# Configurar secrets (substitua os valores)
fly secrets set \
  NODE_ENV=production \
  DB_HOST="gateway01.us-east-1.prod.cloud.tidb.cloud" \
  DB_PORT=4000 \
  DB_NAME="test" \
  DB_USER="seu_usuario" \
  DB_PASSWORD="sua_senha_super_secreta" \
  JWT_SECRET="gerar-nova-chave-com-node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"" \
  CLOUDINARY_CLOUD_NAME="dzng8udvw" \
  CLOUDINARY_API_KEY="sua_api_key" \
  CLOUDINARY_API_SECRET="sua_api_secret" \
  STRIPE_SECRET_KEY="sk_test_..." \
  STRIPE_API_SECRET="pk_test_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  FRONTEND_URL="https://seu-frontend.vercel.app" \
  EMAILJS_SERVICE_ID="sua_service_id" \
  EMAILJS_PUBLIC_KEY="sua_public_key" \
  EMAILJS_PRIVATE_KEY="sua_private_key"
```

### 2.2 Via Dashboard
1. Acesse https://fly.io/dashboard
2. Selecione seu app **ecommerce-backend-regil**
3. Vá em **Secrets**
4. Adicione cada variável listada acima

---

## 3. Deploy Automático via GitHub

O Fly.io já está conectado ao seu repositório GitHub. Para cada push na branch principal:

1. O Fly.io detecta automaticamente as mudanças
2. Faz o build do container
3. Faz deploy da nova versão
4. Faz health check

### Forçar Deploy Manual
```bash
fly deploy
```

---

## 4. Verificar Status do Deploy

```bash
# Ver status das máquinas
fly status

# Ver logs
fly logs

# Ver métricas
fly metrics
```

---

## 5. Health Check

O endpoint de health check está configurado em `/api/health`:

```bash
# Testar health check
curl https://ecommerce-backend-regil.fly.dev/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-...",
  "uptime": 123.456,
  ...
}
```

---

## 6. Troubleshooting

### Erro de Conexão com MySQL
```bash
# Ver logs do app
fly logs | grep -i mysql

# Verificar variáveis de ambiente
fly secrets list
```

### Máquina não inicia
```bash
# Verificar status
fly status

# Verificar problemas de build
fly deploy --verbose
```

### Health Check Falhando
```bash
# Testar conectividade
fly ssh console -C "curl -v http://localhost:8080/api/health"
```

---

## 7. Comandos Úteis

```bash
# Restart do app
fly restart

# Acessar console do app
fly ssh console

# Ver configuração
fly config show

# Escalar recursos
fly scale count 1
fly scale memory 512
fly scale vm shared-cpu-1x

# Deletar app (cuidado!)
fly apps destroy ecommerce-backend-regil
```

---

## 8. Variáveis de Ambiente Necessárias

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `NODE_ENV` | `production` | ✅ |
| `DB_HOST` | Host do TiDB Cloud | ✅ |
| `DB_PORT` | Porta (4000 no TiDB) | ✅ |
| `DB_NAME` | Nome do banco | ✅ |
| `DB_USER` | Usuário do banco | ✅ |
| `DB_PASSWORD` | Senha do banco | ✅ |
| `JWT_SECRET` | Chave para tokens JWT | ✅ |
| `FRONTEND_URL` | URL do frontend | ✅ |
| `CLOUDINARY_*` | Configuração Cloudinary | ✅ |
| `STRIPE_*` | Configuração Stripe | ✅ |
| `EMAILJS_*` | Configuração EmailJS | ❌ |
| `PORT` | Porta do app (8080) | ✅ (automático) |

---

## 9. Links Importantes

- **Dashboard Fly.io**: https://fly.io/dashboard
- **TiDB Cloud**: https://tidb.cloud
- **Documentação Fly.io**: https://fly.io/docs
- **Status do App**: https://ecommerce-backend-regil.fly.dev
- **API Health**: https://ecommerce-backend-regil.fly.dev/api/health

---

## ⚠️ Segurança - IMPORTANTE

1. **NUNCA commite o arquivo `.env`** - já está no `.gitignore`
2. **Gire as chaves expostas** - as chaves JWT_SECRET, STRIPE_SECRET_KEY e DEEPSEEK_API_KEY foram compartilhadas publicamente
3. **Use secrets do Fly.io** - nunca coloque valores sensíveis no código
4. **Limite de acesso** - configure as permissões no TiDB Cloud para IP do Fly.io

