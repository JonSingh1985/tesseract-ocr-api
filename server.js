const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Use native fetch if using Node 18+
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/ocr', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });

  try {
    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to download image');
    const buffer = await response.buffer();

    // Convert to JPEG
    const jpegBuffer = await sharp(buffer)
      .jpeg()
      .toBuffer();

    const tempPath = path.join(__dirname, 'temp.jpg');
    fs.writeFileSync(tempPath, jpegBuffer);

    // OCR with Tesseract
    const result = await Tesseract.recognize(tempPath, 'eng');
    fs.unlinkSync(tempPath); // Clean up temp file

    return res.json({ text: result.data.text });
  } catch (err) {
    console.error('OCR failed:', err.message);
    return res.status(500).json({ error: 'OCR failed', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Tesseract OCR API is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

