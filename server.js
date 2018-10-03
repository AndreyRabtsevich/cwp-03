const net = require('net');
const fs = require('fs');
const port = 8124;
let seed = 0;
const logger = fs.createWriteStream('client_id.txt');

const server = net.createServer((client) => {
    client.id = Date.now() + seed++;
    logger.write('client ' + client.id + ' connected\n');
    client.setEncoding('utf8');

    client.on('data', (data) => {
        if (data == 'QA') {
            client.write('ACK');
        }
        else {
            let answer = getRandom();
            logger.write('; answer: ' + answer + '\n');
            client.write(answer);
        }
    });

    client.on('end', () => {
        logger.write('client ' + client.id + ' disconnected\n');
    });
});
server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function getRandom() {
    return `${Math.floor(Math.random() * 2)}`;
}