// test.js
const http = require('http');
const { handleDistances } = require('./gasly');

function testRequestRoutes() {
  const postData = JSON.stringify({
    origin: {
      location: {
        latLng: { latitude: 49.26707645931726, longitude:  -123.25051041644375 }
      }
    },
    destination: {
      location: {
        latLng: { latitude: 49.26096536997155, longitude: -123.18451651102491 }
      }
    }
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/request-routes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    console.log(`STATUS: ${res.statusCode}`);

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response body:', data);

      try {
        const json = JSON.parse(data);
        const { distanceWithStopover, distanceWithoutStopover } = json;

        console.log('Distances from backend:', distanceWithStopover, distanceWithoutStopover);

        // Call your distanceProcessor here to test it
        handleDistances(distanceWithStopover, distanceWithoutStopover);
      } catch (e) {
        console.error('Failed to parse JSON:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testRequestRoutes();
