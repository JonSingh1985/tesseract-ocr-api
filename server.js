const express = require('express');
const Tesseract = require('tesseract.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/ocr', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).send({ error: 'Missing imageUrl' });

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    const tempPath = path.join(__dirname, 'temp.jpg');
    fs.writeFileSync(tempPath, buffer);

    const result = await Tesseract.recognize(tempPath, 'eng');
    fs.unlinkSync(tempPath);

    return res.send({ text: result.data.text });
  } catch (err) {
    return res.status(500).send({ error: 'OCR failed', details: err.message });
  }
});

app.get('/', (req, res) => res.send('Tesseract OCR API is running.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OCR API running on port ${PORT}`));
