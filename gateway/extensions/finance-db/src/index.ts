import { saveTransactionTool } from './tools/save-transaction.js'
import { checkAlertsTool } from './tools/check-alerts.js'
import { queryTool } from './tools/query.js'

interface PluginApi {
  registerTool(tool: {
    name: string
    description: string
    parameters: unknown
    execute: (id: string, params: Record<string, unknown>) => Promise<{
      content: ReadonlyArray<{ type: string; text: string }>
    }>
  }): void
}

export default function (api: PluginApi) {
  api.registerTool(saveTransactionTool)
  api.registerTool(checkAlertsTool)
  api.registerTool(queryTool)
}
