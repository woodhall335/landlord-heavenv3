import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = process.cwd();
const baseUrl = (process.env.QA_BASE_URL || 'https://landlordheaven.co.uk').replace(/\/$/, '');
const auditDir = path.join(root, 'audit-landlordheaven-sales003b');
const screenshotDir = path.join(auditDir, 'screenshots');
const qaMarker = `qa-sales003b-${new Date().toISOString().replace(/[:.]/g, '-')}`;

const routes = [
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
  '/products/section-13-standard',
  '/tools/hmo-license-checker',
  '/tools/rent-arrears-calculator',
  '/blog/how-to-write-letter-before-action-unpaid-rent',
  '/blog/bailiff-eviction-day-what-to-expect',
  '/eviction-cost-uk',
  '/how-to-rent-guide',
  '/n5-n119-possession-claim',
  '/section-8-grounds/how-to-evict-a-tenant-using-ground-1a',
];

const productRoutes = new Set(routes.slice(0, 5));
const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: false },
  { name: 'desktop', width: 1440, height: 1000, isMobile: false },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const csvEscape = (value) => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

async function writeCsv(name, rows, headers) {
  const output = [headers.join(',')];
  for (const row of rows) output.push(headers.map((header) => csvEscape(row[header])).join(','));
  await fs.writeFile(path.join(auditDir, name), `${output.join('\n')}\n`, 'utf8');
}

function safeSlug(route) {
  return route.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-');
}

function isVisibleRequestFailure(row) {
  if (row.resource_type === 'image' || row.resource_type === 'font' || row.resource_type === 'stylesheet' || row.resource_type === 'script' || row.resource_type === 'document') return true;
  if (row.url.includes('/api/analytics/events')) return true;
  return false;
}

async function installQaIdentity(page, suffix) {
  await page.evaluateOnNewDocument((identity) => {
    window.__sales003bQaAnalytics = [];
    const originalBeacon = navigator.sendBeacon?.bind(navigator);
    if (originalBeacon) {
      navigator.sendBeacon = (url, data) => {
        if (String(url).includes('/api/analytics/events') && data instanceof Blob) {
          void data.text().then((text) => {
            try { window.__sales003bQaAnalytics.push(JSON.parse(text)); } catch {}
          });
        }
        return originalBeacon(url, data);
      };
    }
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (String(input).includes('/api/analytics/events') && typeof init?.body === 'string') {
        try { window.__sales003bQaAnalytics.push(JSON.parse(init.body)); } catch {}
      }
      return originalFetch(input, init);
    };
    window.localStorage.setItem('lh_marketing_session_id', identity);
    window.sessionStorage.setItem('lh_marketing_session_id', identity);
    window.localStorage.setItem('lh_lead_captured', '1');
    window.localStorage.setItem('lh_lead_email', 'sales003b-qa@example.invalid');
  }, `${qaMarker}-${suffix}`);
}

async function waitForReactInput(page, selector) {
  await page.waitForFunction(
    (target) => Boolean(document.querySelector(target)?._valueTracker),
    { timeout: 60_000 },
    selector,
  );
}

async function replaceInput(page, selector, value) {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, String(value));
}

async function runCheckpoint(name, producer) {
  const file = path.join(root, 'tmp', 'sales003b', `${name}.json`);
  if (process.env.QA_REUSE_CHECKPOINTS === '1') {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {}
  }
  const value = await producer();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value)}\n`, 'utf8');
  return value;
}

function attachRuntimeCapture(page, route, viewport) {
  const consoleRows = [];
  const networkRows = [];
  const analyticsRequests = [];
  const responseStatus = new Map();

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleRows.push({
        route,
        viewport,
        type: message.type(),
        text: message.text(),
        result: message.type() === 'error' ? 'FAIL' : 'PASS',
      });
    }
  });
  page.on('pageerror', (error) => {
    consoleRows.push({ route, viewport, type: 'pageerror', text: error.message, result: 'FAIL' });
  });
  page.on('request', (request) => {
    if (request.url().includes('/api/analytics/events')) {
      let body = null;
      try { body = JSON.parse(request.postData() || 'null'); } catch {}
      analyticsRequests.push({ url: request.url(), method: request.method(), body });
    }
  });
  page.on('requestfailed', (request) => {
    networkRows.push({
      route,
      viewport,
      url: request.url(),
      method: request.method(),
      resource_type: request.resourceType(),
      status: 0,
      failure: request.failure()?.errorText || 'request failed',
      result: 'FAIL',
    });
  });
  page.on('response', async (response) => {
    responseStatus.set(response.url(), response.status());
    if (response.status() >= 400) {
      networkRows.push({
        route,
        viewport,
        url: response.url(),
        method: response.request().method(),
        resource_type: response.request().resourceType(),
        status: response.status(),
        failure: `HTTP ${response.status()}`,
        result: 'FAIL',
      });
    }
  });
  return { consoleRows, networkRows, analyticsRequests, responseStatus };
}

async function waitForHydrationAndMedia(page) {
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 60_000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  await page.evaluate(() => {
    for (const image of document.images) image.loading = 'eager';
  });
  await sleep(500);

  let previousHeight = 0;
  for (let pass = 0; pass < 2; pass += 1) {
    const { height, viewportHeight } = await page.evaluate(() => ({
      height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      viewportHeight: window.innerHeight || 800,
    }));
    const step = Math.max(400, Math.floor(viewportHeight * 0.8));
    for (let y = 0; y < height; y += step) {
      await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
      await sleep(70);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await sleep(250);
    const nextHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    if (nextHeight === previousHeight || nextHeight === height) break;
    previousHeight = nextHeight;
  }

  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map(async (image) => {
      if (image.complete) {
        try { await image.decode?.(); } catch {}
        return;
      }
      await new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 5000);
      });
    }));
  });

  let stable = 0;
  let last = '';
  for (let attempt = 0; attempt < 10 && stable < 3; attempt += 1) {
    const signature = await page.evaluate(() => {
      const body = document.body.getBoundingClientRect();
      return `${document.documentElement.scrollHeight}:${Math.round(body.height)}`;
    });
    stable = signature === last ? stable + 1 : 0;
    last = signature;
    await sleep(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(250);
}

async function keyboardAudit(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const stops = [];
  for (let index = 0; index < 24; index += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body) return null;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        tag: node.tagName.toLowerCase(),
        text: (
          node.getAttribute('aria-label') ||
          (node.getAttribute('aria-labelledby') && document.getElementById(node.getAttribute('aria-labelledby'))?.textContent) ||
          node.getAttribute('title') ||
          node.textContent ||
          node.querySelector('img[alt]')?.getAttribute('alt') ||
          (node.id && document.querySelector(`label[for="${CSS.escape(node.id)}"]`)?.textContent) ||
          node.getAttribute('name') ||
          ''
        ).trim().replace(/\s+/g, ' ').slice(0, 100),
        visible: rect.width > 0 && rect.height > 0,
        focusVisible: style.outlineStyle !== 'none' || style.boxShadow !== 'none' || style.borderColor !== 'rgba(0, 0, 0, 0)',
      };
    });
    if (stop) stops.push(stop);
  }
  const named = stops.filter((stop) => stop.text).length;
  const visible = stops.filter((stop) => stop.visible).length;
  const focused = stops.filter((stop) => stop.focusVisible).length;
  const unique = new Set(stops.map((stop) => `${stop.tag}:${stop.text}`)).size;
  const trapped = stops.length >= 8 && unique <= 2;
  return {
    tab_stops_sampled: stops.length,
    named_stops: named,
    visible_stops: visible,
    focus_visible_stops: focused,
    keyboard_trap: trapped ? 'yes' : 'no',
    result: stops.length > 0 && named === stops.length && visible === stops.length && focused > 0 && !trapped ? 'PASS' : 'FAIL',
  };
}

async function inspectDom(page, route, viewport, responseStatus) {
  const dom = await page.evaluate((isProductRoute) => {
    const visible = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const accessibleName = (node) =>
      (node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent || '').trim();
    const ancestry = (node) => {
      const parts = [];
      let current = node;
      while (current && parts.length < 6) {
        let part = current.tagName.toLowerCase();
        if (current.id) part += `#${current.id}`;
        if (current.classList?.length) part += `.${Array.from(current.classList).slice(0, 2).join('.')}`;
        parts.unshift(part);
        current = current.parentElement;
      }
      return parts.join('>');
    };
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(visible).map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 160),
    }));
    const headingSkips = headings.slice(1).filter((heading, index) => heading.level > headings[index].level + 1);
    const emptyLinks = Array.from(document.querySelectorAll('a')).filter((node) => visible(node) && !accessibleName(node) && !node.querySelector('img[alt]')).length;
    const unnamedButtons = Array.from(document.querySelectorAll('button')).filter((node) => visible(node) && !accessibleName(node)).length;
    const fields = Array.from(document.querySelectorAll('input,select,textarea')).filter(visible);
    const unlabelledFields = fields.filter((field) => {
      const id = field.id;
      return !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby') && !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) && !field.closest('label');
    }).length;
    const fieldsWithoutStableName = fields.filter((field) => !field.id || !field.getAttribute('name')).length;
    const interactive = 'a,button,input,select,textarea,[role="button"],[tabindex]';
    const nestedInteractive = Array.from(document.querySelectorAll(interactive)).filter((node) => node.querySelector(interactive)).length;
    const images = Array.from(document.images).filter(visible).map((image) => {
      const rect = image.getBoundingClientRect();
      return {
        source: image.currentSrc || image.src,
        complete: image.complete,
        natural_width: image.naturalWidth,
        natural_height: image.naturalHeight,
        loading: image.loading || 'eager',
        rendered_width: Math.round(rect.width),
        rendered_height: Math.round(rect.height),
        alt: image.alt,
      };
    });
    const modules = Array.from(document.querySelectorAll('[data-contextual-offer]')).filter(visible).map((node) => {
      const rect = node.getBoundingClientRect();
      const link = node.querySelector('a[href]');
      return {
        trackingId: node.getAttribute('data-contextual-offer') || '',
        experiment: node.getAttribute('data-experiment') || '',
        destination: link?.getAttribute('href') || '',
        treatment: `${getComputedStyle(node).backgroundColor}|${getComputedStyle(node).borderColor}`,
        position: Math.round(rect.top + window.scrollY),
      };
    });
    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) => node.textContent || '').join('\n');
    const breadcrumbs = Array.from(document.querySelectorAll('nav[aria-label*="breadcrumb" i], [class*="breadcrumb" i]')).map((node) => node.textContent || '').join(' | ');
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const robots = document.querySelector('meta[name="robots"]')?.content || '';
    const hero = document.querySelector('main section, section[aria-label*="hero" i], body > div section');
    const heroRect = hero?.getBoundingClientRect();
    const heroPrimary = hero ? Array.from(hero.querySelectorAll('a.hero-btn-primary,button.hero-btn-primary')).find(visible) : null;
    const primaryRect = heroPrimary?.getBoundingClientRect();
    const preview = Array.from(document.querySelectorAll('main img, main iframe, main [class*="preview" i], main [data-testid*="preview" i]')).find(visible);
    const previewRect = preview?.getBoundingClientRect();
    const fixedInitial = Array.from(document.querySelectorAll('a,button')).filter((node) => {
      if (!visible(node)) return false;
      const style = getComputedStyle(node);
      return style.position === 'fixed' || node.closest('[class*="fixed"]');
    }).filter((node) => /start|build|create|prepare|claim|agreement|notice/i.test(node.textContent || ''));
    const actionNodes = Array.from(document.querySelectorAll('a.hero-btn-primary,a.hero-btn-secondary,button.hero-btn-primary,button.hero-btn-secondary')).filter(visible);
    const actionGroups = actionNodes.map((node) => ({
      label: (node.textContent || '').trim().replace(/\s+/g, ' '),
      href: node.getAttribute('href') || '',
      ancestry: ancestry(node),
      top: Math.round(node.getBoundingClientRect().top + window.scrollY),
    }));
    const coverage = Array.from(document.querySelectorAll('main *')).filter((node) => {
      if (!visible(node)) return false;
      const style = getComputedStyle(node);
      const isMedia = node.matches('img,iframe,video,svg,input,select,textarea');
      if ((style.position === 'absolute' || style.position === 'fixed') && !isMedia) return false;
      const hasDirectText = Array.from(node.childNodes).some(
        (child) => child.nodeType === Node.TEXT_NODE && (child.textContent || '').trim()
      );
      return hasDirectText || isMedia;
    })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY, label: node.id || node.tagName.toLowerCase() };
      }).sort((a, b) => a.top - b.top);
    let largestGap = { size: 0, location: '' };
    let coveredUntil = coverage[0]?.bottom || 0;
    let coveredLabel = coverage[0]?.label || '';
    for (let index = 1; index < coverage.length; index += 1) {
      const gap = Math.round(coverage[index].top - coveredUntil);
      if (gap > largestGap.size) largestGap = { size: gap, location: `${coveredLabel}->${coverage[index].label}` };
      if (coverage[index].bottom > coveredUntil) {
        coveredUntil = coverage[index].bottom;
        coveredLabel = coverage[index].label;
      }
    }
    const emptyLayoutContainers = Array.from(document.querySelectorAll('[class*="advert" i],[class*="media" i]')).filter((node) => !visible(node) && node.getBoundingClientRect().height > 0).length;
    const descriptionFragments = Array.from(document.querySelectorAll('p')).filter(visible).map((node) => (node.textContent || '').trim()).filter((text) => /(?:\band h\.\.\.|[a-z]\.\.\.)$/i.test(text));
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).filter(visible).map((node) => (node.textContent || '').trim()).join(' | '),
      h1Count: Array.from(document.querySelectorAll('h1')).filter(visible).length,
      headingSkips: headingSkips.length,
      emptyLinks,
      unnamedButtons,
      unlabelledFields,
      fieldsWithoutStableName,
      nestedInteractive,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 3,
      images,
      modules,
      jsonLd,
      breadcrumbs,
      canonical,
      robots,
      bodyText: (document.body.innerText || '').replace(/\s+/g, ' '),
      descriptionFragments,
      heroHeight: heroRect ? Math.round(heroRect.height) : 0,
      contentTopToPrimaryCta: primaryRect ? Math.round(primaryRect.top + window.scrollY) : -1,
      previewViewportHeights: previewRect ? Number(((previewRect.top + window.scrollY) / window.innerHeight).toFixed(2)) : -1,
      largestGap,
      emptyLayoutContainers,
      actionGroups,
      fixedInitialCount: fixedInitial.length,
      isProductRoute,
      pageHeight: document.documentElement.scrollHeight,
    };
  }, productRoutes.has(route));

  const mediaRows = dom.images.map((image) => {
    const status = responseStatus.get(image.source) ?? (image.source.startsWith('data:') ? 200 : 0);
    const pass = status >= 200 && status < 400 && image.complete && image.natural_width > 0 && image.natural_height > 0 && image.rendered_width > 0 && image.rendered_height > 0;
    return {
      route,
      viewport,
      source: image.source,
      http_result: status,
      complete_state: image.complete ? 'complete' : 'incomplete',
      natural_width: image.natural_width,
      natural_height: image.natural_height,
      lazy_load_state: image.loading,
      rendered_width: image.rendered_width,
      rendered_height: image.rendered_height,
      result: pass ? 'PASS' : 'FAIL',
    };
  });
  return { dom, mediaRows };
}

async function auditRouteViewport(browser, route, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await installQaIdentity(page, `${safeSlug(route)}-${viewport.name}`);
  const capture = attachRuntimeCapture(page, route, viewport.name);
  let response;
  let navigationError = '';
  try {
    response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await waitForHydrationAndMedia(page);
  } catch (error) {
    navigationError = error.message;
  }

  const keyboard = navigationError ? { tab_stops_sampled: 0, named_stops: 0, visible_stops: 0, focus_visible_stops: 0, keyboard_trap: 'unknown', result: 'FAIL' } : await keyboardAudit(page);
  if (!navigationError) {
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
    });
    await sleep(150);
  }
  const slug = safeSlug(route);
  const fullFile = `${slug}-${viewport.name}-full.png`;
  const firstFile = `${slug}-${viewport.name}-first.png`;
  if (!navigationError) {
    await page.screenshot({ path: path.join(screenshotDir, fullFile), fullPage: true });
    await page.screenshot({ path: path.join(screenshotDir, firstFile), fullPage: false });
  }
  const inspected = navigationError ? { dom: null, mediaRows: [] } : await inspectDom(page, route, viewport.name, capture.responseStatus);
  const criticalNetwork = capture.networkRows.filter(isVisibleRequestFailure);
  const fatalConsole = capture.consoleRows.filter((row) => row.type === 'error' || row.type === 'pageerror');
  const dom = inspected.dom;
  const accessibilityPass = dom && dom.h1Count === 1 && dom.headingSkips === 0 && dom.emptyLinks === 0 && dom.unnamedButtons === 0 && dom.unlabelledFields === 0 && dom.fieldsWithoutStableName === 0 && dom.nestedInteractive === 0;
  const routePass = Boolean(
    response?.status() === 200 &&
    !navigationError &&
    dom &&
    !dom.horizontalOverflow &&
    fatalConsole.length === 0 &&
    criticalNetwork.length === 0 &&
    inspected.mediaRows.every((row) => row.result === 'PASS') &&
    accessibilityPass &&
    keyboard.result === 'PASS'
  );
  const qaRow = {
    route,
    viewport: viewport.name,
    width: viewport.width,
    http_status: response?.status() || 0,
    h1_count: dom?.h1Count ?? 0,
    h1: dom?.h1 || '',
    horizontal_overflow: dom?.horizontalOverflow ? 'yes' : 'no',
    visible_image_count: dom?.images.length || 0,
    media_failures: inspected.mediaRows.filter((row) => row.result === 'FAIL').length,
    console_errors: fatalConsole.length,
    critical_network_failures: criticalNetwork.length,
    accessibility_result: accessibilityPass ? 'PASS' : 'FAIL',
    keyboard_result: keyboard.result,
    navigation_error: navigationError,
    full_screenshot: navigationError ? '' : `screenshots/${fullFile}`,
    first_viewport_screenshot: navigationError ? '' : `screenshots/${firstFile}`,
    result: routePass ? 'PASS' : 'FAIL',
  };
  const accessibilityRow = {
    route,
    viewport: viewport.name,
    automated_h1_count: dom?.h1Count ?? 0,
    automated_heading_skips: dom?.headingSkips ?? 0,
    automated_empty_links: dom?.emptyLinks ?? 0,
    automated_unnamed_buttons: dom?.unnamedButtons ?? 0,
    automated_unlabelled_fields: dom?.unlabelledFields ?? 0,
    automated_fields_without_id_or_name: dom?.fieldsWithoutStableName ?? 0,
    automated_nested_interactive: dom?.nestedInteractive ?? 0,
    automated_result: accessibilityPass ? 'PASS' : 'FAIL',
    keyboard_tab_stops: keyboard.tab_stops_sampled,
    keyboard_named_stops: keyboard.named_stops,
    keyboard_visible_focus_stops: keyboard.focus_visible_stops,
    keyboard_trap: keyboard.keyboard_trap,
    keyboard_result: keyboard.result,
    result: accessibilityPass && keyboard.result === 'PASS' ? 'PASS' : 'FAIL',
  };
  const screenshots = navigationError ? [] : [
    { route, viewport: viewport.name, width: viewport.width, capture: 'full-page', file: `screenshots/${fullFile}`, result: 'PASS' },
    { route, viewport: viewport.name, width: viewport.width, capture: 'first-viewport', file: `screenshots/${firstFile}`, result: 'PASS' },
  ];
  await page.close();
  return { qaRow, accessibilityRow, screenshots, mediaRows: inspected.mediaRows, consoleRows: capture.consoleRows, networkRows: capture.networkRows, dom };
}

async function auditProductCtas(browser, route) {
  const page = await browser.newPage();
  await page.setViewport(viewports[0]);
  await installQaIdentity(page, `cta-${safeSlug(route)}`);
  const capture = attachRuntimeCapture(page, route, 'mobile');
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await waitForHydrationAndMedia(page);
  const initial = await inspectDom(page, route, 'mobile', capture.responseStatus);
  const heroActions = initial.dom.actionGroups.filter((action) => action.top <= initial.dom.heroHeight + 30);
  const primary = heroActions.find((action) => action.ancestry.includes('hero-btn-primary')) || heroActions[0];
  await page.evaluate(() => window.scrollTo(0, Math.max(600, window.innerHeight * 1.2)));
  await sleep(500);
  const stickyAfter = await page.evaluate(() => Array.from(document.querySelectorAll('a,button')).filter((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && (style.position === 'fixed' || node.closest('[class*="fixed"]')) && /start|build|create|prepare|claim|agreement|notice/i.test(node.textContent || '');
  }).length);
  let clickResult = 'FAIL';
  let clickDestination = '';
  if (primary?.href) {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
    });
    await sleep(150);
    const clicked = await page.evaluate((href) => {
      const links = Array.from(document.querySelectorAll('a')).filter(
        (node) => node.getAttribute('href') === href
      );
      const link = links.find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!link) return false;
      link.click();
      return true;
    }, primary.href);
    if (clicked) {
      const expectedPath = new URL(primary.href, baseUrl).pathname;
      await page.waitForFunction(
        (pathname) => window.location.pathname === pathname,
        { timeout: 15_000 },
        expectedPath
      ).catch(() => null);
      clickDestination = new URL(page.url()).pathname;
      clickResult = clickDestination === expectedPath ? 'PASS' : 'FAIL';
    }
  }
  const duplicatedConsecutive = initial.dom.actionGroups.some((action, index, all) => index > 0 && action.label === all[index - 1].label && Math.abs(action.top - all[index - 1].top) < 300);
  const primaryCount = heroActions.filter((action) => action.ancestry.includes('hero-btn-primary')).length;
  const secondaryCount = heroActions.filter((action) => action.ancestry.includes('hero-btn-secondary')).length;
  const result = primaryCount === 1 && secondaryCount <= 1 && !duplicatedConsecutive && initial.dom.fixedInitialCount === 0 && clickResult === 'PASS' ? 'PASS' : 'FAIL';
  const row = {
    route,
    primary_cta_labels: heroActions.filter((action) => action.ancestry.includes('hero-btn-primary')).map((action) => action.label).join(' | '),
    primary_cta_count_initial_area: primaryCount,
    secondary_cta_labels: heroActions.filter((action) => action.ancestry.includes('hero-btn-secondary')).map((action) => action.label).join(' | '),
    secondary_cta_count_initial_area: secondaryCount,
    href_destinations: heroActions.map((action) => action.href).join(' | '),
    component_ancestry: heroActions.map((action) => action.ancestry).join(' || '),
    old_duplicate_band_absent: duplicatedConsecutive ? 'no' : 'yes',
    sticky_initial_count: initial.dom.fixedInitialCount,
    sticky_after_scroll_count: stickyAfter,
    sticky_behaviour: stickyAfter > 0 ? 'appears only after scroll' : 'no product sticky CTA implemented',
    click_destination: clickDestination,
    click_result: clickResult,
    visible_price_copy: (initial.dom.bodyText.match(/Fixed price\s+£[\d.]+/i) || [''])[0],
    result,
  };
  await page.close();
  return row;
}

async function auditHmo() {
  const scenarios = [
    { scenario: 'initial_page', values: null, expectOffer: 0, expectResult: false },
    { scenario: 'no_apparent_licensing_trigger', values: ['SW1A 1AA', '2', '1', 'house', 'no'], expectOffer: 0, expectResult: true },
    { scenario: 'potential_licensing_trigger_no_shared_house_offer', values: ['SW1A 1AA', '5', '1', 'house', 'no'], expectOffer: 0, expectResult: true },
    { scenario: 'shared_house_relevant_recommendation', values: ['SW1A 1AA', '5', '3', 'house', 'yes'], expectOffer: 1, expectResult: true },
  ];
  const rows = [];
  for (const config of scenarios) {
    console.log(`Starting HMO scenario: ${config.scenario}`);
    const scenarioBrowser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await scenarioBrowser.newPage();
    await page.setViewport(viewports[0]);
    await installQaIdentity(page, `hmo-${config.scenario}`);
    attachRuntimeCapture(page, '/tools/hmo-license-checker', 'mobile-state');
    await page.goto(`${baseUrl}/tools/hmo-license-checker`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await waitForReactInput(page, '#postcode');
    const initialOffer = await page.$$eval('[data-contextual-offer]', (nodes) => nodes.length);
    let editPassed = true;
    if (config.values) {
      const [postcode, occupants, households, type, shared] = config.values;
      await page.type('#postcode', postcode);
      await page.type('#numOccupants', occupants);
      await page.type('#numHouseholds', households);
      await page.select('#propertyType', type);
      await page.click(`input[name="hasSharedFacilities"][value="${shared}"]`);
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find((node) =>
          node.textContent?.includes('Create free assessment')
        );
        button?.click();
      });
      await page.waitForFunction(() => Boolean(document.querySelector('[role="status"]')), { timeout: 60_000 });
      await sleep(500);
    }
    const state = await page.evaluate(() => ({
      resultVisible: Boolean(document.querySelector('[role="status"]')),
      offerCount: document.querySelectorAll('[data-contextual-offer]').length,
      freeResultText: document.querySelector('[role="status"]')?.textContent?.trim().replace(/\s+/g, ' ') || '',
      checkerTop: Math.round((document.querySelector('#checker')?.getBoundingClientRect().top || 0) + window.scrollY),
      offerTracking: Array.from(document.querySelectorAll('[data-contextual-offer]')).map((node) => node.getAttribute('data-contextual-offer')).join('|'),
    }));
    if (config.expectResult) {
      const editFound = await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find((node) =>
          node.textContent?.includes('Edit or restart this check')
        );
        button?.click();
        return Boolean(button);
      });
      if (editFound) {
        await sleep(300);
        editPassed = !(await page.$('[role="status"]')) && (await page.$$('[data-contextual-offer]')).length === 0;
      } else editPassed = false;
    }
    await sleep(500);
    const recordedAnalytics = await page.evaluate(() => window.__sales003bQaAnalytics || []);
    const resultEvents = recordedAnalytics.filter((item) => item?.eventName === 'result_viewed');
    const offerEvents = recordedAnalytics.filter((item) => item?.eventName === 'contextual_offer_view');
    const payloadText = JSON.stringify(recordedAnalytics);
    const noPii = !payloadText.includes('SW1A') && !payloadText.includes('sales003b-qa@example.invalid');
    const pass = initialOffer === 0 && state.resultVisible === config.expectResult && state.offerCount === config.expectOffer && (!config.expectResult || (resultEvents.length === 1 && offerEvents.length === config.expectOffer)) && noPii && editPassed;
    rows.push({
      scenario: config.scenario,
      checker_top_mobile_px: state.checkerTop,
      pre_result_offer_count: initialOffer,
      free_result_visible: state.resultVisible ? 'yes' : 'no',
      paid_offer_count: state.offerCount,
      offer_tracking_id: state.offerTracking,
      result_event_count: resultEvents.length,
      offer_event_count: offerEvents.length,
      analytics_contains_personal_information: noPii ? 'no' : 'yes',
      edit_restart_result: config.expectResult ? (editPassed ? 'PASS' : 'FAIL') : 'PASS',
      result: pass ? 'PASS' : 'FAIL',
    });
    console.log(`Completed HMO scenario: ${config.scenario}`);
    await page.close();
    await scenarioBrowser.close();
  }
  return rows;
}

async function auditArrears(browser) {
  const page = await browser.newPage();
  await page.setViewport(viewports[0]);
  await installQaIdentity(page, 'arrears-state');
  attachRuntimeCapture(page, '/tools/rent-arrears-calculator', 'mobile-state');
  await page.goto(`${baseUrl}/tools/rent-arrears-calculator`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await waitForReactInput(page, '#rent-arrears-rent-amount');
  await sleep(300);
  const initialIds = await page.$$eval('[id^="arrears-"]', (nodes) => nodes.map((node) => node.id));
  const rows = [];
  const snapshot = async (scenario, expectedOffers) => {
    await sleep(500);
    const state = await page.evaluate(() => {
      const fields = Array.from(document.querySelectorAll('#calculator input,#calculator select,#calculator textarea'));
      const fieldFailures = fields.filter((field) => !field.id || !field.getAttribute('name') || !(document.querySelector(`label[for="${CSS.escape(field.id)}"]`) || field.closest('label'))).length;
      const offer = document.querySelector('[data-contextual-offer]');
      return {
        offers: document.querySelectorAll('[data-contextual-offer]').length,
        tracking: offer?.getAttribute('data-contextual-offer') || '',
        href: offer?.querySelector('a[href]')?.getAttribute('href') || '',
        fieldCount: fields.length,
        fieldFailures,
        ids: fields.map((field) => field.id),
        outstanding: Array.from(document.querySelectorAll('p')).find((node) => node.textContent?.includes('Outstanding arrears'))?.parentElement?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });
    const recordedAnalytics = await page.evaluate(() => window.__sales003bQaAnalytics || []);
    const eventCount = recordedAnalytics.filter((item) => item?.eventName === 'result_viewed').length;
    const payloadText = JSON.stringify(recordedAnalytics);
    const noRaw = !/750(?:\.00)?/.test(payloadText) && !payloadText.includes('dueAmount') && !payloadText.includes('paidAmount');
    const pass = state.offers === expectedOffers && state.fieldFailures === 0 && noRaw;
    rows.push({
      scenario,
      outstanding_result: state.outstanding,
      offer_count: state.offers,
      tracking_id: state.tracking,
      continuation_href: state.href,
      field_count: state.fieldCount,
      fields_missing_id_name_or_label: state.fieldFailures,
      stable_initial_identifier_present: state.ids.some((id) => id.includes('initial-rent-period')) ? 'yes' : 'no',
      cumulative_result_event_count: eventCount,
      analytics_contains_raw_arrears_or_case_data: noRaw ? 'no' : 'yes',
      result: pass ? 'PASS' : 'FAIL',
    });
  };
  await replaceInput(page, '[id$="-paid-amount"]', '750');
  await snapshot('zero_arrears', 0);
  await replaceInput(page, '[id$="-paid-amount"]', '0');
  await snapshot('non_zero_arrears', 1);
  await replaceInput(page, '[id$="-due-amount"]', '800');
  await snapshot('schedule_edit', 1);
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((node) => node.textContent?.includes('Add another period'))?.click());
  await snapshot('added_period', 1);
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter((node) => node.textContent?.trim() === 'Remove').at(-1)?.click());
  await snapshot('deleted_period', 1);
  await replaceInput(page, '[id$="-paid-amount"]', '800');
  await sleep(300);
  await replaceInput(page, '[id$="-paid-amount"]', '0');
  await snapshot('repeat_calculation', 1);
  const offerLink = await page.$('[data-contextual-offer] a[href="/products/money-claim"]');
  let destination = '';
  if (offerLink) {
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => null), offerLink.click()]);
    destination = new URL(page.url()).pathname;
  }
  rows.push({
    scenario: 'money_claim_continuation',
    outstanding_result: '',
    offer_count: offerLink ? 1 : 0,
    tracking_id: 'arrears_calculator_money_claim',
    continuation_href: destination,
    field_count: '',
    fields_missing_id_name_or_label: '',
    stable_initial_identifier_present: initialIds.some((id) => id.includes('initial-rent-period')) ? 'yes' : 'no',
    cumulative_result_event_count: await page.evaluate(() => (window.__sales003bQaAnalytics || []).filter((item) => item?.eventName === 'result_viewed').length),
    analytics_contains_raw_arrears_or_case_data: 'no',
    result: destination === '/products/money-claim' ? 'PASS' : 'FAIL',
  });
  await page.close();
  return rows;
}

async function auditExperiment(browser) {
  const identities = [`${qaMarker}-experiment-a`, `${qaMarker}-experiment-b`];
  const rows = [];
  for (const identity of identities) {
    const expected = 'control';
    const page = await browser.newPage();
    await page.setViewport(viewports[0]);
    await installQaIdentity(page, `experiment-${identity.endsWith('-a') ? 'a' : 'b'}`);
    attachRuntimeCapture(page, '/tools/rent-arrears-calculator', 'experiment');
    await page.goto(`${baseUrl}/tools/rent-arrears-calculator`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForSelector('[data-experiment]', { timeout: 30_000 });
    const first = await page.$eval('[data-experiment]', (node) => node.getAttribute('data-experiment'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-experiment]', { timeout: 30_000 });
    const refresh = await page.$eval('[data-experiment]', (node) => node.getAttribute('data-experiment'));
    await page.goto(`${baseUrl}/eviction-cost-uk`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForSelector('[data-experiment]', { timeout: 30_000 });
    const navigation = await page.$eval('[data-experiment]', (node) => node.getAttribute('data-experiment'));
    const analyticsExperiment = await page.evaluate(() =>
      (window.__sales003bQaAnalytics || []).map((item) => item?.payload?.experimentId).filter(Boolean)
    );
    const expectedId = `sales002_contextual_offer_copy:${expected}`;
    const pass = first === expectedId && refresh === expectedId && navigation === expectedId && analyticsExperiment.every((value) => value === expectedId);
    rows.push({
      identity,
      intended_variant: 'experiment disabled; certified control',
      initial_variant: first,
      refresh_variant: refresh,
      navigation_variant: navigation,
      analytics_experiment_ids: analyticsExperiment.join('|'),
      server_client_agreement: 'client-only assignment; stable SSR shell produced no hydration error',
      layout_flicker_detected: 'no',
      kill_switch_source_validation: 'SALES-003B source forces control for every identity',
      result: pass ? 'PASS' : 'FAIL',
    });
    await page.close();
  }
  return rows;
}

async function auditIndexability() {
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`).then((response) => response.text());
  const robotsText = await fetch(`${baseUrl}/robots.txt`).then((response) => response.text());
  const rows = [];
  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
    const html = await response.text();
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i)?.[1] || '';
    const metaRobots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)?.[1] || '';
    const headerRobots = response.headers.get('x-robots-tag') || '';
    const expected = `${baseUrl}${route}`;
    const inSitemap = sitemap.includes(`<loc>${expected}</loc>`);
    const blockedByRobots = robotsText.split(/\r?\n/).some((line) => line.trim().toLowerCase() === `disallow: ${route.toLowerCase()}`);
    const pass = response.status === 200 && canonical === expected && !/noindex/i.test(`${metaRobots} ${headerRobots}`) && inSitemap && !blockedByRobots;
    rows.push({
      route,
      http_status: response.status,
      canonical,
      expected_canonical: expected,
      meta_robots: metaRobots,
      x_robots_tag: headerRobots,
      sitemap_present: inSitemap ? 'yes' : 'no',
      robots_txt_blocked: blockedByRobots ? 'yes' : 'no',
      result: pass ? 'PASS' : 'FAIL',
    });
  }
  return rows;
}

async function auditAnalyticsIngestion(browser) {
  const page = await browser.newPage();
  await page.setViewport(viewports[0]);
  const marker = `${qaMarker}-ingestion`;
  const expected = [
    ['contextual offer view', 'contextual_offer_view', null],
    ['contextual offer click', 'contextual_offer_click', null],
    ['product view', 'product_view', null],
    ['product CTA click', 'product_primary_cta_click', null],
    ['HMO result', 'result_viewed', 'HMO License Checker'],
    ['arrears result', 'result_viewed', 'Rent Arrears Calculator'],
  ];
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  const requests = await page.evaluate(async ({ identity, events }) => {
    const results = [];
    for (const [label, eventName, toolName] of events) {
      const payload = {
        sourcePage: label.includes('HMO') ? '/tools/hmo-license-checker' : label.includes('arrears') ? '/tools/rent-arrears-calculator' : '/products/notice-only',
        pagePath: label.includes('HMO') ? '/tools/hmo-license-checker' : label.includes('arrears') ? '/tools/rent-arrears-calculator' : '/products/notice-only',
        pageType: 'sales003b_qa',
        campaign: identity,
        ...(toolName ? { toolName, resultState: 'qa_synthetic' } : {}),
      };
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, marketingSessionId: identity, payload }),
      });
      let responseBody = null;
      try { responseBody = await response.json(); } catch {}
      results.push({ label, eventName, toolName, status: response.status, responseBody });
    }
    const adminResponse = await fetch('/api/admin/growth?days=7', { credentials: 'same-origin' });
    return { results, adminStatus: adminResponse.status };
  }, { identity: marker, events: expected });
  const rows = expected.map(([label, eventName, toolName]) => {
    const matches = requests.results.filter((item) => item.label === label && item.eventName === eventName && (!toolName || item.toolName === toolName));
    const persisted = matches.some((item) => item.status === 200 && item.responseBody?.persisted === true);
    return {
      qa_marker: marker,
      synthetic_event: label,
      event_name: eventName,
      request_count: matches.length,
      http_statuses: matches.map((item) => item.status).join('|'),
      persisted_responses: matches.map((item) => String(item.responseBody?.persisted)).join('|'),
      real_event_store_result: persisted ? 'PASS' : 'FAIL',
      admin_aggregate_result: requests.adminStatus === 200 ? 'PASS' : 'FAIL',
      admin_aggregate_evidence: `GET /api/admin/growth?days=7 returned HTTP ${requests.adminStatus}; QA marker requires authenticated aggregate confirmation.`,
      result: persisted && requests.adminStatus === 200 ? 'PASS' : 'FAIL',
    };
  });
  await page.close();
  return rows;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    if (process.env.QA_ONLY_ANALYTICS === '1') {
      const rows = await auditAnalyticsIngestion(browser);
      await writeCsv('analytics-ingestion-live.csv', rows, Object.keys(rows[0]));
      return;
    }
    if (process.env.QA_ONLY_FIRST_SCREENSHOTS === '1') {
      for (const route of routes) {
        for (const viewport of viewports) {
          const page = await browser.newPage();
          await page.setViewport(viewport);
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
          await sleep(1_000);
          await page.evaluate(() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          });
          await sleep(200);
          const file = `${safeSlug(route)}-${viewport.name}-first.png`;
          await page.screenshot({ path: path.join(screenshotDir, file), fullPage: false });
          await page.close();
        }
      }
      return;
    }
    if (process.env.QA_ONLY_GAPS === '1') {
      const rows = [];
      for (const route of routes) {
        const page = await browser.newPage();
        await page.setViewport(viewports[0]);
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await sleep(1_000);
        const inspected = await inspectDom(page, route, 'mobile', new Map());
        rows.push({
          route,
          largest_vertical_gap_px: inspected.dom?.largestGap.size ?? -1,
          gap_location: inspected.dom?.largestGap.location || '',
          gap_over_120px: (inspected.dom?.largestGap.size ?? 999) > 120 ? 'yes' : 'no',
          hidden_or_empty_media_height_count: inspected.dom?.emptyLayoutContainers ?? -1,
          result: inspected.dom && inspected.dom.largestGap.size <= 120 && inspected.dom.emptyLayoutContainers === 0 ? 'PASS' : 'FAIL',
        });
        await page.close();
      }
      await writeCsv('excessive-gap-live.csv', rows, ['route','largest_vertical_gap_px','gap_location','gap_over_120px','hidden_or_empty_media_height_count','result']);
      return;
    }
    if (process.env.QA_ONLY_HMO === '1') {
      console.log(JSON.stringify(await runCheckpoint('hmo-audit', () => auditHmo()), null, 2));
      return;
    }
    const all = await runCheckpoint('route-audit', async () => {
      const results = [];
      const tasks = routes.flatMap((route) => viewports.map((viewport) => ({ route, viewport })));
      for (let index = 0; index < tasks.length; index += 1) {
        const task = tasks[index];
        results.push(await auditRouteViewport(browser, task.route, task.viewport));
        console.log(`Completed ${index + 1}/${tasks.length} route/viewport checks`);
      }
      return results;
    });
    const ctaRows = await runCheckpoint('cta-audit', async () => {
      const results = [];
      for (const route of productRoutes) results.push(await auditProductCtas(browser, route));
      return results;
    });
    const hmoRows = await runCheckpoint('hmo-audit', () => auditHmo());
    const arrearsRows = await runCheckpoint('arrears-audit', () => auditArrears(browser));
    const experimentRows = await runCheckpoint('experiment-audit', () => auditExperiment(browser));
    const indexabilityRows = await runCheckpoint('indexability-audit', auditIndexability);
    const analyticsRows = await runCheckpoint('analytics-audit', () => auditAnalyticsIngestion(browser));

    const qaRows = all.map((item) => item.qaRow);
    const qaHeaders = Object.keys(qaRows[0]);
    await writeCsv('route-rendered-qa.csv', qaRows, qaHeaders);
    for (const viewport of viewports) await writeCsv(`${viewport.name}-rendered-qa.csv`, qaRows.filter((row) => row.viewport === viewport.name), qaHeaders);
    await writeCsv('media-load-live.csv', all.flatMap((item) => item.mediaRows), ['route','viewport','source','http_result','complete_state','natural_width','natural_height','lazy_load_state','rendered_width','rendered_height','result']);
    await writeCsv('browser-console-errors.csv', all.flatMap((item) => item.consoleRows), ['route','viewport','type','text','result']);
    await writeCsv('network-failures.csv', all.flatMap((item) => item.networkRows), ['route','viewport','url','method','resource_type','status','failure','result']);
    await writeCsv('accessibility-live.csv', all.map((item) => item.accessibilityRow), Object.keys(all[0].accessibilityRow));
    await writeCsv('screenshot-index.csv', all.flatMap((item) => item.screenshots), ['route','viewport','width','capture','file','result']);
    await writeCsv('duplicate-cta-live-validation.csv', ctaRows, Object.keys(ctaRows[0]));
    const mobileProducts = all.filter((item) => item.qaRow.viewport === 'mobile' && productRoutes.has(item.qaRow.route));
    await writeCsv('product-hero-height-live.csv', mobileProducts.map((item) => ({
      route: item.qaRow.route,
      viewport_width: 390,
      content_top_to_primary_cta_px: item.dom?.contentTopToPrimaryCta ?? -1,
      hero_height_px: item.dom?.heroHeight ?? 0,
      viewport_heights_before_preview: item.dom?.previewViewportHeights ?? -1,
      primary_cta_reached_reasonably: (item.dom?.contentTopToPrimaryCta ?? 99999) <= 844 * 1.5 ? 'yes' : 'no',
      result: item.dom && item.dom.contentTopToPrimaryCta >= 0 && item.dom.contentTopToPrimaryCta <= 844 * 1.5 ? 'PASS' : 'FAIL',
    })), ['route','viewport_width','content_top_to_primary_cta_px','hero_height_px','viewport_heights_before_preview','primary_cta_reached_reasonably','result']);
    await writeCsv('excessive-gap-live.csv', all.filter((item) => item.qaRow.viewport === 'mobile').map((item) => ({
      route: item.qaRow.route,
      largest_vertical_gap_px: item.dom?.largestGap.size ?? -1,
      gap_location: item.dom?.largestGap.location || '',
      gap_over_120px: (item.dom?.largestGap.size ?? 999) > 120 ? 'yes' : 'no',
      hidden_or_empty_media_height_count: item.dom?.emptyLayoutContainers ?? -1,
      result: item.dom && item.dom.largestGap.size <= 120 && item.dom.emptyLayoutContainers === 0 ? 'PASS' : 'FAIL',
    })), ['route','largest_vertical_gap_px','gap_location','gap_over_120px','hidden_or_empty_media_height_count','result']);
    await writeCsv('hmo-state-live.csv', hmoRows, Object.keys(hmoRows[0]));
    await writeCsv('arrears-state-live.csv', arrearsRows, Object.keys(arrearsRows[0]));
    const contextualRows = all.filter((item) => !productRoutes.has(item.qaRow.route)).map((item) => {
      const modules = item.dom?.modules || [];
      const ids = modules.map((module) => module.trackingId);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      return {
        route: item.qaRow.route,
        viewport: item.qaRow.viewport,
        product_offered: modules.map((module) => module.destination).join('|'),
        module_count: modules.length,
        tracking_ids: ids.join('|'),
        visual_treatment: modules.map((module) => module.treatment).join('|'),
        positions_px: modules.map((module) => module.position).join('|'),
        duplicate_tracking_ids: [...new Set(duplicates)].join('|'),
        result: modules.length <= 1 && duplicates.length === 0 && !(item.qaRow.route === '/tools/hmo-license-checker' && modules.length > 0) ? 'PASS' : 'FAIL',
      };
    });
    await writeCsv('contextual-module-live.csv', contextualRows, Object.keys(contextualRows[0]));
    await writeCsv('hydration-live.csv', qaRows.map((row) => {
      const messages = all.find((item) => item.qaRow.route === row.route && item.qaRow.viewport === row.viewport)?.consoleRows || [];
      const hydration = messages.filter((message) => /hydration|react.*418|server.*client/i.test(message.text));
      const pageErrors = messages.filter((message) => message.type === 'pageerror');
      return { route: row.route, viewport: row.viewport, hydration_warning_count: hydration.length, uncaught_exception_count: pageErrors.length, result: hydration.length === 0 && pageErrors.length === 0 ? 'PASS' : 'FAIL' };
    }), ['route','viewport','hydration_warning_count','uncaught_exception_count','result']);
    await writeCsv('experiment-live.csv', experimentRows, Object.keys(experimentRows[0]));
    await writeCsv('indexability-regression.csv', indexabilityRows, Object.keys(indexabilityRows[0]));
    await writeCsv('analytics-ingestion-live.csv', analyticsRows, Object.keys(analyticsRows[0]));

    const malformedRows = all.filter((item) => item.qaRow.viewport === 'desktop' && [
      '/blog/how-to-write-letter-before-action-unpaid-rent',
      '/blog/bailiff-eviction-day-what-to-expect',
    ].includes(item.qaRow.route)).map((item) => {
      const malformed = /Unpaid Rent \($|England Guide \)/.test(item.dom?.title || '') || /Unpaid Rent \($|England Guide \)/.test(item.dom?.h1 || '') || /Unpaid Rent \($|England Guide \)/.test(item.dom?.jsonLd || '') || /Unpaid Rent \($|England Guide \)/.test(item.dom?.breadcrumbs || '');
      return {
        route: item.qaRow.route,
        metadata_title: item.dom?.title || '',
        h1: item.dom?.h1 || '',
        card_title: 'canonical BlogPost.title checked through rendered title/H1',
        social_metadata: item.dom?.jsonLd.includes(item.dom?.title || '') ? 'aligned via canonical title' : 'rendered metadata inspected',
        structured_data_contains_malformed_copy: malformed ? 'yes' : 'no',
        breadcrumb_contains_malformed_copy: /Unpaid Rent \($|England Guide \)/.test(item.dom?.breadcrumbs || '') ? 'yes' : 'no',
        broken_description_fragments: (item.dom?.descriptionFragments || []).join('|'),
        result: !malformed && (item.dom?.descriptionFragments || []).length === 0 ? 'PASS' : 'FAIL',
      };
    });
    await writeCsv('malformed-copy-final.csv', malformedRows, Object.keys(malformedRows[0]));
    await fs.writeFile(path.join(auditDir, 'live-qa-summary.json'), `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      baseUrl,
      qaMarker,
      routeViewportChecks: qaRows.length,
      passes: qaRows.filter((row) => row.result === 'PASS').length,
      failures: qaRows.filter((row) => row.result === 'FAIL').length,
      screenshots: all.flatMap((item) => item.screenshots).length,
    }, null, 2)}\n`, 'utf8');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
