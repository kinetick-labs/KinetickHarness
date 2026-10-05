/** Browser plugin for durable workflow-run Conversation Nodes. */

import type {} from '@kinetick-labs/kh-client-locale/client'
import type {} from '@kinetick-labs/kh-client-ui-conversation/client'
import type {} from '@kinetick-labs/kh-client-ui-session/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionTarget } from '@kinetick-labs/kh-api-session-controller/client'
import type {} from '@kinetick-labs/kh-client-ui-chat/client'
import type {} from '@kinetick-labs/kh-client-ui-renderer/client'
import type {} from '@kinetick-labs/kh-client-ui-workspace/client'
import { WorkflowRunPanel, type WorkflowRunInjected } from './WorkflowRunPanel.tsx'
import { en,NS,type WorkflowRunKey } from './locales.ts'
import { workflowRunDefinition } from './workflow-definition.ts'

declare module '@kinetick-labs/kh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Durable workflow-run node copy. */
    workflowRun: WorkflowRunKey
  }
}

/** Required services for Definition, keyed renderer, navigation, and copy. */
export const inject = ['uiConversation', 'uiWorkspace', 'slots', 'sessions', 'locale']

/** Register the workflow Definition, dictionary, and keyed Chat renderer. */
export function apply(ctx: ClientContext): void {
  ctx.uiConversation.events.register(workflowRunDefinition)
  ctx.effect(() => ctx.locale.register(NS, { en }), 'ui-workflow-run: dictionaries')
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'workflow-run',
    locale: NS,
    inject: (): WorkflowRunInjected => ({
      openSession: (target: SessionTarget) => { ctx.uiWorkspace.openSession(target) },
    }),
  }, WorkflowRunPanel))
}
