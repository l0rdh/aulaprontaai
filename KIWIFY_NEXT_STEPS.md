# ✅ Integração Kiwify Configurada!

## 📋 Status da Configuração

✅ **Credenciais adicionadas:**
- `KIWIFY_CLIENT_ID`: `afca4a71-7891-4496-95e5-ca5e980506b6`
- `KIWIFY_CLIENT_SECRET`: `50f6a0a0de60677775bc61d619a2655cb27c1b39fa1197e5658364a47bb95853`
- `KIWIFY_ACCOUNT_ID`: `ITV7Im2soDttemx`
- `KIWIFY_PRODUCT_ID`: `43892810-a4a4-11f1-a8ba-0ff6dfb77cb3`

## 🔧 Próximo Passo: Configurar Webhook

Para que os pagamentos funcionem corretamente, você precisa configurar um webhook na Kiwify para notificar seu servidor quando um pagamento for recebido.

### 1. Acessar Configurações de Webhook

1. Vá para https://app.kiwify.com.br
2. Clique em **⚙️ Configurações**
3. Vá para **Webhooks** ou **Integrações**

### 2. Criar Novo Webhook

Clique em **+ Novo Webhook** ou **Adicionar Webhook**

Preencha os dados:

**URL do Webhook:**
```
https://seu-dominio.com/api/webhooks/kiwify
```

**Eventos a monitorar:**
- ✅ Pedido criado
- ✅ Pedido atualizado
- ✅ Pagamento recebido
- ✅ Pagamento confirmado
- ✅ Reembolso

### 3. Copiar Secret Key

Após criar o webhook, a Kiwify vai gerar uma **Secret Key**.

Copie essa chave e adicione ao `.env.local`:

```env
KIWIFY_WEBHOOK_SECRET=sua_secret_key_aqui
```

## 🧪 Testando Localmente com ngrok

Se você está desenvolvendo localmente, pode usar **ngrok** para expor seu servidor:

```bash
# 1. Instalar ngrok (se não tiver)
# Windows: choco install ngrok
# Mac: brew install ngrok

# 2. Iniciar seu servidor
npm run dev

# 3. Em outro terminal, rodar ngrok
ngrok http 5173

# 4. Copiar a URL (ex: https://abc123.ngrok.io)
# e usar no webhook: https://abc123.ngrok.io/api/webhooks/kiwify
```

## 🔄 Fluxo de Pagamento

Agora o fluxo funciona assim:

1. **Usuário clica "Assinar Pro"** na dashboard
2. **Redirecionado para Kiwify checkout** com as credenciais configuradas
3. **Usuário paga** (PIX, Cartão, Boleto, etc)
4. **Kiwify envia webhook** para seu servidor
5. **Servidor valida** a assinatura e atualiza o plano
6. **Usuário vê** o painel atualizado com "Pro"

## 📊 Verificar Pagamentos

Para ver os pagamentos recebidos, acesse:

**Dashboard Kiwify:**
- https://app.kiwify.com.br/orders

**Banco de dados (Supabase):**
```sql
SELECT * FROM public.kiwify_transactions 
ORDER BY created_at DESC;
```

## 🆘 Troubleshooting

### Webhook não está sendo chamado
1. Certifique-se que a URL é acessível (não localhost)
2. Teste com ngrok se estiver desenvolvendo localmente
3. Verifique os logs do servidor em `/api/webhooks/kiwify`

### "Webhook secret inválido"
1. Certifique-se que copiou o secret exatamente como aparece
2. Não inclua espaços no início ou fim
3. Se mudou o secret, atualize em `.env.local`

### "User not found"
1. Verifique se o email no checkout é o mesmo da conta
2. Certifique-se que o usuário existe em `profiles` com o email correto

## ✨ Próximos Passos

- [ ] Configurar webhook secret no `.env.local`
- [ ] Testar fluxo de checkout completo
- [ ] Configurar emails de confirmação de pagamento
- [ ] Adicionar suporte a cancelamento de assinatura
- [ ] Criar dashboard de relatórios de vendas

## 📚 Referências

- [Documentação Kiwify](https://kiwify.gitbook.io/kiwify/)
- [Kiwify Webhooks](https://kiwify.gitbook.io/kiwify/webhooks)
- [Kiwify API](https://kiwify.gitbook.io/kiwify/api)
