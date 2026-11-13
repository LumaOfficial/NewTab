import { useState } from 'react';

import { STORAGE_LABEL } from '../../lib/storage.js';
import { useDashboard } from '../../state/DashboardProvider.jsx';
import { Button } from '../ui/Button.jsx';
import { Dialog } from '../ui/Dialog.jsx';

export function DataSection() {
  const { state, storageError, actions } = useDashboard();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const visibleWidgets = state.layout.order.length - state.layout.hidden.length;

  return (
    <section className="section">
      <header className="section__head">
        <h3>Data &amp; storage</h3>
        <p>Luma New Tab keeps everything on this device. Nothing is uploaded.</p>
      </header>

      <div className="section__card">
        <div className="row">
          <div className="row__text">
            <h4>Storage location</h4>
            <p>{STORAGE_LABEL}</p>
          </div>
          <span className="pill">Local only</span>
        </div>
        <div className="row">
          <div className="row__text">
            <h4>Saved items</h4>
            <p>
              {state.shortcuts.length} shortcuts · {state.notes.length} notes · {state.tasks.length} tasks
            </p>
          </div>
        </div>
        <div className="row">
          <div className="row__text">
            <h4>Widget layout</h4>
            <p>
              {visibleWidgets} of {state.layout.order.length} widgets visible
            </p>
          </div>
        </div>
        {storageError ? (
          <div className="notice notice--danger" role="alert">
            {storageError}
          </div>
        ) : null}
      </div>

      <div className="section__card">
        <div className="row">
          <div className="row__text">
            <h4>Reset dashboard</h4>
            <p>Restore the default look and delete every saved shortcut, note and task.</p>
          </div>
          <Button variant="danger" icon="trash" onClick={() => setConfirmOpen(true)}>
            Reset…
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        title="Reset dashboard?"
        description="This restores the default theme, widget layout and settings, and permanently deletes every shortcut, note and task saved in this browser. This cannot be undone."
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <span className="dialog__spacer" />
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await actions.resetAll();
                setConfirmOpen(false);
              }}
            >
              Reset dashboard
            </Button>
          </>
        }
      />
    </section>
  );
}
