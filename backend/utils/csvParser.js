// CSV parser utility using csv-parser
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const Asset = require('../models/Asset');

/**
 * Parse a CSV file into an array of Asset objects.
 *
 * The IT HW inventory CSV sometimes has a merged "banner" header row at the
 * top (e.g. "minimal accepted support maintenance") before the real column
 * headers. This utility skips any rows where the first cell does not look
 * like a data row (i.e. it matches the known banner text).
 *
 * @param {string} filePath - Absolute path to the CSV file.
 * @returns {Promise<Asset[]>} Resolves with an array of Asset instances.
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const assets = [];
    const BANNER_PATTERN = /min[im]nal accepted support/i;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Skip the merged banner header row if present
        const firstValue = Object.values(row)[0] || '';
        if (BANNER_PATTERN.test(firstValue)) return;

        assets.push(new Asset(row));
      })
      .on('end', () => resolve(assets))
      .on('error', (err) => reject(err));
  });
}

module.exports = { parseCSV };
