const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;

const reqFiles = 'FILES';
const reqQA = 'QA';
const resGood = 'ACK';
const resBad = 'DEC';
const resFiles = 'NEXT';
const EOF = 'EOF';
const defaultDir = process.env.FILES_DIR;
const maxConn = parseInt(process.env.CONN);

let seed = 0;
let arr = require('./qa.json')
let clients = [];
let files = [];
let fdFile;
let flag = 0;
let connections = 0;


const server = net.createServer((client) => {
    let fil;
    if(++connections === maxConn){
        client.destroy();
    }
    client.setEncoding('utf8');

    client.on('data', (data) => {
        if (data === reqFiles || data === reqQA) {
            client.id = getUniqID();
            if (data === reqFiles) {
                files[client.id] = [];
                fs.mkdir(defaultDir + path.sep + client.id,(err)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
            console.log(data);
            console.log(`Client ${client.id} connected`);
            clients[client.id] = data;
        }
        else if (client.id === undefined) {
            client.write(resBad);
            client.destroy();
        }
        if (clients[client.id] === reqFiles && data !== reqFiles) {
            files[client.id].push(data);
            flag++;
            if (flag === 2) {
                let buf = Buffer.from(files[client.id][0],'hex');
                let filePath = defaultDir+path.sep+client.id+path.sep+files[client.id][1];
                fil = fs.createWriteStream(filePath);
                fil.write(buf);
                flag=0;
                files[client.id] = [];
                fil.close();
                client.write(resFiles);
            }
        }
    });

    client.on('end', () => {
        connections--;
        console.log(`Client ${client.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function getUniqID() {
    return Date.now() + seed++;
}

