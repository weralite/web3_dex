const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

const tokenList = 'https://api.1inch.dev/swap/v6.0/56/tokens';
const API_KEY = "ENTER KEY HERE";

const headers = {
  'accept': 'application/json',
  "Authorization": `Bearer ${API_KEY}`
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
    const url = `https://api.1inch.dev/price/v1.1/56/${addresses}`;
    const config = {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
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
        console.error('Rate limit fetching price exceeded:', error.response.data);
      } else {
        console.error('Error fetching prices:', error.message);
      }
      return null;
    }
  }

  const tokenPrices = await fetchTokenPrices(addresses);
  res.json(tokenPrices);
});


app.post('/walletBalance', async (req, res) => {
  console.log('Received request for /walletBalance');
  const { tokens, wallets } = req.body;

  console.log("Waiting for 2000ms...");
  await delay(2000); // Delay of 2000ms
  console.log("Timer finished, continuing execution...");

  async function getWalletBalance() {
    const url = "https://api.1inch.dev/balance/v1.2/56/balances/multiple/walletsAndTokens";

    const config = {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      },
    };

    const body = {
      "tokens":
        tokens,
      "wallets":
        wallets

    };

    console.log("Making API request...");
    try {
      await delay(5000); // Delay of 5000ms
      const response = await axios.post(url, body, config);
      return response.data;

    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error('Rate limit fetching balance exceeded:', error.response.data);
      } else {
        console.error('Error fetching balance:', error.message);
      }
      return null;
    }
  }

  console.log("Calling getWalletBalance function...");
  const walletBalance = await getWalletBalance();
  console.log("Wallet balance:", walletBalance);
  res.json(walletBalance);
});


app.get('/api/gas-price', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Cache-Control', 'no-store, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  async function fetchGasPrice() {
    const url = "https://api.1inch.dev/gas-price/v1.5/56";
    const config = {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      },
      params: {}
    };

    try {
      await delay(8000); // Delay of 5000ms
      const response = await axios.get(url, config);
      const gasPrice = response.data;
      console.log(gasPrice);
      return gasPrice;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error('Rate limit fetching balance exceeded:', error.response.data);
      } else {
        console.error('Error fetching balance:', error.message);
      }
      return null;
    }
  }

  const gasPrice = await fetchGasPrice();
  res.json(gasPrice);
});

app.get('/allowance', async (req, res) => {
  const { tokenAddress, walletAddress } = req.query;

  async function checkAllowance(tokenAddress, walletAddress) {
    const url = "https://api.1inch.dev/swap/v6.0/56/approve/allowance";

    const config = {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/transaction', async (req, res) => {
  const { tokenAddress } = req.query;
  let approvalExecuted = false;

  async function approveTokenForSwap(tokenAddress) {
    const url = "https://api.1inch.dev/swap/v6.0/56/approve/transaction";

    const config = {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      },
      params: {
        tokenAddress: tokenAddress,
      }
    };

    const response = await axios.get(url, config);
    console.log(`Made request with tokenAddress ${tokenAddress}, received status code ${response.status}`);
    return response.data;
  }

  try {
    const transaction = await approveTokenForSwap(tokenAddress);
    res.json(transaction);
    approvalExecuted = true;
  } catch (error) {
    console.error('Error making axios request:', error.message);
    if (error.response && error.response.status === 429) {
      // If a rate limit error occurred, wait for 1 second before retrying
      await delay(2000);
      const transaction = await approveTokenForSwap(tokenAddress);
      res.json(transaction);
      approvalExecuted = true;
    } else if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      // Send the actual error status code and message in the response, if available
      res.status(error.response.status || 500).json({ error: error.response.data || 'An error occurred while executing transaction.' });
    } else {
      // If there's no error response, it's likely a server error, so send a 500 response
      res.status(500).json({ error: 'An error occurred while executing transaction.' });
    }
  }
});

app.get('/swap', async (req, res) => {
  const { fromToken, toToken, amount, walletAddress, slippage } = req.query;
  let swapExecuted = false;

  async function executeSwap() {
    const url = "https://api.1inch.dev/swap/v6.0/56/swap";

    const config = {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      },
      params: {
        "src": fromToken,
        "dst": toToken,
        "amount": amount,
        "from": walletAddress,
        "slippage": slippage
      }
    };

    try {
      const response = await axios.get(url, config);
      console.log(response.data);
      const formattedResponse = {
        fromToken: response.data.fromToken,
        toToken: response.data.toToken,
        toAmount: response.data.amount,
        tx: response.data.tx
      };
      res.json(formattedResponse);
      swapExecuted = true;
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        // If the error is 400 (Bad Request), format the error message according to the provided schema
        const errorData = {
          error: "Bad Request",
          description: error.response.data.description,
          statusCode: error.response.status,
          requestId: error.response.headers["x-request-id"],
          meta: [] // No additional metadata provided
        };
        res.status(400).json(errorData);
      } else if (error.response && error.response.status === 429) {
        // If the error is 429 (Too Many Requests), wait for 2000 milliseconds and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return executeSwap(); // Retry the swap operation after the delay
      } else {
        // Handle other errors
        res.status(500).json({ error: "Failed to execute swap" });
      }
    }
  }
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2000 milliseconds before executing the swap
  executeSwap(); // Start the swap operation
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});