// 函式：計算移動平均
function calculateCenteredMovingAverage(dataArray, windowSize) {
    const movingAverage = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < dataArray.length; i++) {
        // 定義左右兩側的起始和結束索引
        const start = i - halfWindow;
        const end = i + halfWindow;

        // 處理邊界情況：當索引超出陣列範圍時，只取可用的數據
        const windowData = dataArray.slice(Math.max(0, start), Math.min(dataArray.length, end + 1));
        
        // 計算窗口內數據的平均值
        const sum = windowData.reduce((a, b) => a + b, 0);
        const average = sum / windowData.length;
        
        movingAverage.push(average);
    }
    return movingAverage;
}

// 取得 HTML 元素
const maSelector = document.getElementById('ma-selector');

// 初始化圖表
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: '移動平均', // 這裡的標籤會動態更新
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2.4,
                tension: 0.3,
                fill: false,
                pointRadius: 0,
                pointHitRadius: 0
            },
            {
                label: '電流量測數據',
                data: [],
                borderColor: 'rgba(118, 216, 216, 0.6)',
                borderWidth: 1.2,
                tension: 0.3,
                fill: false,
                pointRadius: 0
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false,
                max: 520,
                min: 470,
                title: {
                    display: true,
                    text: '數值'
                }
            },
            x: {
                title: {
                    display: true,
                    text: '時間'
                }
            }
        },
        animation: {
            duration: 1000
        },
        plugins: {
            zoom: {
                zoom: {
                    // 啟用滾輪縮放
                    wheel: {
                        enabled: true,
                    },
                    // 啟用滑鼠拖曳框選縮放
                    drag: {
                        enabled: false,
                    },
                    // 設定縮放模式（xy 軸同時或單獨）
                    mode: 'x',
                },
                pan: {
                    // 啟用平移功能
                    enabled: true,
                    mode: 'x',
                }
            }
        }
    }
});

// 函式：從伺服器獲取並更新圖表
async function fetchAndUpdateChart() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        if (data.labels && data.values) {
            // 原始數據
            myChart.data.labels = data.labels.map(e=>{return e.substring(11,19)});
            myChart.data.datasets[1].data = data.values;
            
            // 根據選擇器的值，計算移動平均線
            const maWindowSize = parseInt(maSelector.value, 10);
            const maValues = calculateCenteredMovingAverage(data.values, maWindowSize);

            // 更新移動平均線的數據和標籤
            myChart.data.datasets[0].data = maValues;
            myChart.data.datasets[0].label = `${maWindowSize} 點移動平均`;            
            
            myChart.update();
        }
    } catch (error) {
        console.error('更新圖表失敗:', error);
    }
}

// 監聽選擇器變動事件，立即更新圖表
maSelector.addEventListener('change', fetchAndUpdateChart);

// 每 3 秒自動更新一次
setInterval(fetchAndUpdateChart, 3000);

// 在頁面載入時先執行一次
fetchAndUpdateChart();