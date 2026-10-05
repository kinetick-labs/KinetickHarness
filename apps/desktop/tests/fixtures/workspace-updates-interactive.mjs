/** Operator-controlled qualification using the real workspace; synthetic payloads never execute. */
import { app, BrowserWindow, Menu, dialog } from 'electron'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Keep the private workspace open until the operator closes the control window or exits the application.
 * @param {object} options Real workspace and fixture-owned delivery, task, and installation controls.
 * @returns {Promise<void>} Resolves after operator exit and removal of control listeners.
 */
export async function runInteractiveUpdates({ mainWindow, server, fixture, checkMenu, control, root }) {
  const panel = new BrowserWindow({ title: 'Local update check', width: 640, height: 460,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } })
  const finished = Promise.withResolvers()
  const finish = () => finished.resolve()
  panel.once('closed', finish)
  app.once('before-quit', finish)
  let closing = false
  const originalInstall = fixture.updater.quitAndInstall
  fixture.updater.quitAndInstall = (...args) => {
    fixture.installations.push(args)
    void dialog.showMessageBox(panel, { type: 'info', title: 'Local check finished',
      message: 'Download, verification, install confirmation, and task cleanup finished.',
      detail: 'The installer call was intercepted. Nothing was installed or restarted. Confirm to leave this run; run the command again to start another.',
      buttons: ['End run'] }).then(finish).catch(finish)
  }
  const action = (label, operation) => ({ label, click: () => {
    if (closing) return
    void Promise.resolve().then(operation).catch(error => {
      console.error(error)
      if (!panel.isDestroyed()) dialog.showErrorBox('Local check action failed', String(error))
    })
  } })
  const select = mode => server.select(mode, '0.1.6-nightly.1')
  select('hold-download')
  const check = () => checkMenu.click()
  panel.setMenu(Menu.buildFromTemplate([
    { label: 'Update scenario', submenu: [
      action('Ordinary update (hold progress after download)', () => { server.policy('clear'); select('hold-download'); check() }),
      action('Mandatory update (hold progress after download)', () => { server.policy('force'); select('hold-download'); check() }),
      action('Release the current download', () => server.release()),
      { type: 'separator' },
      action('Next download: verification failure', () => select('corrupt')),
      action('Next download: 404', () => select('download-404')),
      action('Next download: healthy', () => select('healthy')),
      action('Check failure', () => { select('feed-404'); check() }),
      action('No update available (use before download)', () => { server.select('healthy', '0.1.5-rc.1'); check() }),
      action('Clear mandatory block', () => { server.policy('clear'); check() }),
    ] },
    { label: 'Task state', submenu: [
      action('Add a queued task', () => control('queue')),
      action('Clear queued tasks', () => control('clear')),
      action('Simulate task-stop failure for this run', () => control('hold-shutdown')),
    ] },
    { label: 'Window', submenu: [
      action('Return to the app', () => { mainWindow.restore(); mainWindow.show(); mainWindow.focus() }),
      action('End run', finish),
    ] },
  ]))
  try {
    await panel.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><html lang="en">
      <meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
      <style>body{font:16px/1.8 system-ui;padding:24px;color:#222}h2{margin-top:0}strong{color:#165dff}</style>
      <h2>Manual update check · installer does not run</h2>
      <p>Use the <strong>Update scenario</strong> menu in this window, then click download in the app.</p>
      <p>The download stays in progress so you can inspect it. Choose <strong>Release the current download</strong> here to continue to verification and install confirmation.</p>
      <p>Use the <strong>Task state</strong> menu to add a queued task and see the warning before install. Choose a failure mode before downloading.</p>
      <p>Data and the update server stay on this machine. Download addresses are examples. Close this window to end the run; run the command again to reset.</p>
      </html>`)}`)
    console.log(`Interactive updater ready: ${root}`)
    await finished.promise
    closing = true
    await writeFile(join(root, 'interactive-result.json'), JSON.stringify({ installerExecuted: false,
      interceptedInstallations: fixture.installations.length, phases: fixture.states.map(state => state.phase) }, null, 2) + '\n')
  } finally {
    closing = true
    fixture.updater.quitAndInstall = originalInstall
    app.off('before-quit', finish)
    panel.off('closed', finish)
    if (!panel.isDestroyed()) panel.destroy()
  }
}
