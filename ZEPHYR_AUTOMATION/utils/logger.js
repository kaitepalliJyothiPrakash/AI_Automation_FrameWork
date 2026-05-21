"use strict";

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const current = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function fmt(level, msg) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] ${msg}`;
}

const logger = {
  error: (msg) => current >= LEVELS.error && console.error(fmt("error", msg)),
  warn:  (msg) => current >= LEVELS.warn  && console.warn(fmt("warn",  msg)),
  info:  (msg) => current >= LEVELS.info  && console.log(fmt("info",   msg)),
  debug: (msg) => current >= LEVELS.debug && console.log(fmt("debug",  msg)),
};

module.exports = logger;
