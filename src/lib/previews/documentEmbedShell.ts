function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildPdfEmbedHtml(title: string, pdfBytes: Uint8Array): string {
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ff;
        --surface: #ffffff;
        --line: #e6ddff;
        --text: #24163e;
        --muted: #6b5b93;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background:
          radial-gradient(circle at top, rgba(151,118,255,0.12), transparent 36%),
          var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body::before {
        content: "LANDLORD HEAVEN PREVIEW";
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: clamp(26px, 5vw, 58px);
        font-weight: 700;
        letter-spacing: 0.24em;
        color: rgba(103, 82, 177, 0.06);
        pointer-events: none;
        transform: rotate(-20deg);
        z-index: 2;
        white-space: nowrap;
      }
      .shell { position: relative; z-index: 1; padding: 18px; }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 3;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
        padding: 14px 16px;
        border: 1px solid rgba(111,84,200,0.16);
        border-radius: 18px;
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 14px 40px rgba(31,20,59,0.08);
      }
      .toolbar strong { display: block; font-size: 14px; }
      .toolbar span { display: block; margin-top: 2px; font-size: 12px; color: var(--muted); }
      .toolbar-actions { display: inline-flex; gap: 8px; }
      .toolbar button {
        border: 1px solid rgba(111,84,200,0.18);
        background: white;
        color: var(--text);
        border-radius: 999px;
        padding: 10px 14px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .toolbar button:hover { border-color: rgba(111,84,200,0.38); color: #6f54c8; }
      .pages { display: grid; gap: 18px; }
      .page {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--surface);
        box-shadow: 0 18px 44px rgba(28,19,54,0.08);
      }
      .page-label {
        padding: 12px 16px 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .page canvas {
        display: block;
        width: 100%;
        height: auto;
        background: white;
      }
      .loading, .error {
        display: grid;
        place-items: center;
        min-height: 320px;
        border: 1px dashed rgba(111,84,200,0.22);
        border-radius: 18px;
        background: rgba(255,255,255,0.78);
        color: var(--muted);
        text-align: center;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="toolbar">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>Full completed preview rendered in-page.</span>
        </div>
        <div class="toolbar-actions">
          <button type="button" id="zoom-out">Zoom out</button>
          <button type="button" id="zoom-reset">Reset</button>
          <button type="button" id="zoom-in">Zoom in</button>
        </div>
      </div>
      <p id="status">Loading completed preview...</p>
      <div class="pages" id="pages">
        <div class="loading">Preparing the completed preview...</div>
      </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      const pdfBase64 = ${JSON.stringify(pdfBase64)};
      const statusEl = document.getElementById('status');
      const pagesEl = document.getElementById('pages');
      const zoomOutBtn = document.getElementById('zoom-out');
      const zoomResetBtn = document.getElementById('zoom-reset');
      const zoomInBtn = document.getElementById('zoom-in');
      let zoomScale = 1;

      function updateZoomButtons() {
        zoomOutBtn.disabled = zoomScale <= 0.7;
        zoomInBtn.disabled = zoomScale >= 1.9;
      }

      function applyZoom() {
        pagesEl.style.transform = 'scale(' + zoomScale + ')';
        pagesEl.style.transformOrigin = 'top center';
        statusEl.textContent = 'Showing the full completed preview at ' + Math.round(zoomScale * 100) + '% zoom.';
        updateZoomButtons();
      }

      zoomOutBtn.addEventListener('click', () => {
        zoomScale = Math.max(0.7, Number((zoomScale - 0.1).toFixed(2)));
        applyZoom();
      });
      zoomResetBtn.addEventListener('click', () => { zoomScale = 1; applyZoom(); });
      zoomInBtn.addEventListener('click', () => {
        zoomScale = Math.min(1.9, Number((zoomScale + 0.1).toFixed(2)));
        applyZoom();
      });

      async function renderPdf() {
        try {
          const binary = Uint8Array.from(atob(pdfBase64), (char) => char.charCodeAt(0));
          const pdf = await window['pdfjsLib'].getDocument({ data: binary }).promise;
          pagesEl.innerHTML = '';
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.35 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const shell = document.createElement('div');
            shell.className = 'page';
            const label = document.createElement('div');
            label.className = 'page-label';
            label.textContent = 'Page ' + pageNumber;
            shell.appendChild(label);
            shell.appendChild(canvas);
            pagesEl.appendChild(shell);
            await page.render({ canvasContext: context, viewport }).promise;
          }
          applyZoom();
        } catch (error) {
          console.error('[Document-Embed] Failed to render PDF preview', error);
          pagesEl.innerHTML = '<div class="error">The completed preview could not be rendered right now.</div>';
          statusEl.textContent = 'The completed preview could not be loaded.';
        }
      }

      renderPdf();
    </script>
  </body>
</html>`;
}

export function buildHtmlEmbedShell(title: string, documentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f7f4ff; }
      body {
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #24163e;
      }
      body::before {
        content: "LANDLORD HEAVEN PREVIEW";
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: clamp(26px, 5vw, 58px);
        font-weight: 700;
        letter-spacing: 0.24em;
        color: rgba(103, 82, 177, 0.06);
        pointer-events: none;
        transform: rotate(-20deg);
        z-index: 2;
        white-space: nowrap;
      }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 3;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(111,84,200,0.16);
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 14px 40px rgba(31,20,59,0.08);
      }
      .toolbar strong { display: block; font-size: 14px; }
      .toolbar span { display: block; margin-top: 2px; font-size: 12px; color: #6b5b93; }
      .document-shell {
        position: relative;
        z-index: 1;
        max-width: 960px;
        margin: 18px auto;
        padding: 0 18px 36px;
      }
      .document-card {
        overflow: hidden;
        border: 1px solid #e6ddff;
        border-radius: 20px;
        background: white;
        box-shadow: 0 18px 44px rgba(28,19,54,0.08);
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <strong>${escapeHtml(title)}</strong>
      <span>Full completed preview rendered from your current answers.</span>
    </div>
    <div class="document-shell">
      <div class="document-card">${documentHtml}</div>
    </div>
  </body>
</html>`;
}
