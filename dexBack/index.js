const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

const tokenList = 'https://api.1inch.dev/swap/v6.0/1/tokens';
const apiKey = 'wdkgxDpkCD2ZfzOmzuoiC3Xas2rYHljc';

const headers = {
  'accept': 'application/json',
  'Authorization': `Bearer ${apiKey}`
};


app.use(
  cors({
    origin: "http://localhost:3000",
  }));


app.get('/tokenList', (req, res) => {
  axios.get(tokenList, { headers })
    .then(response => {
      // Handle the API response here
      res.json(response.data);
    })
    .catch(error => {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// app.get('/tokenPrice', (req, res) => {
//   axios.get(tokenPrice, { headers })
//     .then(response => {
//       // Handle the API response here
//       res.json(response.data);
//     })
//     .catch(error => {
//       // Handle errors
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     });
// });

app.use(express.json());

app.get('/tokenPricee', async (req, res) => {
  const { addresses } = req.query;

  async function fetchTokenPrices(addresses) {
      const url = `https://api.1inch.dev/price/v1.1/1/${addresses}`;
      const config = {
          headers: {
              "Authorization": "Bearer wdkgxDpkCD2ZfzOmzuoiC3Xas2rYHljc"
          },
          params: {
              "currency": "USD"
          }
      };

      try {
          const response = await axios.get(url, config);
          const prices = response.data;

          // Log token prices in USD
          Object.keys(prices).forEach(token => {
              console.log(`Price of ${token} compared to USD:`, prices[token]);
          });

          return prices;
      } catch (error) {
          if (error.response && error.response.status === 429) {
              console.error('Rate limit exceeded:', error.response.data);
          } else {
              console.error('Error fetching prices:', error.message);
          }
          return null;
      }
  }

  const tokenPrices = await fetchTokenPrices(addresses);
  res.json(tokenPrices);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});