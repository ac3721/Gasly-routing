const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = 8080;
const urlencodedParser = bodyParser.urlencoded({extended: true});

const STOPOVER = {
  // placeId: "ChIJ8dmUZKhzhlQRyhPJRuvlaWk"
  latLng: { latitude: 49.25768634752348, longitude: -123.16725558491186 }
};

function main() {
  app.use('/', express.static('public'));
  app.use(urlencodedParser);
  app.use(express.json());

  app.post('/request-route', (req, res) => {
    const origin = req.body.origin;
    const destination = req.body.destination;

    // CORRECTED: Minimal valid Routes API v2 request for distance optimization
    const routeRequest = {
      origin: origin,
      destination: destination,
      travelMode: "DRIVE",
      // Use intermediates for stopover (correct field name)
      intermediates: [
        {
          location: STOPOVER
        }
      ],
      // SHORTEST DISTANCE optimization
      routingPreference: "TRAFFIC_UNAWARE",
      // Valid avoidance options only
      routeModifiers: {
        avoidTolls: true,
        avoidFerries: true,
        avoidHighways: false
      }
    };

    fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "AIzaSyAeCfwA9OHLveBZB2p3Z-9sHMV3wS1eZDo",
        "X-Goog-FieldMask": "*"
      },
      body: JSON.stringify(routeRequest)
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.log('API Error:', data.error);
        return res.status(400).json(data);
      }
      if (!data.routes || data.routes.length === 0) {
        console.log('No routes found');
        return res.status(404).json({ error: 'No route found' });
      }
      // Return shortest distance route
      res.json(data);
    })
    .catch(error => {
      console.error('Fetch error:', error);
      res.status(500).json({ error: error.message });
    });
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log('Press Ctrl+C to quit.');
  });
}

main();