// Isolated behavioral tests: no network or events sent to the shared project.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => {
    if (!(name in mocks)) throw Error(`Unexpected import: ${name}`);
    return mocks[name];
  }, URL, TextEncoder, ...globals }, { filename: file });
  return exports;
}
const helpers = load('src/lib/article-analytics.ts');
const id = helpers.articleAnalyticsId;
assert.equal(id('https://news.test/a?id=3&utm_source=x#section'), id('https://news.test/a?id=3'));
assert.notEqual(id('https://news.test/a?id=3'), id('https://news.test/a?id=4'));
assert.equal(id('javascript:alert(1)'), undefined);
assert.equal(id(''), undefined);
assert.equal(id('https://news.test/a?b=2&a=1'), id('https://news.test/a?a=1&b=2'));
assert.equal(helpers.newsListDepth(1000, 1000, 800), 0);
assert.equal(helpers.newsListDepth(300, 1000, 800), 50);
assert.equal(helpers.newsListDepth(-200, 1000, 800), 100);
assert.equal(helpers.newsListDepth(-1200, 1000, 800), 0);
assert.equal(helpers.newsListDepth(100, 0, 800), 0);

const events = [];
const refs = [];
let cursor = 0, effect, intersection, raf, disconnected = 0;
const listeners = new Map();
const document = { visibilityState: 'visible', addEventListener: (n, f) => listeners.set(n, f), removeEventListener: (n) => listeners.delete(n) };
const cards = [1, 2].map((n) => ({ dataset: { newsArticleId: `a${n}`, newsSector: '경제', newsPosition: String(n) } }));
let rect = { top: 1000, height: 1000 };
const list = { querySelectorAll: () => cards, getBoundingClientRect: () => rect };
const hook = load('src/lib/use-news-list-analytics.ts', {
  react: { useRef: (initial) => refs[cursor++] ||= { current: initial }, useEffect: (f) => { effect = f; } },
  './mixpanel': { track: (name, props) => events.push({ name, props }) },
  './article-analytics': helpers,
}, {
  document,
  window: { innerHeight: 800, addEventListener: (n, f) => listeners.set(n, f), removeEventListener: (n) => listeners.delete(n) },
  IntersectionObserver: class { constructor(f) { intersection = f; } observe() {} unobserve() {} disconnect() { disconnected++; } },
  ResizeObserver: class { observe() {} disconnect() {} },
  requestAnimationFrame: (f) => { raf = f; return 1; }, cancelAnimationFrame: () => {},
}).useNewsListAnalytics;
function mount(category = '전체') {
  cursor = 0;
  hook({ current: list }, category, '["a1","a2"]', 2);
  return effect();
}
let cleanup = mount();
raf();
assert.equal(events.length, 0, 'below-fold list cannot count progress');
const enter = (ratio) => intersection([{ target: cards[0], isIntersecting: true, intersectionRatio: ratio }]);
enter(0.49); assert.equal(events.length, 0);
enter(0.5); enter(1);
assert.equal(events.filter(e => e.name === 'news_card_impression').length, 1);
document.visibilityState = 'hidden';
intersection([{ target: cards[1], isIntersecting: true, intersectionRatio: 1 }]);
assert.equal(events.length, 1);
document.visibilityState = 'visible';
rect.top = 550; listeners.get('scroll')(); raf();
rect.top = -200; listeners.get('scroll')(); raf();
listeners.get('scroll')(); raf();
assert.deepEqual(events.filter(e => e.name === 'news_list_scroll_depth').map(e => e.props.scroll_depth), [25, 50, 75, 100]);
cleanup(); assert.equal(listeners.size, 0); assert.equal(disconnected, 1);
cleanup = mount(); raf(); enter(1); // Strict Mode replay / same category
assert.equal(events.length, 5);
cleanup(); cleanup = mount('금융'); raf(); enter(1);
assert.equal(events.length, 10, 'new category has a separate exposure');
cleanup(); cleanup = mount(); raf(); enter(1);
assert.equal(events.length, 10, 'revisiting the category does not count again');
cleanup();

// Both writing entries keep their own entry_point while joining the same article.
const writing = fs.readFileSync(path.join(root, 'src/app/record/new/external/page.tsx'), 'utf8');
for (const event of ['record_started', 'record_saved', 'record_article_attached']) {
  const payload = writing.split(`track("${event}", {`)[1]?.split('});')[0];
  assert.match(payload, /articleAnalytics\(rawUrl\)/);
  assert.match(payload, /entry_point: recordEntryPoint/);
  assert.doesNotMatch(payload, /\b(?:thought|title|email|investmentNote|articleSummary):/);
}
assert(writing.indexOf('if (duplicate)') < writing.indexOf('track("record_saved"'));
const opens = ['src/components/LatestNewsList.tsx', 'src/components/HotNewsCard.tsx'];
for (const file of opens) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(code.split('track("article_opened", {')[1], /articleAnalytics\(article.url\)/);
}
const analytics = fs.readFileSync(path.join(root, 'src/lib/mixpanel.ts'), 'utf8');
assert.match(analytics, /autocapture: false/);
assert.match(analytics, /ip: false/);
assert.match(analytics, /property_blacklist:.*\$current_url.*\$referrer/);
console.log('PASS: article identity, list progress, impressions, deduplication, hidden tab, cleanup, funnel payload and privacy guards');
