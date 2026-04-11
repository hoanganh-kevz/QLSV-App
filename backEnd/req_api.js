const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/classes?majorId=69aee446188f2b6f1ee4ee98&batch=K50',
  method: 'GET',
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
