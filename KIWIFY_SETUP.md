# 🔗 Integração Kiwify

Este projeto utiliza a Kiwify como gateway de pagamentos para o plano Pro.

## 📋 Pré-requisitos

1. ✅ Conta criada na Kiwify (https://kiwify.com.br)
2. ✅ Produto/Plano criado no dashboard da Kiwify
3. ✅ Variáveis de ambiente configuradas

## 🚀 Passos de Configuração

### 1. Criar o Produto na Kiwify

1. Acesse o [Dashboard da Kiwify](https://app.kiwify.com.br)
2. Vá para **Produtos** > **Novo Produto**
3. Preencha os dados:
   - **Nome**: AulaPronta Pro
   - **Descrição**: Plano Pro com acesso a avaliações ilimitadas
   - **Preço**: R$ 19,90
   - **Tipo**: Recorrente (Mensal)
   - **URL de retorno**: `https://seu-dominio.com/dashboard`

4. Copie o **ID do Produto** (você vai precisar disso)

### 2. Configurar Webhooks

1. No Dashboard da Kiwify, vá para **Configurações** > **Webhooks**
2. Clique em **Novo Webhook**
3. Preencha:
   - **URL do Webhook**: `https://seu-dominio.com/api/webhooks/kiwify`
   - **Eventos**: Selecione:
     - ✅ Pedido criado
     - ✅ Pedido atualizado
     - ✅ Pagamento recebido
     - ✅ Pagamento confirmado
     - ✅ Reembolso

4. Copie a **Secret Key** que aparece

### 3. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto (não fazer commit!)
2. Adicione as seguintes variáveis:

```env
# Kiwify
KIWIFY_PRODUCT_ID=seu_id_do_produto_aqui
KIWIFY_WEBHOOK_SECRET=seu_webhook_secret_aqui
KIWIFY_API_KEY=sua_api_key_aqui

# URL da aplicação
APP_URL=https://seu-dominio.com
```

### 4. Deploy

Quando fazer deploy (Vercel, etc):
1. Adicione as mesmas variáveis no painel de ambiente
2. Certifique-se que a URL do webhook está acessível publicamente
3. Teste o webhook usando a ferramenta de teste do Kiwify

## 🧪 Testando Localmente

Para testar o webhook localmente, você pode usar [ngrok](https://ngrok.com):

```bash
# Terminal 1: Iniciar o servidor local
npm run dev

# Terminal 2: Expor localhost para internet
ngrok http 5173

# Copiar a URL que o ngrok gera (ex: https://abc123.ngrok.io)
# e usar no webhook: https://abc123.ngrok.io/api/webhooks/kiwify
```

## 📧 Fluxo de Pagamento

1. **Usuário clica em "Assinar Pro"**
   - Sistema cria uma transação pendente
   - Redireciona para Kiwify

2. **Usuário paga na Kiwify**
   - Pode usar PIX, Cartão de Crédito, Boleto, etc
   - Kiwify processa o pagamento

3. **Webhook notifica seu servidor**
   - Endpoint `/api/webhooks/kiwify` recebe a notificação
   - Valida a assinatura do webhook
   - Atualiza o plano do usuário para "Pro"
   - Concede créditos ilimitados

4. **Usuário vê o painel atualizado**
   - Plano muda para "Pro"
   - Ganha acesso ao gerador de avaliações
   - Créditos mostram "∞" (infinito)

## 🔍 Monitorando Transações

### Ver transações no banco de dados

```sql
SELECT * FROM public.kiwify_transactions 
ORDER BY created_at DESC;
```

### Verificar status de um pedido

```sql
SELECT user_id, status, amount, created_at 
FROM public.kiwify_transactions 
WHERE kiwify_order_id = 'seu_order_id';
```

## 🆘 Troubleshooting

### "Webhook secret inválido"
- Certifique-se que `KIWIFY_WEBHOOK_SECRET` está correto
- Copie exatamente como aparece no dashboard (sem espaços)

### "Usuário não encontrado"
- Verifique se o email no Kiwify corresponde ao email da conta
- Confira a tabela `profiles` no Supabase

### "Transação não aparece no banco"
- Cheque os logs do servidor
- Certifique-se que a URL do webhook é acessível (não localhost)

### Testar webhook manualmente

```bash
curl -X POST http://localhost:5173/api/webhooks/kiwify \
  -H "Content-Type: application/json" \
  -H "x-kiwify-signature: seu_signature" \
  -d '{
    "id": "evt_123",
    "type": "order.payment_confirmed",
    "timestamp": "2026-08-30T10:00:00Z",
    "data": {
      "order_id": "order_abc123",
      "customer_email": "professor@example.com",
      "amount": 1990,
      "status": "completed",
      "payment_method": "pix"
    }
  }'
```

## 📚 Documentação

- [Kiwify API Docs](https://kiwify.gitbook.io/kiwify/)
- [Kiwify Webhooks](https://kiwify.gitbook.io/kiwify/webhooks)

## ✨ Próximos passos

- [ ] Implementar cancelamento de assinatura
- [ ] Adicionar suporte a cupons/desconto
- [ ] Criar dashboard de relatórios de vendas
- [ ] Enviar emails de confirmação de pagamento
- [ ] Implementar retry automático para pagamentos falhados
