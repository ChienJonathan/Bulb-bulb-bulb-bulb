const express = require('express');
const path = require('path');
const fs = require('fs'); // 引入 fs 模組
const app = express();
const PORT = 3000;

// 設置靜態檔案目錄 (public 資料夾)
app.use(express.static(path.join(__dirname, 'public')));

// 檔案路徑設定
const csvFilePath = path.join(__dirname, 'arduino_data.csv');

// 處理數據的 API
app.get('/api/data', (req, res) => {
    // 讀取 CSV 檔案
    fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取 CSV 檔案失敗:', err);
            // 當檔案不存在或讀取失敗時回傳錯誤
            return res.status(500).json({ error: '無法讀取數據檔案' });
        }

        // 將 CSV 數據轉換成 JSON 格式
        // 假設 CSV 格式是： Timestamp,Data
        const lines = data.trim().split('\n'); // 移除首尾空白並按行分割
        
        // 移除 CSV 標題行，從索引 1 開始
        const dataRows = lines.slice(1);

        // 整理數據成前端需要的格式
        const formattedData = {
            labels: [],
            values: []
        };

        dataRows.forEach(line => {
            const [timestamp, value] = line.split(',');
            if (timestamp && value) {
                formattedData.labels.push(timestamp);
                formattedData.values.push(parseFloat(value)); // 將數值轉換為浮點數
            }
        });

        // 將整理好的數據以 JSON 格式回傳
        res.json(formattedData);
    });
});

app.listen(PORT, () => {
    console.log(`伺服器已啟動，請訪問 http://localhost:${PORT}`);
});