import pino from 'pino'

const base = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
        }
      : undefined
})

// Console-compatible wrapper (`logger.info('message', data)`) so existing call
// sites read the same as console.* while emitting structured JSON in production.
function write(level: 'info' | 'warn' | 'error', args: unknown[]) {
  if (args.length === 0) return
  const [message, ...rest] = args
  const msg = typeof message === 'string' ? message : JSON.stringify(message)

  if (rest.length === 0) {
    base[level](msg)
    return
  }

  // Errors have no enumerable own properties, so JSON.stringify(err) is `{}` —
  // use pino's `err` key, which it knows how to serialize (message, stack, etc).
  const single = rest.length === 1 ? rest[0] : rest
  const payload = single instanceof Error ? { err: single } : { data: single }
  base[level](payload, msg)
}

export const logger = {
  info: (...args: unknown[]) => write('info', args),
  warn: (...args: unknown[]) => write('warn', args),
  error: (...args: unknown[]) => write('error', args)
}
