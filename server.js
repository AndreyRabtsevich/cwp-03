const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;
const filesRequest = 'FILES';
const accept = 'ACK';
const decline = 'DEC';
const requestOnNextFile = 'REMAINING_FILES';
const defaultDir = process.env.FILES_DIR;
const maxCountConnection = parseInt(process.env.MAX_COUNT_CON);
let seed = 0;
let clients = [];
let files = [];
let flag = 0;
let connections = 0;

function getUniqID() {
    return Date.now() + seed++;
}

const server = net.createServer((client) => {
    let writeableStream;
    if(++connections === maxCountConnection){
        client.destroy();
    }
    client.setEncoding('utf8');

    client.on('data', (data) => {
        if (data === filesRequest) {
            client.id = getUniqID();
            files[client.id] = [];
            fs.mkdir(defaultDir + path.sep + client.id);
            console.log(data);
            console.log(`Client ${client.id} connected`);
            clients[client.id] = data;
            client.write(accept);
           
        }
        else if (client.id === undefined) {
            client.write(decline);
            client.destroy();
        }
        else if (clients[client.id] === filesRequest && data !== filesRequest) {
            files[client.id].push(data);
            flag++;
            if (flag === 2) {
                let buf = Buffer.from(files[client.id][0],'hex');
                let filePath = defaultDir+path.sep+client.id+path.sep+files[client.id][1];
                writeableStream = fs.createWriteStream(filePath);
                writeableStream.write(buf);
                flag = 0;
                files[client.id] = [];
                writeableStream.close();
                client.write(requestOnNextFile);
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
