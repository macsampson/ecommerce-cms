export async function register() {
  // Node-only: config-check queries the database via lib/prismadb and logs via
  // lib/logger (pino), neither of which run on the Edge runtime.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { getConfigWarnings } = await import('@/lib/config-check')
    const { logger } = await import('@/lib/logger')

    const warnings = await getConfigWarnings()
    if (warnings.length > 0) {
      logger.warn(`${warnings.length} configuration warning(s) on startup:`)
      for (const warning of warnings) {
        logger.warn(`- [${warning.key}] ${warning.message}`)
      }
    }
  } catch (error) {
    // Never block startup on a diagnostics check — e.g. the database may not be
    // reachable yet on the very first boot before migrations have run.
    console.error('Config check failed during startup:', error)
  }
}
