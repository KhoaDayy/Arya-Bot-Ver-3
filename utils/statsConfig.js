// utils/statsConfig.js
const fs   = require('fs');
const path = require('path');
const CONFIG = path.join(__dirname, '..', 'data', 'statsChannels.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // nếu mất file hoặc JSON sai, tạo lại
    const blank = {};
    fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
    fs.writeFileSync(CONFIG, JSON.stringify(blank, null, 2));
    return blank;
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2), 'utf-8');
}

module.exports = { loadConfig, saveConfig };
