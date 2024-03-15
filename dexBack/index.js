const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

const apiUrl = 'https://api.1inch.dev/swap/v6.0/1/tokens';
const apiKey = 'wdkgxDpkCD2ZfzOmzuoiC3Xas2rYHljc';

const headers = {
  'accept': 'application/json',
  'Authorization': `Bearer ${apiKey}`
};

app.use(
  cors({
      origin: "http://localhost:3000",
  }));


app.get('/tokenPrice', (req, res) => {
  axios.get(apiUrl, { headers })
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



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});