/**
 * Hypertaks OpenCode plugin compatibility shim.
 *
 * OpenCode loads local plugins from its configured plugin array. The five
 * canonical Hypertaks skills remain under the repository skills/ directory.
 */
export default async function hypertaksPlugin() {
  return {
    "chat.message": async () => undefined,
  };
}
