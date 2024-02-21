import('node-fetch').then((fetch) => {
  const express = require('express');
  const cors = require('cors');

  const app = express();
  const PORT = process.env.PORT || 8080;  // Cambiado el puerto a 4000

  app.use(cors());

  app.get('/:url*', async (req, res) => {
    const { url } = req.params;
    const apiUrl = `https://${url}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  });

  app.listen(PORT, () => {
    console.log(`CORS Proxy running on http://localhost:${PORT}`);
  });
});