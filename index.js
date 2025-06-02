const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Calculates a single "predict number" for multiple example formulas.
 * Each original 2-digit formula is adapted to output one digit.
 * @param {string} longNumber - The full prize number string.
 * @returns {{predictions: Array<{formulaName: string, predictNumber: number}>, derivedThreeTop: string, derivedTwoBottom: string} | {error: string}}
 */
function calculateYiKiFormulasSingleOutput(longNumber) {
  if (typeof longNumber !== 'string' || !/^\d+$/.test(longNumber) || longNumber.length < 5) {
    return { error: "Invalid input: 'longNumber' must be a string of at least 5 digits." };
  }

  const threeTop = longNumber.slice(-3);
  const twoBottom = longNumber.slice(-5, -3);

  if (threeTop.length !== 3 || !/^\d+$/.test(threeTop)) {
    return { error: "Could not derive a valid 3-digit 'threeTop' from longNumber." };
  }
  if (twoBottom.length !== 2 || !/^\d+$/.test(twoBottom)) {
    return { error: "Could not derive a valid 2-digit 'twoBottom' from longNumber." };
  }

  const H3 = parseInt(threeTop[0]);
  const T3 = parseInt(threeTop[1]);
  const U3 = parseInt(threeTop[2]);
  const T2 = parseInt(twoBottom[0]);
  const U2 = parseInt(twoBottom[1]);

  const predictions = [];
  let d1, d2; // To store intermediate two digits

  // สูตร A: "สิบบน+หน่วยล่าง และ ร้อยบน+สิบล่าง" -> Combined to single digit
  d1 = (T3 + U2) % 10;
  d2 = (H3 + T2) % 10;
  predictions.push({
    formulaName: "A. (สิบบน+หน่วยล่าง) + (ร้อยบน+สิบล่าง) -> 1 Digit",
    predictNumber: (d1 + d2) % 10
  });

  // สูตร B: "ผลคูณหน่วยไขว้ และ ผลรวมสิบคงที่" -> Combined to single digit
  d1 = (U3 * T2) % 10;
  d2 = (T3 + U2 + 3) % 10;
  predictions.push({
    formulaName: "B. (ผลคูณหน่วยไขว้) + (ผลรวมสิบคงที่) -> 1 Digit",
    predictNumber: (d1 + d2) % 10
  });

  // สูตร C: "ผลต่าง (ร้อยบน vs หน่วยล่าง) และ ผลรวมกลาง" -> Combined to single digit
  d1 = Math.abs(H3 - U2);
  d2 = (T3 + T2) % 10;
  predictions.push({
    formulaName: "C. (ผลต่างร้อยหน่วย) + (ผลรวมกลาง) -> 1 Digit",
    predictNumber: (d1 + d2) % 10
  });

  // สูตร D: "สลับเลขท้ายรอบก่อน" -> Combined to single digit
  d1 = U2; // Previous bottom unit
  d2 = T2;  // Previous bottom tens
  predictions.push({
    formulaName: "D. (สลับเลขท้ายรอบก่อน) Summed -> 1 Digit",
    predictNumber: (d1 + d2) % 10
  });

  // สูตร E: "บวกทุกหลักบน และ บวกทุกหลักล่าง" -> Combined to single digit
  d1 = (H3 + T3 + U3) % 10;
  d2 = (T2 + U2) % 10;
  predictions.push({
    formulaName: "E. (บวกทุกหลักบน) + (บวกทุกหลักล่าง) -> 1 Digit",
    predictNumber: (d1 + d2) % 10
  });

  return { predictions, derivedThreeTop: threeTop, derivedTwoBottom: twoBottom };
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/calculate-yiki', (req, res) => {
  const { longNumber } = req.body;

  if (!longNumber) {
    return res.status(400).json({ error: "Missing 'longNumber' in request body." });
  }

  const result = calculateYiKiFormulasSingleOutput(longNumber); // Use the updated function

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json({
    predictions: result.predictions,
    targetDescription: "Example single digits (derived from 2-digit formulas)", // Updated description
    inputReceived: {
      longNumber: longNumber,
      derivedThreeTop: result.derivedThreeTop,
      derivedTwoBottom: result.derivedTwoBottom
    }
  });
});

app.listen(port, () => {
  console.log(`YiKi Single Output Formula Calculator Server running at http://localhost:${port}`);
});