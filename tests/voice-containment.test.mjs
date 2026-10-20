import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const require = createRequire(import.meta.url);
const message = 'Voice planning is temporarily unavailable. You can continue step by step.';

function evaluate(source, globals = {}, requireModule = () => {
  throw new Error('Unexpected dependency');
}) {
  const exports = {};
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, require: requireModule, Response, ...globals });
  return exports;
}

function guardedRoute() {
  const effects = { env: 0, network: 0, request: 0, dependencies: [] };
  const globals = {
    process: { env: new Proxy({}, { get() { effects.env++; throw new Error('Credential/env access'); } }) },
    fetch() { effects.network++; throw new Error('Network dispatch'); },
  };
  const helper = evaluate(read('src/lib/voice-unavailable.ts'), globals);
  const route = evaluate(read('src/app/api/gemini/token/route.ts'), globals, (name) => {
    effects.dependencies.push(name);
    assert.equal(name, '@/lib/voice-unavailable', 'Auth, DB and provider dependencies are prohibited');
    return helper;
  });
  return { route, effects };
}

const requests = [
  ['anonymous', {}],
  ['signed-in fixture', { cookie: '__session=synthetic-test-only' }],
  ['forged bearer', { authorization: 'Bearer synthetic-forgery', userId: 'synthetic-other-user' }],
  ['malformed body', { body: '{invalid' }],
  ['model and restore overrides', { body: { model: 'forged-model', enabled: true, token: 'synthetic-value' } }],
  ['oversized input', { body: 'x'.repeat(100_000) }],
];

for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']) {
  for (const [label, fixture] of requests) {
    test(`${method}: ${label} cannot reach credentials, body, auth, DB or provider`, async () => {
      const { route, effects } = guardedRoute();
      const request = new Proxy(fixture, {
        get() { effects.request++; throw new Error('Request/body/header access'); },
      });
      const response = await route[method](request);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), {
        error: message,
        code: 'VOICE_TEMPORARILY_UNAVAILABLE',
      });
      assert.equal(effects.env, 0);
      assert.equal(effects.network, 0);
      assert.equal(effects.request, 0);
      assert.deepEqual(effects.dependencies, ['@/lib/voice-unavailable']);
    });
  }
}

function providerCallback(name, globals) {
  const file = ts.createSourceFile('provider.tsx', read('src/components/voice/VoiceProvider.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let callback;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === name) {
      assert.ok(ts.isCallExpression(node.initializer));
      callback = node.initializer.arguments[0].getText(file);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  assert.ok(callback, `Missing actual provider callback ${name}`);
  return evaluate(`export const callback = ${callback};`, globals).callback;
}

for (const callbackName of ['connect', 'selectInputMethod']) {
  test(`browser ${callbackName} refuses voice before any fetch, storage or session mutation`, async () => {
    const effects = { stopped: 0, states: [], errors: [], forbidden: 0 };
    const forbidden = () => { effects.forbidden++; throw new Error('Unexpected side effect'); };
    const globals = {
      VOICE_UNAVAILABLE_MESSAGE: message,
      stopVoiceTransport() { effects.stopped++; },
      setVoiceState(value) { effects.states.push(value); },
      setOperationError(value) { effects.errors.push(value); },
      fetch: forbidden,
      clearOperationError: forbidden,
      setInputMethod: forbidden,
      captureAnalyticsEvent: forbidden,
      buildSectionPlan: forbidden,
      window: new Proxy({}, { get: forbidden }),
      process: { env: new Proxy({}, { get: forbidden }) },
      sessionIdRef: new Proxy({}, { get: forbidden }),
      clientRef: new Proxy({}, { get: forbidden }),
      supabase: new Proxy({}, { get: forbidden }),
    };
    await providerCallback(callbackName, globals)('voice');
    assert.equal(effects.stopped, 1);
    assert.deepEqual(effects.states, ['error']);
    assert.deepEqual(effects.errors, [message]);
    assert.equal(effects.forbidden, 0);
  });
}

function pageFor(inputMethod) {
  const file = ts.createSourceFile('page.tsx', read('src/app/session/[id]/page.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const component = file.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'SessionLayout');
  const choices = [];
  const exports = evaluate(`${component.getText(file)}\nexport { SessionLayout };`, {
    useVoice: () => ({
      inputMethod, isSessionReady: true, operationError: null,
      selectInputMethod: async (method) => { choices.push(method); },
    }),
    useState: () => [false, () => {}],
    VOICE_UNAVAILABLE_MESSAGE: message,
  }, (name) => {
    assert.equal(name, 'react/jsx-runtime');
    return require(name);
  });
  const tree = exports.SessionLayout();
  function all(node) {
    if (!node || typeof node !== 'object') return [];
    const children = node.props?.children;
    return [node, ...(Array.isArray(children) ? children : [children]).flatMap(all)];
  }
  return { nodes: all(tree), choices };
}

test('method chooser disables voice and keeps the guided action available', () => {
  const { nodes, choices } = pageFor(undefined);
  const buttons = nodes.filter((node) => node.type === 'button');
  assert.equal(buttons.length, 2);
  assert.equal(buttons[0].props.disabled, true);
  assert.equal(buttons[0].props.onClick, undefined);
  assert.notEqual(buttons[1].props.disabled, true);
  buttons[1].props.onClick();
  assert.deepEqual(choices, ['guided']);
});

test('saved voice sessions show a direct guided continuation without starting voice', () => {
  const { nodes, choices } = pageFor('voice');
  const buttons = nodes.filter((node) => node.type === 'button');
  assert.equal(buttons.length, 1);
  assert.equal(buttons[0].props.children, 'Continue step by step');
  buttons[0].props.onClick();
  assert.deepEqual(choices, ['guided']);
  assert.ok(nodes.some((node) => node.props?.children === message));
});

test('only the contained token path bypasses auth proxy; other product paths retain it', () => {
  const file = ts.createSourceFile('proxy.ts', read('src/proxy.ts'), ts.ScriptTarget.Latest, true);
  let expression;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'config') {
      expression = node.initializer.getText(file);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  const { config } = evaluate(`export const config = ${expression};`);
  const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
  for (const url of ['/api/gemini/token', '/api/gemini/token/', '/api/gemini/token?model=forged']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), false, url);
  }
  for (const url of ['/session/fixture', '/summary/fixture', '/api/session', '/api/documents', '/api/stripe/checkout', '/api/gemini/tokenization', '/api/gemini/token/child']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true, url);
  }
});
