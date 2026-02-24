const chalk = require('chalk');
const moment = require('moment-timezone');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  // Brand colors
  primary: chalk.hex('#7289DA'),  // Discord blurple
  accent: chalk.hex('#5865F2'),  // Discord blue
  success: chalk.hex('#57F287'),  // Discord green
  warn: chalk.hex('#FEE75C'),  // Discord yellow
  error: chalk.hex('#ED4245'),  // Discord red
  muted: chalk.hex('#8E9297'),  // Discord muted gray
  white: chalk.hex('#FFFFFF'),
  // Field colors
  server: chalk.hex('#B9BBBE'),
  channel: chalk.hex('#5865F2'),
  user: chalk.hex('#57F287'),
  message: chalk.hex('#FFFFFF'),
  time: chalk.hex('#FEE75C'),
};

const LINE = C.muted('─'.repeat(52));

// ── Spam control ──────────────────────────────────────────────────────────────
const SPAM_THRESHOLD = 10;
const SPAM_TIMEFRAME = 3_000;
const LOG_COOLDOWN = 20_000;

const counts = new Map();
let isSpamming = false;
let cooldownTimer = null;

function initSpamControl() {
  counts.clear();
  isSpamming = false;
  if (cooldownTimer) { clearTimeout(cooldownTimer); cooldownTimer = null; }
}

// ── Timestamp ─────────────────────────────────────────────────────────────────
function now() {
  return moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
}

// ── Startup box printer (dùng trong index.js qua logger) ──────────────────────

/**
 * In một dòng log mang style hệ thống: [HH:mm:ss] TYPE  text
 */
function sysLog(type, text, color = C.primary) {
  const ts = C.muted(`[${now()}]`);
  const tag = color.bold(type.padEnd(8));
  console.log(`${ts} ${tag} ${C.white(text)}`);
}

/** Log banner khởi động */
function printBanner(botTag) {
  const line = C.accent('═'.repeat(52));
  console.log('\n' + line);
  console.log(
    C.accent('  ✦  ') +
    C.white.bold('ARYA BOT') +
    C.muted('  v3') +
    (botTag ? C.muted(`  ·  ${botTag}`) : '')
  );
  console.log(line + '\n');
}

/** Log bảng commands đã load */
function printLoadTable({ commands, contexts, events }) {
  sysLog('LOAD', `${C.success(commands.length + ' commands')}  ${C.muted('·')}  ${C.warn(contexts.length + ' contexts')}  ${C.muted('·')}  ${C.primary(events.length + ' events')}`);

  // In từng nhóm gọn trong 1 dòng
  const row = (label, names, color) => {
    const tags = names.map(n => color(`[${n}]`)).join(' ');
    console.log(`         ${C.muted(label.padEnd(10))} ${tags}`);
  };
  row('Commands', commands, C.success);
  row('Events', events, C.primary);
  if (contexts.length) row('Contexts', contexts, C.warn);
  console.log('');
}

/** Log deploy status */
function printDeploy(mode, count) {
  const modeTag = mode === 'dev'
    ? C.warn.bold('[DEV]')
    : C.success.bold('[PROD]');
  sysLog('DEPLOY', `${modeTag} ${count} command(s) registered`);
}

// ── Message logger (mỗi tin nhắn) ────────────────────────────────────────────
function fancyLog({ serverName, channelName, userName, content }) {
  const nowMs = Date.now();
  const key = `${serverName}#${channelName}`;

  let rec = counts.get(key);
  if (!rec) { rec = { count: 0, last: nowMs }; counts.set(key, rec); }

  if (nowMs - rec.last > SPAM_TIMEFRAME) rec.count = 0;
  rec.count++;
  rec.last = nowMs;

  if (rec.count > SPAM_THRESHOLD) {
    if (!isSpamming) {
      sysLog('SPAM', 'Flood detected — pausing message logs for 20s', C.warn);
      isSpamming = true;
      cooldownTimer = setTimeout(() => {
        sysLog('SPAM', 'Log resumed.', C.success);
        isSpamming = false;
        cooldownTimer = null;
      }, LOG_COOLDOWN);
    }
    return;
  }
  if (isSpamming) return;

  // Rút gọn nội dung nếu quá dài
  const preview = content.length > 80 ? content.slice(0, 77) + '…' : content;
  const ts = C.muted(`[${now()}]`);

  const msgLine = [
    `${ts} ${C.server(serverName)} ${C.muted('#')}${C.channel(channelName)}`,
    `         ${C.muted('└')} ${C.user(userName)}${C.muted(':')} ${C.message(preview)}`,
  ].join('\n');

  console.log(msgLine);
}

module.exports = { fancyLog, initSpamControl, sysLog, printBanner, printLoadTable, printDeploy };
