const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs');


const portPath = 'COM5'; // Windows: 'COM3' | macOS/Linux: '/dev/tty.usbmodem14101'
const baudRate = 9600; // 確保與 Arduino 程式碼中的設定一致
const csvFileName = 'arduino_data.csv';


const port = new SerialPort({
    path: portPath,
    baudRate: baudRate
});


const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


fs.writeFileSync(csvFileName, 'Timestamp,Data\n');


parser.on('data', data => {
    console.log(`Received data: ${data}`);

    
    const timestamp = new Date().toISOString();
    const cleanData = data.replace('Data: ', ''); // 移除多餘的字串，只保留數值
    const csvRow = `${timestamp},${cleanData}\n`;

    fs.appendFileSync(csvFileName, csvRow);
});


port.on('error', err => {
    console.error('Serial port error:', err.message);
});


port.on('open', () => {
    console.log(`Serial port opened at ${portPath} with baud rate ${baudRate}`);
    console.log(`Data will be saved to ${csvFileName}`);
});