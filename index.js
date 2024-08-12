const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Load the color palettes dataset
let colorPalettes = [];
fs.readFile("color_palettes.json", (err, data) => {
  if (err) throw err;
  colorPalettes = JSON.parse(data);
});

// Endpoint to get all color palettes with pagination
app.get("/palettes", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1; // default to page 1
  const limit = parseInt(req.query.limit, 10) || 10; // default to 10 palettes per page

  if (page < 1 || limit < 1) {
    return res.status(400).send("Page and limit must be positive integers.");
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  if (startIndex >= colorPalettes.length) {
    return res.status(404).send("No more palettes available.");
  }

  const results = {
    currentPage: page,
    totalPages: Math.ceil(colorPalettes.length / limit),
    totalPalettes: colorPalettes.length,
  };

  results.results = colorPalettes.slice(startIndex, endIndex);

  if (endIndex < colorPalettes.length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  res.json(results);
});

// Endpoint to get a specific color palette by index
app.get("/palette/:index", (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (index >= 0 && index < colorPalettes.length) {
    res.json(colorPalettes[index]);
  } else {
    res.status(404).send("Palette not found");
  }
});

app.listen(port, () => {
  console.log(`Color palettes server running at http://localhost:${port}`);
});
