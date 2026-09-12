const fs = require('fs');
const path = require('path');
const parse5 = require('parse5');

const SRC = process.argv[2];
const OUT_DIR = process.argv[3];
const CSS_OUT = process.argv[4];

const src = fs.readFileSync(SRC, 'utf8');

// ---- isolate <x-dc> template ----
const open = /<x-dc(?:\s[^>]*)?>/.exec(src);
const close = src.lastIndexOf('</x-dc>');
const template = src.slice(open.index + open[0].length, close);

const helmetM = /<helmet>([\s\S]*?)<\/helmet>/.exec(template);
const helmet = helmetM ? helmetM[1] : '';
const body = template.replace(/<helmet>[\s\S]*?<\/helmet>/, '');

const baseCssM = /<style>([\s\S]*?)<\/style>/.exec(helmet);
const baseCss = baseCssM ? baseCssM[1] : '';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function kebabToCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// next/font gives the families generated names; reference them through CSS variables.
function fontFix(v) {
  return v
    .replace(/'Geist Mono'/g, 'var(--font-geist-mono)')
    .replace(/'Geist'/g, 'var(--font-geist)');
}

function splitDecls(css) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of css) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function declPair(decl) {
  let depth = 0;
  for (let i = 0; i < decl.length; i++) {
    const ch = decl[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ':' && depth === 0) return [decl.slice(0, i).trim(), decl.slice(i + 1).trim()];
  }
  return null;
}

const EXPR_RE = /\{\{\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\}\}/g;

// `scope` holds sc-for loop variables, which stay bare; everything else lives on `v`.
function qualify(expr, scope) {
  const root = expr.split('.')[0];
  return scope.has(root) ? expr : 'v.' + expr;
}

function valueToJs(raw, scope) {
  const v = fontFix(raw);
  if (!/\{\{/.test(v)) return JSON.stringify(v);
  const whole = /^\s*\{\{\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\}\}\s*$/.exec(v);
  if (whole) return qualify(whole[1], scope);
  let out = '`';
  let last = 0;
  v.replace(EXPR_RE, (m, expr, idx) => {
    out += v.slice(last, idx).replace(/[\\`]/g, (c) => '\\' + c).replace(/\$\{/g, '\\${');
    out += '${' + qualify(expr, scope) + '}';
    last = idx + m.length;
    return m;
  });
  out += v.slice(last).replace(/[\\`]/g, (c) => '\\' + c).replace(/\$\{/g, '\\${');
  return out + '`';
}

function styleToJs(css, scope) {
  const entries = [];
  for (const decl of splitDecls(css)) {
    const pair = declPair(decl);
    if (!pair) continue;
    const [propRaw, valRaw] = pair;
    if (!propRaw) continue;
    const prop = propRaw.startsWith('--') ? propRaw : kebabToCamel(propRaw);
    entries.push([prop, valueToJs(valRaw, scope)]);
  }
  // A CSS declaration block may repeat a property (the design does this to override an
  // earlier shorthand); last one wins. A JS object literal cannot, so drop the earlier
  // duplicates and keep each property at its final position.
  const parts = entries
    .filter(([prop], i) => !entries.some(([other], j) => j > i && other === prop))
    .map(([prop, val]) => JSON.stringify(prop) + ': ' + val);
  return '{ ' + parts.join(', ') + ' }';
}

// ---- pseudo-class stylesheet (mirrors the runtime's importantified classes) ----
const pseudoCache = new Map();
const pseudoRules = [];
let pseudoN = 0;
function pseudoClass(pseudo, css) {
  const key = pseudo + '|' + css;
  if (pseudoCache.has(key)) return pseudoCache.get(key);
  const cls = 'scp' + (pseudoN++).toString(36);
  const decls = splitDecls(fontFix(css))
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d + ' !important');
  pseudoRules.push('.' + cls + ':' + pseudo + ' { ' + decls.join('; ') + '; }');
  pseudoCache.set(key, cls);
  return cls;
}

const EVENT_MAP = {
  onclick: 'onClick', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onchange: 'onChange',
  oninput: 'onInput', onfocus: 'onFocus', onblur: 'onBlur', onsubmit: 'onSubmit',
  onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave',
};
const ATTR_MAP = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', colspan: 'colSpan', rowspan: 'rowSpan',
  maxlength: 'maxLength', autocomplete: 'autoComplete', readonly: 'readOnly', srcset: 'srcSet',
  inputmode: 'inputMode', autofocus: 'autoFocus',
};

/**
 * The design markup is React-flavoured, so attribute names are camelCase (`onClick`,
 * `strokeWidth`, `viewBox`). HTML parsing lowercases them, which would emit invalid DOM
 * props — so recover the original spelling from the raw source.
 */
function buildCaseMap(html) {
  const map = new Map();
  for (const m of html.matchAll(/[\s"'](([A-Za-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*))\s*=\s*["']/g)) {
    map.set(m[1].toLowerCase(), m[1]);
  }
  return map;
}
const caseMap = buildCaseMap(src);

// Set per screen. `ref` bindings resolve against a separate `refs` prop rather than the view
// model: a DOM handle carried on `v` makes every downstream `v.something` read look like a
// ref access during render to the React Compiler lint.
let usesRefs = false;

function attrName(name) {
  const lower = name.toLowerCase();
  if (ATTR_MAP[lower]) return ATTR_MAP[lower];
  if (EVENT_MAP[lower]) return EVENT_MAP[lower];
  if (lower.startsWith('data-') || lower.startsWith('aria-')) return lower;
  if (caseMap.has(lower)) return caseMap.get(lower);
  return name;
}

function indent(n) {
  return '  '.repeat(n);
}

function collapse(s) {
  return s.replace(/\s+/g, ' ');
}

function renderNodes(nodes, depth, scope) {
  const out = [];
  for (const node of nodes) {
    const chunk = renderNode(node, depth, scope);
    if (chunk) out.push(chunk);
  }
  return out;
}

function renderNode(node, depth, scope) {
  if (node.nodeName === '#text') {
    const text = node.value;
    if (!text.trim()) return null;
    const pieces = [];
    let last = 0;
    text.replace(EXPR_RE, (m, expr, idx) => {
      const lit = text.slice(last, idx);
      if (lit) pieces.push('{' + JSON.stringify(collapse(lit)) + '}');
      pieces.push('{' + qualify(expr, scope) + '}');
      last = idx + m.length;
      return m;
    });
    const tail = text.slice(last);
    if (tail) pieces.push('{' + JSON.stringify(collapse(tail)) + '}');
    return indent(depth) + pieces.join('');
  }
  if (node.nodeName === '#comment' || !node.tagName) return null;

  const tag = node.tagName.toLowerCase();
  const attrs = Object.fromEntries(node.attrs.map((a) => [a.name, a.value]));

  if (tag === 'sc-if') {
    const cond = valueToJs(attrs.value, scope);
    const kids = renderNodes(node.childNodes, depth + 2, scope);
    return (
      indent(depth) + '{' + cond + ' ? (\n' +
      indent(depth + 1) + '<>\n' +
      kids.join('\n') + '\n' +
      indent(depth + 1) + '</>\n' +
      indent(depth) + ') : null}'
    );
  }

  if (tag === 'sc-for') {
    const list = valueToJs(attrs.list, scope);
    const as = attrs.as || 'item';
    const inner = new Set(scope);
    inner.add(as);
    const kids = renderNodes(node.childNodes, depth + 2, inner);
    return (
      indent(depth) + '{' + list + '.map((' + as + ', i) => (\n' +
      indent(depth + 1) + '<Fragment key={i}>\n' +
      kids.join('\n') + '\n' +
      indent(depth + 1) + '</Fragment>\n' +
      indent(depth) + '))}'
    );
  }

  const props = [];
  const classNames = [];
  for (const { name, value } of node.attrs) {
    if (name.startsWith('hint-') || name === 'sc-name' || name === 'data-dc-tpl') continue;
    if (name.startsWith('style-')) {
      classNames.push(pseudoClass(name.slice(6), value));
      continue;
    }
    if (name === 'style') {
      props.push('style={' + styleToJs(value, scope) + '}');
      continue;
    }
    if (name === 'class') {
      classNames.push(value);
      continue;
    }

    const key = attrName(name);
    if (key === 'ref') {
      const m = /^\s*\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}\s*$/.exec(value);
      if (!m) throw new Error('ref attribute must be a plain binding, got: ' + value);
      usesRefs = true;
      props.push('ref={refs.' + m[1] + '}');
      continue;
    }
    if (key === 'src' && /^assets\//.test(value)) {
      props.push('src=' + JSON.stringify('/' + value));
      continue;
    }
    if (key === 'tabIndex') {
      props.push('tabIndex={' + (Number(value) || 0) + '}');
      continue;
    }
    const jsVal = valueToJs(value, scope);
    props.push(key + '=' + (jsVal.startsWith('"') ? jsVal : '{' + jsVal + '}'));
  }
  if (classNames.length) props.unshift('className=' + JSON.stringify(classNames.join(' ')));

  const propStr = props.length ? ' ' + props.join(' ') : '';

  if (VOID.has(tag)) return indent(depth) + '<' + tag + propStr + ' />';

  const kids = renderNodes(node.childNodes, depth + 1, scope);
  if (!kids.length) return indent(depth) + '<' + tag + propStr + '></' + tag + '>';
  return indent(depth) + '<' + tag + propStr + '>\n' + kids.join('\n') + '\n' + indent(depth) + '</' + tag + '>';
}

// ---- parse and split into screens ----
const frag = parse5.parseFragment(body);
const rootDiv = frag.childNodes.find((n) => n.tagName === 'div');
if (!rootDiv) throw new Error('root div not found');

const screens = [];
for (const child of rootDiv.childNodes) {
  if (child.tagName === 'sc-if') {
    const raw = child.attrs.find((a) => a.name === 'value').value;
    screens.push({ cond: /\{\{\s*([\w$.]+)\s*\}\}/.exec(raw)[1], node: child });
  } else if (child.nodeName !== '#text' || child.value.trim()) {
    throw new Error('unexpected non-sc-if child at root: ' + (child.tagName || child.nodeName));
  }
}

const NAME = {
  isLanding: 'LandingScreen',
  isAuth: 'AuthScreen',
  isOnboarding: 'OnboardingScreen',
  isApp: 'AppScreen',
};

fs.mkdirSync(OUT_DIR, { recursive: true });

const made = [];
for (const { cond, node } of screens) {
  const name = NAME[cond];
  if (!name) throw new Error('no component name mapped for ' + cond);
  usesRefs = false;
  const kids = renderNodes(node.childNodes, 3, new Set());
  const jsx = kids.join('\n');
  const needsFragment = /<Fragment key=/.test(jsx);

  const code =
    '// AUTO-GENERATED from "PrivyPay v3.dc.html" — do not edit by hand.\n' +
    '// Regenerate with: npm run design:build\n' +
    (usesRefs
      ? '/* eslint-disable react-hooks/refs -- `refs` holds callback refs (plain functions) from\n' +
        '   useHeroBackground, not ref objects; the rule reads `refs.xRef` as a `.current` access.\n' +
        '   See src/lib/heroBackground.ts. */\n'
      : '') +
    (needsFragment ? "import { Fragment } from 'react';\n" : '') +
    "import type { Vals } from '@/lib/viewModel';\n" +
    (usesRefs ? "import type { HeroRefs } from '@/lib/heroBackground';\n" : '') +
    '\n' +
    'export default function ' + name +
    (usesRefs ? '({ v, refs }: { v: Vals; refs: HeroRefs }) {\n' : '({ v }: { v: Vals }) {\n') +
    '  return (\n' +
    '    <>\n' +
    jsx + '\n' +
    '    </>\n' +
    '  );\n' +
    '}\n';

  fs.writeFileSync(path.join(OUT_DIR, name + '.tsx'), code);
  made.push({ name, cond });
}

const css =
  '/* AUTO-GENERATED from "PrivyPay v3.dc.html" — do not edit by hand. */\n' +
  '/* Regenerate with: npm run design:build */\n\n' +
  fontFix(baseCss).trim() + '\n\n' +
  '/* Pseudo-class rules compiled from style-hover / style-focus / style-active attributes.\n' +
  '   Declarations carry !important so they win over the elements\' inline styles, matching\n' +
  '   how the Claude Design runtime applies them. */\n' +
  pseudoRules.join('\n') + '\n';

fs.mkdirSync(path.dirname(CSS_OUT), { recursive: true });
fs.writeFileSync(CSS_OUT, css);

console.log('screens: ' + made.map((m) => m.name).join(', '));
console.log('pseudo rules: ' + pseudoRules.length);
