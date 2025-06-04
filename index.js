const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Function for single-digit "Ruud" numbers (adapted from 2-digit formulas) ---
function calculateYiKiFormulasSingleOutput(longNumber) {
  if (typeof longNumber !== 'string' || !/^\d+$/.test(longNumber) || longNumber.length < 5) {
    return { error: "Invalid input: 'longNumber' must be a string of at least 5 digits." };
  }
  const threeTop = longNumber.slice(-3);
  const twoBottom = longNumber.slice(-5, -3);
  if (threeTop.length !== 3 || !/^\d+$/.test(threeTop) || twoBottom.length !== 2 || !/^\d+$/.test(twoBottom)) {
    return { error: "Could not derive valid 3-top/2-bottom." };
  }
  const H3 = parseInt(threeTop[0]);
  const T3 = parseInt(threeTop[1]);
  const U3 = parseInt(threeTop[2]);
  const T2 = parseInt(twoBottom[0]);
  const U2 = parseInt(twoBottom[1]);
  const predictions = [];
  let d1, d2;
  d1 = (T3 + U2) % 10; d2 = (H3 + T2) % 10;
  predictions.push({ formulaName: "A. (สิบบน+หน่วยล่าง) + (ร้อยบน+สิบล่าง) -> 1 Digit", predictNumber: (d1 + d2) % 10 });
  d1 = (U3 * T2) % 10; d2 = (T3 + U2 + 3) % 10;
  predictions.push({ formulaName: "B. (ผลคูณหน่วยไขว้) + (ผลรวมสิบคงที่) -> 1 Digit", predictNumber: (d1 + d2) % 10 });
  d1 = Math.abs(H3 - U2); d2 = (T3 + T2) % 10;
  predictions.push({ formulaName: "C. (ผลต่างร้อยหน่วย) + (ผลรวมกลาง) -> 1 Digit", predictNumber: (d1 + d2) % 10 });
  d1 = U2; d2 = T2;
  predictions.push({ formulaName: "D. (สลับเลขท้ายรอบก่อน) Summed -> 1 Digit", predictNumber: (d1 + d2) % 10 });
  d1 = (H3 + T3 + U3) % 10; d2 = (T2 + U2) % 10;
  predictions.push({ formulaName: "E. (บวกทุกหลักบน) + (บวกทุกหลักล่าง) -> 1 Digit", predictNumber: (d1 + d2) % 10 });
  return { predictions, derivedThreeTop: threeTop, derivedTwoBottom: twoBottom };
}

// --- MODIFIED Function for 3-Top number sets (Now returns only 2 example sets) ---
function calculateYiKiThreeTopSets(longNumber) {
  if (typeof longNumber !== 'string' || !/^\d+$/.test(longNumber) || longNumber.length < 5) {
    return { error: "Invalid input: 'longNumber' for 3-Top." };
  }
  const threeTop = longNumber.slice(-3);
  const twoBottom = longNumber.slice(-5, -3);
  if (threeTop.length !== 3 || !/^\d+$/.test(threeTop) || twoBottom.length !== 2 || !/^\d+$/.test(twoBottom)) {
    return { error: "Could not derive valid 3-top/2-bottom for 3-Top." };
  }
  const H3 = parseInt(threeTop[0]);
  const T3 = parseInt(threeTop[1]);
  const U3 = parseInt(threeTop[2]);
  const T2 = parseInt(twoBottom[0]);
  const U2 = parseInt(twoBottom[1]);
  
  const selectedThreeTopSets = []; // Changed variable name

  // ชุดที่ 1 (Chosen Example Set 1)
  let dH1 = (H3 + T2 + U3) % 10; 
  let dT1 = (T3 + U2 + H3) % 10; 
  let dU1 = (U3 + T2 + T3 + 1) % 10;
  selectedThreeTopSets.push({ 
    setName: "ชุดตัวอย่าง 3 ตัวบน #1: สูตรหมุนเวียนหลักประยุกต์", 
    predicted3Top: `${dH1}${dT1}${dU1}` 
  });

  // ชุดที่ 4 from previous list (Chosen Example Set 2)
  let dH4 = (H3 + T3 + U2 + 1) % 10; 
  let dT4 = Math.abs(T2 - U3 + H3) % 10; 
  let dU4 = (U3 + T2 + U2 + T3 + 3) % 10;
  selectedThreeTopSets.push({ 
    setName: "ชุดตัวอย่าง 3 ตัวบน #2: สูตรเลขผสมและผลรวมหลักประยุกต์", 
    predicted3Top: `${dH4}${dT4}${dU4}` 
  });

  return { threeTopSets: selectedThreeTopSets, derivedThreeTop: threeTop, derivedTwoBottom: twoBottom };
}

// --- Function for a single "Best Example" Running Number ---
function calculateSingleRunningNumberExample(longNumber) {
  if (typeof longNumber !== 'string' || !/^\d+$/.test(longNumber) || longNumber.length < 5) {
    return { error: "Invalid input: 'longNumber' for Running Number." };
  }
  const threeTop = longNumber.slice(-3);
  const twoBottom = longNumber.slice(-5, -3);
  if (threeTop.length !== 3 || !/^\d+$/.test(threeTop) || twoBottom.length !== 2 || !/^\d+$/.test(twoBottom)) {
    return { error: "Could not derive valid 3-top/2-bottom for Running Number." };
  }
  const H3 = parseInt(threeTop[0]);
  const T3 = parseInt(threeTop[1]);
  const U3 = parseInt(threeTop[2]);
  const T2 = parseInt(twoBottom[0]);
  const U2 = parseInt(twoBottom[1]);
  const runningNumber = ( (H3 + U2) + (T3 + T2) + U3 ) % 10;
  const formulaName = "วิ่งเด่นตัวเดียว: ผลรวมหมุนเวียนห้าหลัก (ตัวอย่าง)";
  return { 
    runningNumberExample: { formulaName, number: runningNumber }, 
    derivedThreeTop: threeTop, 
    derivedTwoBottom: twoBottom 
  };
}

// --- Routes ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/calculate-yiki', (req, res) => {
  const { longNumber } = req.body;
  if (!longNumber) {
    return res.status(400).json({ error: "Missing 'longNumber' in request body." });
  }

  const resultSingleOutput = calculateYiKiFormulasSingleOutput(longNumber);
  const result3TopSets = calculateYiKiThreeTopSets(longNumber); // This now returns only 2 sets
  const resultSingleRunning = calculateSingleRunningNumberExample(longNumber); 

  if (resultSingleOutput.error) return res.status(400).json(resultSingleOutput);
  if (result3TopSets.error) return res.status(400).json(result3TopSets);
  if (resultSingleRunning.error) return res.status(400).json(resultSingleRunning);

  res.json({
    singleDigitPredictions: resultSingleOutput.predictions,
    threeTopSets: result3TopSets.threeTopSets, // Will contain 2 sets
    singleRunningNumberExample: resultSingleRunning.runningNumberExample,
    targetDescription: "Example calculations: Single Digits, 2 selected 3-Top Sets, and a Single Running Number",
    inputReceived: {
      longNumber: longNumber,
      derivedThreeTop: resultSingleOutput.derivedThreeTop, 
      derivedTwoBottom: resultSingleOutput.derivedTwoBottom
    }
  });
});

// (The dedicated /recommend-best-yiki-running endpoint can remain as is if you still want it)
app.post('/recommend-best-yiki-running', (req, res) => {
 // ... (implementation from previous version) ...
  const { longNumber } = req.body;
  if (!longNumber) {
    return res.status(400).json({ error: "Missing 'longNumber' in request body." });
  }
  const result = calculateSingleRunningNumberExample(longNumber); // It's already defined
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json({
    runningNumberExample: result.runningNumberExample, // Corrected from bestExampleRunningNumber to runningNumberExample for consistency
    // formulaName: result.runningNumberExample.formulaName, // This is now part of runningNumberExample object
    recommendationNote: "This is a single example running number based on a speculative formula and is NOT a guaranteed prediction.",
    inputReceived: {
      longNumber: longNumber,
      derivedThreeTop: result.derivedThreeTop,
      derivedTwoBottom: result.derivedTwoBottom
    }
  });
});


app.listen(port, () => {
  console.log(`YiKi Multi-Type Calculator Server running at http://localhost:${port}`);
});