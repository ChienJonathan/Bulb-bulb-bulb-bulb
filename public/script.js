// 函式：計算移動平均
function calculateMovingAverage(dataArray, windowSize) {
    const movingAverage = [];
    for (let i = 0; i < dataArray.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const end = i + 1;
        const windowData = dataArray.slice(start, end);

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
                label: 'Arduino 數據',
                data: [],
                borderColor: 'rgba(118, 216, 216, 0.7)',
                borderWidth: 1.4,
                tension: 0.1,
                fill: false,
                pointRadius: 0
            },
            {
                label: '移動平均', // 這裡的標籤會動態更新
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2.4,
                tension: 0.1,
                fill: false,
                pointRadius: 0,
                pointHitRadius: 0
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false,
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
            myChart.data.datasets[0].data = data.values;
            
            // 根據選擇器的值，計算移動平均線
            const maWindowSize = parseInt(maSelector.value, 10);
            const maValues = calculateMovingAverage(data.values, maWindowSize);

            // 更新移動平均線的數據和標籤
            myChart.data.datasets[1].data = maValues;
            myChart.data.datasets[1].label = `${maWindowSize} 點移動平均`;
            
            myChart.update();
        }
    } catch (error) {
        console.error('更新圖表失敗:', error);
    }
}

// 監聽選擇器變動事件，立即更新圖表
maSelector.addEventListener('change', fetchAndUpdateChart);

// 每 3 秒自動更新一次
setInterval(fetchAndUpdateChart, 10000);

// 在頁面載入時先執行一次
fetchAndUpdateChart();