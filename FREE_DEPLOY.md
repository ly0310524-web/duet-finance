# 免費固定網址部署

Render Free 可以提供固定的 `onrender.com` 網址；本專案的網站與 LINE worker 已合併在同一個免費 Web Service。請先建立 Neon 或 Supabase 免費 PostgreSQL，取得 `DATABASE_URL`，再用 Render Blueprint 部署 `render.yaml`。這一步是永久配對的必要條件；Render Web Service 的本機檔案在更新時會被替換，不能拿來保存 LINE 綁定或帳本。

部署順序：

1. 在 Render 登入並選擇 **New → Blueprint**。
2. 連接這個專案的 Git repository，選擇 `render.yaml`。
3. 填入 Neon/Supabase 的 `DATABASE_URL`。
4. 填入 LINE 與 AI 環境變數；`LINE_PAIRING_CODE` 填 `8888`。
5. 部署完成後，Render 會產生固定網址，例如 `https://duet-finance.onrender.com`。
6. 把 `APP_URL` 設成這個網址。
7. LINE Webhook 設成 `https://duet-finance.onrender.com/api/line/webhook`。
8. 在 LINE Developers 開啟 Use webhook。

Render Free 服務閒置後可能休眠，第一次請求會慢幾秒；要讓 LINE 即時穩定處理，需升級常駐方案或使用免費但需要帳號設定的其他主機。
