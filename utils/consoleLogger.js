const chalk  = require('chalk').default;     // nếu bạn đang dùng Chalk v5+
const moment = require('moment-timezone');

const SPAM_THRESHOLD = 10;
const SPAM_TIMEFRAME = 3000;
const LOG_COOLDOWN   = 20000;

let counts = {}, isSpamming = false, cooldownTimer;

function initSpamControl() {
  counts = {};
  isSpamming = false;
  if (cooldownTimer) clearTimeout(cooldownTimer);
}

async function fancyLog({ serverName, channelName, userName, content }) {
  const now = Date.now();
  const key = `${serverName}#${channelName}`;
  counts[key] = counts[key] || { count: 0, last: now };

  let rec = counts[key];
  if (now - rec.last > SPAM_TIMEFRAME) rec.count = 0;
  rec.count++; rec.last = now;

  if (rec.count > SPAM_THRESHOLD) {
    if (!isSpamming) {
      console.log(chalk.red('⚠️ Spam detected: pausing logs for 20s'));
      isSpamming = true;
      cooldownTimer = setTimeout(() => {
        console.log(chalk.green('✅ Log resumed.'));
        isSpamming = false;
      }, LOG_COOLDOWN);
    }
    return;
  }
  if (isSpamming) return;

  const timeStr = moment().tz('Asia/Ho_Chi_Minh').format('LLLL');

  console.log(
    chalk.hex('#DEADED')('\n╭──────────────────────────⭓') + '\n' +
    chalk.hex('#DEADED')(`├─ Server:  ${serverName}`)   + '\n' +
    chalk.hex('#DEADED')(`├─ Channel: ${channelName}`)  + '\n' +
    chalk.hex('#C0FFEE')(`├─ User:    ${userName}`)      + '\n' +
    chalk.hex('#FFC0CB')(`├─ Message: ${content}`)       + '\n' +
    chalk.hex('#FFFF00')(`├─ Time:    ${timeStr}`)       + '\n' +
    chalk.hex('#DEADED')('╰──────────────────────────⭓\n')
  );
}

module.exports = { fancyLog, initSpamControl };
