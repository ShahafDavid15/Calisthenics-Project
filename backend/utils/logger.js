/**
 * Centralized logger using winston.
 * - development: colored console output
 * - production:  JSON format to console + error.log file
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, colorize, printf, json, errors } = format;

const isDev = process.env.NODE_ENV !== "production";

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`
  )
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
    ...(!isDev
      ? [new transports.File({ filename: "logs/error.log", level: "error" })]
      : []),
  ],
});

module.exports = logger;
