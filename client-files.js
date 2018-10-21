const net = require('net');
const fs = require('fs');
const path = require("path");
const port = 8124;
const dirs = process.argv;
const client = new net.Socket();
const filesRequest = 'FILES';
const accept = 'ACK';
const decline = 'DEC';
const requestOnNextFile = 'REMAINING_FILES'

let arrOfFilespath = [];
client.setEncoding('utf8');

getDirs();

client.connect(port, () => {

    client.write(filesRequest);
});

client.on('data', (data) => {
    console.log(data);
    console.log(arrOfFilespath);
    if(arrOfFilespath.length === 0)
        client.destroy();
    else if (data === decline) {
        client.destroy();
    }
    else if (data === requestOnNextFile || data === accept) {
        sendFile();
    }
});

client.on('close', function () {
    console.log('Connection closed');
});
function getDirs() {
    for (let i = 2; i < dirs.length; i++)
    {
        readFiles(dirs[i]);
    }
}

function readFiles(dir) {
    fs.readdir(dir, (err, files) => {
        files.forEach((file) => {
            file = dir + path.sep + file;
            fs.lstat(file, (err, stats) => {
                if (stats.isFile())
                    arrOfFilespath.push(file);
                else
                    readFiles(file);
            })
        });
    })
}

function sendFile() {
    let filePath = arrOfFilespath.pop();
    fs.readFile(filePath, (err, data) => {
        let buf = data.toString('hex');
        client.write(buf);
        client.write(path.basename(filePath));
    })
}