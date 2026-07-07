# LeitorBoleto

Extensão para navegador que funciona como leitor de código de barras para boletos.

## Desenvolvimento

```bash
npm install
npm run build
```

Carregue a pasta `dist/` no Chrome em `chrome://extensions` → **Carregar sem compactação**.

Para rebuild automático durante o desenvolvimento:

```bash
npm run dev
```

Após cada rebuild, recarregue a extensão no Chrome.

## Dependências npm

As libs de terceiros são instaladas via npm e bundladas no build:

- [`javascript-barcode-reader`](https://www.npmjs.com/package/javascript-barcode-reader) — decodificação do código de barras
- [`@mrmgomes/boleto-utils`](https://www.npmjs.com/package/@mrmgomes/boleto-utils) — formatação da linha digitável

A extensão em si **não** é instalada como módulo npm — o Chrome carrega a pasta `dist/` gerada pelo build. O npm gerencia apenas o código-fonte e as dependências durante o desenvolvimento.

## Estrutura

```
src/
  background/     # service worker
  content/        # overlay, leitura e dialog
  shared/         # mensageria, debug e utilitários
public/icons/     # ícones da extensão
dist/             # saída do build (carregar no Chrome)
```

## Uso

1. Abra uma página com boleto visível
2. Clique no ícone da extensão
3. Selecione a área do código de barras com dois cliques
4. A linha digitável formatada será exibida e copiada automaticamente

Pressione **Esc** para cancelar a seleção.

## Depuração

Logs com prefixo `[LeitorBoleto]` estão ativos apenas em `npm run dev`. O build de produção (`npm run build`) desativa os logs e minifica o código.

Os logs aparecem no console do **service worker** (background) e no console da **página** (content script).
