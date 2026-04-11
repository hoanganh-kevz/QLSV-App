const net = require('net');

const host = 'ac-sbhgpek-shard-00-00.xfbfoia.mongodb.net'; // Derived from previous output
const port = 27017;

console.log(`Attempting TCP connection to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
    console.log('SUCCESS: Port 27017 is OPEN!');
    socket.destroy();
    process.exit(0);
});

socket.on('timeout', () => {
    console.log('FAILURE: Connection Timeout. Port 27017 is likely BLOCKED by your ISP/Firewall.');
    socket.destroy();
    process.exit(1);
});

socket.on('error', (err) => {
    console.log('FAILURE: Connection Error:', err.message);
    process.exit(1);
});

socket.connect(port, host);
