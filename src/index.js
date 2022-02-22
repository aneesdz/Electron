const { Console } = require('console');
const { app, BrowserWindow } = require('electron');
const os = require('os-utils');
const path = require('path');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.emit

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'binary') {
            console.log("Sending: '" + message.binaryData + "'");
        }
    });

   
    
    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});

client.connect('ws://localhost:8080/', 'echo-protocol');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

//CPU Information
const si = require('systeminformation');
const websocket = require('websocket/lib/websocket');

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    // icon: __dirname + '/icon.ico',
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  setInterval(() => {
    os.cpuUsage(function(v){
      mainWindow.webContents.send('cpu',v*100);
      mainWindow.webContents.send('mem',os.freememPercentage()*100);
      mainWindow.webContents.send('total-mem',os.totalmem()/1024);      
    });
    
    si.cpu(function(v){
      mainWindow.webContents.send('cpu-speed',v.speed);   
      mainWindow.webContents.send('cpu-cores',v.cores);
      mainWindow.webContents.send('cpu-manufacturer',v.manufacturer);
      mainWindow.webContents.send('cpu-speedMin',v.speedMin);
      mainWindow.webContents.send('cpu-speedMax',v.speedMax);
      mainWindow.webContents.send('cpu-processors',v.processors);
      
    });
    si.osInfo(function(v){
      mainWindow.webContents.send('cpu-logofile',v.logofile);
    });

    si.currentLoad(function(v){
      mainWindow.webContents.send('cpu-currentLoad',v.currentLoad); 
      mainWindow.webContents.send('cpu-avgLoad',v.avgLoad);    
    });
    si.networkStats().then(data => {
      mainWindow.webContents.send('data-receive',bytesToSize(data[0].rx_sec)); 
      mainWindow.webContents.send('data-transfer',bytesToSize(data[0].tx_sec));
    });
    si.system(function(v){
      mainWindow.webContents.send('manufacturer',v.manufacturer); 
    })
    },1000)
  };

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//Network speed

function bytesToSize(bytes) {
  // console.log(bytes)
  var sizes = ['B', 'K', 'M', 'G', 'T', 'P'];
  if (bytes != null){    
    for (var i = 0; i < sizes.length; i++) {
      if (bytes <= 1024) {
        return bytes + ' ' + sizes[i];
      } else {
        bytes = parseFloat(bytes / 1024).toFixed(2)
      }
    }
    // console.log(bytes)
    return bytes + ' P';
  }
  return 0;
}