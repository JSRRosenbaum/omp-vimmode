import { CustomEditor, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createVimConfigPlan, DEFAULT_VIM_OPTIONS } from "./src/config.ts";
import { formatOmpVimGutter, insertOmpVimPendingRow } from "./src/omp-status.ts";
import { VimEditor } from "./src/vim-editor.ts";
// OMP omits ctx.ui.getEditorComponent(), which pi-vimmode's stock lifecycle requires.

class OmpVimEditor extends VimEditor {
  override render(width: number): string[] {
    // Mode can change outside handleInput (submit/reset), so derive the cue per frame.
    this.setPromptGutter(formatOmpVimGutter(this.getVimMode()));
    const lines = CustomEditor.prototype.render.call(this, width);
    return insertOmpVimPendingRow(lines, this.getPendingOperator());
  }
}

export default function vimOperators(pi: ExtensionAPI): void {
  const editors = new Set<VimEditor>();
  const configuration = {
    plan: createVimConfigPlan({ ...DEFAULT_VIM_OPTIONS, startMode: "insert" }, []),
    diagnostics: { warnings: [] },
  };

  pi.on("session_start", (_event, ctx) => {
    ctx.ui.setEditorComponent((tui, theme, keybindings) => {
      const editor = new OmpVimEditor(tui, theme, keybindings, configuration, {
        onShutdown: () => ctx.shutdown(),
      });
      editors.add(editor);
      return editor;
    });
  });

  pi.on("agent_start", () => {
    for (const editor of editors) editor.setAgentBusy(true);
  });

  pi.on("agent_end", () => {
    for (const editor of editors) editor.setAgentBusy(false);
  });

  pi.on("session_shutdown", () => {
    for (const editor of editors) editor.resetTerminalCursorStyle();
    editors.clear();
  });
}
