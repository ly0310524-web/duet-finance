# Duet 共同財務

雙人 LINE AI 智慧記帳與精品級財務中控。所有金額從 PostgreSQL 有效交易計算，預設 Asia/Taipei 與 CNY；公司帳本與日常帳本分離，只有兩位授權 LINE userId 可使用。

## 本機啟動

```bash
cp .env.example .env.local
# 編輯 .env.local；不要把秘密提交到 Git
npm install
npm run db:local
# 另一個 terminal
npx prisma migrate dev --name init
npm run rich-menu:generate
npm run dev
```

開啟 `http://localhost:3000`，使用本機測試身份登入。若資料庫尚未啟動，網站會保留清楚錯誤狀態，不會產生假資料。

## LINE 正式設定

`.env.local` 填入 `LINE_CHANNEL_SECRET`、`LINE_CHANNEL_ACCESS_TOKEN`、兩位 `LINE_ALLOWED_USER_IDS`、LINE Login Channel ID／Secret、公開 `APP_URL`。Messaging API Webhook 設為 `https://你的網域/api/line/webhook`，啟動 `npm run worker`，再執行 `npm run rich-menu:deploy`。部署需要 HTTPS；Rich Menu 圖片為 `public/rich-menu.png`（2500×1686）。第六格開啟 `APP_URL`，前五格是唯讀 Postback 查詢。

正式環境必須設 `DEV_AUTH_ENABLED=false`，提供 HTTPS、PostgreSQL、SESSION_SECRET 與 AI API Key。LINE Reply Token 超時時，worker 不會重播舊 token 或偷偷寫入；原始事件及失敗狀態保留於 `WebhookJob`。

## 核心規則

- `存1000` 是日常支出 `save` 並增加共同存款；`取500` 是日常收入 `save`，共同存款不足時整筆拒絕。
- 所有存取款在 PostgreSQL advisory lock 內驗證，避免並發取款造成負餘額。
- LINE event ID、message ID 去重；查詢 Postback 不會寫入交易。
- 修改採版本檢查，刪除為軟刪除並可從「功能設定」恢復；AuditLog 保留前後值。
- AI 僅在固定規則無法判斷時執行，輸出 Zod 驗證結構，不可直接修改資料庫。

## 測試

```bash
npm run rich-menu:generate
npx tsc --noEmit
npm run build
```

若需要測試 LINE 簽名，可用 `openssl dgst -sha256 -hmac "$LINE_CHANNEL_SECRET" -binary | base64` 產生 `X-Line-Signature`。

## 8888 綁定

當 `LINE_PAIRING_ENABLED=true` 且 `LINE_PAIRING_CODE=8888` 時，未綁定的 LINE 帳號傳送單獨一則 `8888`，系統會把它綁定到下一個空缺成員名額；第三個帳號會收到名額已滿。正式使用後請改用更難猜的碼並重新部署環境變數。

目前本機測試 HTTPS Webhook URL：
`https://petite-turkeys-switch.loca.lt/api/line/webhook`

這是暫時 tunnel URL，重啟 tunnel 後會改變。LINE Developers 後台仍需把「啟用 Webhook／Use webhook」切換為開啟；API 已寫入 endpoint，但 LINE 回報目前 `active: false`，這個開關由官方帳號管理頁控制。
