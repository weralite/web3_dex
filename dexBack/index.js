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


app.get('/allowance', async (req, res) => {
  const { tokenAddress, walletAddress } = req.query;

  async function checkAllowance(tokenAddress, walletAddress) {
    const url = "https://api.1inch.dev/swap/v6.0/1/approve/allowance";

    const config = {
      headers: {
        "Authorization": "Bearer wdkgxDpkCD2ZfzOmzuoiC3Xas2rYHljc"
      },
      params: {
        tokenAddress: tokenAddress,
        walletAddress: walletAddress
      }
    };

    const response = await axios.get(url, config);
    return response.data;
  }

  try {
    const allowance = await checkAllowance(req.query.tokenAddress, req.query.walletAddress);
    res.json(allowance);
    console.log(allowance);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit while allowing exceeded:', error.response.data);
    } else {
      console.error('Error validating allowance:', error.message);
    }
    res.status(500).json({ error: 'An error occurred while fetching allowance' });
  }
});

app.get('/transaction', async (req, res) => {
  const { tokenAddress } = req.query;

  async function executeTransaction(tokenAddress) {
    const url = "https://api.1inch.dev/swap/v6.0/1/approve/transaction";

    const config = {
      headers: {
        "Authorization": "Bearer wdkgxDpkCD2ZfzOmzuoiC3Xas2rYHljc"
      },
      params: {
        tokenAddress: tokenAddress,
      }
    };

    const response = await axios.get(url, config);
    return response.data;
  }

  try {
    const transaction = await executeTransaction(req.query.tokenAddress);
    res.json(transaction);
    console.log(transaction);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit while executing transaction exceeded:', error.response.data);
    } else {
      console.error('Error validating transaction:', error.message);
    }
    res.status(500).json({ error: 'An error occurred while executing transaction.' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});