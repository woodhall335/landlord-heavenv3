import { NextResponse } from 'next/server';
import { isGoldenPackKey, getGoldenPackAsset } from '@/lib/marketing/golden-pack-proof';

export const runtime = 'nodejs';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ packKey: string; documentType: string }> }
) {
  const { packKey, documentType } = await params;
  const decodedType = decodeURIComponent(documentType);

  if (!isGoldenPackKey(packKey)) {
    return NextResponse.json({ error: 'Unknown sample pack' }, { status: 404 });
  }

  const pdfAsset = getGoldenPackAsset(packKey, decodedType, 'pdf');
  if (!pdfAsset) {
    return NextResponse.json({ error: 'Sample PDF not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const versionToken = url.searchParams.get('v');
  const pdfUrl = new URL(
    `/api/golden-pack-samples/${packKey}/${encodeURIComponent(decodedType)}${
      versionToken ? `?v=${encodeURIComponent(versionToken)}` : ''
    }`,
    url.origin
  ).toString();

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(decodedType)} sample preview</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ff;
        --surface: #ffffff;
        --line: #e6ddff;
        --text: #24163e;
        --muted: #6b5b93;
        --accent: #6f54c8;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        background:
          radial-gradient(circle at top, rgba(151, 118, 255, 0.12), transparent 36%),
          var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        position: relative;
      }

      body::before {
        content: "LANDLORD HEAVEN SAMPLE";
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: clamp(28px, 5vw, 64px);
        font-weight: 700;
        letter-spacing: 0.28em;
        color: rgba(103, 82, 177, 0.06);
        pointer-events: none;
        transform: rotate(-22deg);
        z-index: 2;
        white-space: nowrap;
      }

      .shell {
        position: relative;
        z-index: 1;
        padding: 18px;
      }

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
        border: 1px solid rgba(111, 84, 200, 0.16);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 14px 40px rgba(31, 20, 59, 0.08);
      }

      .toolbar strong {
        display: block;
        font-size: 14px;
      }

      .toolbar span {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: var(--muted);
      }

      .toolbar-actions {
        display: inline-flex;
        gap: 8px;
      }

      .toolbar button {
        border: 1px solid rgba(111, 84, 200, 0.18);
        background: white;
        color: var(--text);
        border-radius: 999px;
        padding: 10px 14px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .toolbar button:hover {
        border-color: rgba(111, 84, 200, 0.38);
        color: var(--accent);
      }

      .toolbar button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .status {
        margin: 0 0 12px;
        font-size: 13px;
        color: var(--muted);
      }

      .pages {
        display: grid;
        gap: 18px;
      }

      .page {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--surface);
        box-shadow: 0 18px 44px rgba(28, 19, 54, 0.08);
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

      .loading,
      .error {
        display: grid;
        place-items: center;
        min-height: 320px;
        border: 1px dashed rgba(111, 84, 200, 0.22);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.78);
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
          <strong>Embedded sample preview</strong>
          <span>All pages are rendered inside the page without the browser PDF toolbar.</span>
        </div>
        <div class="toolbar-actions">
          <button type="button" id="zoom-out">Zoom out</button>
          <button type="button" id="zoom-reset">Reset</button>
          <button type="button" id="zoom-in">Zoom in</button>
        </div>
      </div>
      <p class="status" id="status">Loading sample preview...</p>
      <div class="pages" id="pages">
        <div class="loading">Preparing the embedded sample preview...</div>
      </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      const pdfUrl = ${JSON.stringify(pdfUrl)};
      const statusEl = document.getElementById('status');
      const pagesEl = document.getElementById('pages');
      const zoomOutBtn = document.getElementById('zoom-out');
      const zoomResetBtn = document.getElementById('zoom-reset');
      const zoomInBtn = document.getElementById('zoom-in');
      let baseScale = 1;
      let zoomScale = 1;

      function updateZoomButtons() {
        zoomOutBtn.disabled = zoomScale <= 0.7;
        zoomInBtn.disabled = zoomScale >= 1.9;
      }

      function applyZoom() {
        pagesEl.style.transform = 'scale(' + zoomScale + ')';
        pagesEl.style.transformOrigin = 'top center';
        statusEl.textContent = 'Showing the full sample preview at ' + Math.round(zoomScale * 100) + '% zoom.';
        updateZoomButtons();
      }

      zoomOutBtn.addEventListener('click', () => {
        zoomScale = Math.max(0.7, Number((zoomScale - 0.1).toFixed(2)));
        applyZoom();
      });

      zoomResetBtn.addEventListener('click', () => {
        zoomScale = 1;
        applyZoom();
      });

      zoomInBtn.addEventListener('click', () => {
        zoomScale = Math.min(1.9, Number((zoomScale + 0.1).toFixed(2)));
        applyZoom();
      });

      document.addEventListener('contextmenu', (event) => event.preventDefault());
      document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if ((event.ctrlKey || event.metaKey) && ['s', 'p'].includes(key)) {
          event.preventDefault();
        }
      });

      async function renderAllPages() {
        try {
          const pdfjsLib = window.pdfjsLib;
          if (!pdfjsLib) {
            throw new Error('PDF preview library failed to load.');
          }

          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            withCredentials: false,
          });

          const pdf = await loadingTask.promise;
          pagesEl.innerHTML = '';

          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: baseScale });
            const pageShell = document.createElement('section');
            pageShell.className = 'page';

            const label = document.createElement('div');
            label.className = 'page-label';
            label.textContent = 'Page ' + pageNumber + ' of ' + pdf.numPages;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            pageShell.appendChild(label);
            pageShell.appendChild(canvas);
            pagesEl.appendChild(pageShell);

            await page.render({
              canvasContext: context,
              viewport,
            }).promise;
          }

          statusEl.textContent = 'Showing the full sample preview with ' + pdf.numPages + ' pages.';
          applyZoom();
        } catch (error) {
          console.error('[GoldenPackSampleEmbed]', error);
          pagesEl.innerHTML = '<div class="error">The embedded preview could not be loaded right now.</div>';
          statusEl.textContent = 'The embedded preview could not be loaded.';
        }
      }

      renderAllPages();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
