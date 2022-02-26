export default {
  debug: (io, message) => io.emit('log', { level: "debug", message : message }),
  info: (io, message) => io.emit('log', { level: "info", message : message }),
  warn: (io, message) => io.emit('log', { level: "warn", message : message }),
  error: (io, message) => io.emit('log', { level: "error", message : message }),
}