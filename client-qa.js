const net = require('net');
const fs = require('fs');
const shuffle = require('shuffle-array');
const port = 8124;
const client = new net.Socket();

let array;
let currentIndex = -1;
let serverAnswer;
client.setEncoding('utf8');
client.connect(port, function () {
    console.log('Connected');
    fs.readFile('qa.json', (err, text) => {
        if (!err) {
            array = JSON.parse(text);
            shuffle(array);
            client.write('QA');
        }
        else {
            console.log(err);
        }
    })
});

client.on('data',  (data) => {
    if (data === 'DEC') {
        client.destroy();
    }
    if (data === 'ACK') {
        sendQuestion();
    }
    else {
        if (data === '1') {
            serverAnswer = array[currentIndex].correctAnswer;
        }
        else {
            serverAnswer = array[currentIndex].incorrectAnswer;
        }
        console.log('Question: ' + array[currentIndex].question);
        console.log('Correct Answer: ' + array[currentIndex].correctAnswer);
        console.log('Server Answer: ' + serverAnswer);
        sendQuestion();
    }
});

client.on('close', function () {
    console.log('Connection closed');
});

function sendQuestion() {
    if (currentIndex < array.length - 1) {
        client.write(array[++currentIndex].question);
    }
    else {
        client.destroy();
    }
}