const express = require('express');
const path = require('path'); // Node.js module for working with file and directory paths
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

/**
 * Calculates two "predict numbers" based on the example formula
 * and derived threeTop/twoBottom from the longNumber.
 * Formula used: "สูตรหลักร้อยบวกสิบล่าง และ ผลต่างสิบบนหน่วยล่าง"
 * @param {string} longNumber - The full prize number string.
 * @returns {{predictNumber1: number, predictNumber2: number, threeTop: string, twoBottom: string} | {error: string}}
 */
function calculateYiKiExample(longNumber) {
  // Basic input validation for longNumber
  if (typeof longNumber !== 'string' || !/^\d+$/.test(longNumber) || longNumber.length < 5) {
    return { error: "Invalid input: 'longNumber' must be a string of at least 5 digits." };
  }

  // Derive threeTop and twoBottom based on your slice logic
  // threeTop = last 3 digits
  // twoBottom = 2 digits immediately preceding the last 3 digits
  const threeTop = longNumber.slice(-3);
  const twoBottom = longNumber.slice(-5, -3);

  // Validate derived parts (ensure they are the correct length)
  if (threeTop.length !== 3 || !/^\d+$/.test(threeTop)) {
    return { error: "Could not derive a valid 3-digit 'threeTop' from longNumber." };
  }
  if (twoBottom.length !== 2 || !/^\d+$/.test(twoBottom)) {
    return { error: "Could not derive a valid 2-digit 'twoBottom' from longNumber." };
  }

  // Extract digits for the formula
  const h3 = parseInt(threeTop[0]); // Hundreds digit of derived 3-top
  const t3 = parseInt(threeTop[1]); // Tens digit of derived 3-top
  const t2 = parseInt(twoBottom[0]); // Tens digit of derived 2-bottom
  const u2 = parseInt(twoBottom[1]); // Units digit of derived 2-bottom

  // --- Calculation logic for "สูตรหลักร้อยบวกสิบล่าง และ ผลต่างสิบบนหน่วยล่าง" ---
  const sumForN1 = h3 + t2;
  const predictNumber1 = sumForN1 % 10;
  const predictNumber2 = Math.abs(t3 - u2);
  // --- End of calculation logic ---

  return { predictNumber1, predictNumber2, threeTop, twoBottom };
}

// Route to serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint for calculation
app.post('/calculate-yiki', (req, res) => {
  const { longNumber } = req.body; // Expecting only longNumber from the frontend

  if (!longNumber) {
    return res.status(400).json({ error: "Missing 'longNumber' in request body." });
  }

  const result = calculateYiKiExample(longNumber);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json({
    predictNumber1: result.predictNumber1,
    predictNumber2: result.predictNumber2,
    formulaUsed: "สูตรหลักร้อยบวกสิบล่าง และ ผลต่างสิบบนหน่วยล่าง (ตัวอย่าง)",
    inputReceived: {
      longNumber: longNumber,
      derivedThreeTop: result.threeTop, // Send back the derived numbers
      derivedTwoBottom: result.twoBottom
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`YiKi Example Calculator Server running at http://localhost:${port}`);
});