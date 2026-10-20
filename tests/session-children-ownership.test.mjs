import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const DA = '33333333-3333-4333-8333-333333333333';
const DB = '44444444-4444-4444-8444-444444444444';
const C = '55555555-5555-4555-8555-555555555555';
const forbidden = () => { throw new Error('Real network/environment dependency is prohibited'); };
const clone = (value) => JSON.parse(JSON.stringify(value));

function evaluate(source, requireModule, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    exports, require: requireModule, Response, Request, URL, Date,
    fetch: forbidden, process: { env: new Proxy({}, { get: forbidden }) }, ...globals,
  });
  return exports;
}

function fixture(userId = 'user_owner') {
  const state = {
    userId, clients: 0, queries: [], nextId: 10, failTable: null, beforeExecute: null,
    tables: {
      profiles: [{ id: 'user_owner' }, { id: 'user_partner' }],
      sessions: [{ id: A, user_id: 'user_owner', status: 'in_progress' }, { id: B, user_id: 'user_partner', status: 'in_progress' }],
      decisions: [
        { id: DA, session_id: A, section: 'family', key: 'full_name', value: 'Owner fixture', user_confirmed: false, created_at: 'original', confidence: 'decisive' },
        { id: DB, session_id: B, section: 'family', key: 'full_name', value: 'Partner fixture', user_confirmed: false, created_at: 'original', confidence: 'decisive' },
      ],
      transcript_entries: [{ id: 'transcript-a', session_id: A, role: 'user', content: 'Synthetic owner message', timestamp: '2026-01-01T00:00:00Z' }],
      flagged_items: [{ id: 'flag-a', session_id: A, topic: 'Synthetic', resolved: false }],
      couple_sessions: [{ id: C, primary_session_id: A, partner_session_id: B }],
      documents: [{ share_token: 'synthetic-valid-capability', session_id: A, share_expires_at: '2099-01-01T00:00:00Z' }],
    },
  };
  class Query {
    constructor(table) { this.table = table; this.action = 'select'; this.filters = []; this.record = { table, filters: this.filters }; state.queries.push(this.record); }
    select() { return this; }
    eq(key, value) { this.filters.push([key, value]); return this; }
    in(key, values) { this.filters.push([key, values, 'in']); return this; }
    order() { return this; }
    limit(n) { this.max = n; return this; }
    insert(payload) { this.action = this.record.action = 'insert'; this.payload = this.record.payload = clone(payload); return this; }
    upsert(payload, options) { this.action = this.record.action = 'upsert'; this.payload = this.record.payload = clone(payload); this.options = this.record.options = clone(options); return this; }
    update(payload) { this.action = this.record.action = 'update'; this.payload = this.record.payload = clone(payload); return this; }
    async execute(single = false) {
      await Promise.resolve();
      state.beforeExecute?.(this);
      if (state.failTable === this.table) return { data: null, error: { message: 'synthetic database error' } };
      const rows = state.tables[this.table] ?? [];
      let matched = rows.filter((row) => this.filters.every(([key, value, op]) => op === 'in' ? value.includes(row[key]) : row[key] === value));
      if (this.action === 'insert') {
        if (this.table === 'decisions' && rows.some((r) => ['session_id', 'section', 'key'].every((key) => r[key] === this.payload[key]))) {
          return { data: null, error: { code: '23505', message: 'synthetic unique constraint conflict' } };
        }
        const generatedId = `00000000-0000-4000-8000-${String(state.nextId++).padStart(12, '0')}`;
        const row = { id: generatedId, ...clone(this.payload) };
        rows.push(row); matched = [row];
      } else if (this.action === 'upsert') {
        throw new Error('Global child upsert is prohibited');
      } else if (this.action === 'update') {
        for (const row of matched) Object.assign(row, clone(this.payload));
      }
      if (this.max) matched = matched.slice(0, this.max);
      return { data: clone(single ? matched[0] ?? null : matched), error: null };
    }
    single() { return this.execute(true); }
    maybeSingle() { return this.execute(true); }
    then(resolve, reject) { return this.execute().then(resolve, reject); }
  }
  const client = { from: (table) => new Query(table) };
  const types = evaluate(read('src/types/index.ts'), forbidden);
  const modules = {
    'server-only': {},
    '@clerk/nextjs/server': { auth: async () => ({ userId: state.userId }) },
    '@/lib/supabase/server': { createServiceClient: () => { state.clients++; return client; } },
    '@/types': types,
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/analytics/server': { captureServerEvent: async () => {} },
    '@/lib/couple/compare': { compareDecisions: (a, b) => ({ totalKeys: a.length + b.length }) },
    '@/lib/documents/generator': { generateAllDocuments: () => ({ will: 'Synthetic template fixture' }) },
    '@/lib/sections/plan': { resolvePlan: () => ['family'] },
  };
  const requireModule = (name) => { if (!Object.hasOwn(modules, name)) throw new Error(`Unmocked import ${name}`); return modules[name]; };
  const handlers = evaluate(read('src/lib/session-children-server.ts'), requireModule);
  const session = () => evaluate(read('src/app/api/session/route.ts'), requireModule);
  const couple = () => evaluate(read('src/app/api/couple/compare/[id]/route.ts'), requireModule);
  const share = () => evaluate(read('src/lib/documents/share-access.ts'), requireModule);
  return { state, handlers, session, couple, share };
}

const jsonRequest = (body, method = 'POST', origin = 'https://mywillbuddy.com') =>
  new Request('https://mywillbuddy.com/api/session/decisions', {
    method, headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body),
  });
const decisionBody = (sessionId = A) => ({ sessionId, section: 'family', key: 'full_name', value: 'Updated owner fixture' });

for (const name of ['saveDecision', 'updateDecision', 'appendTranscript']) {
  test(`${name}: anonymous request stops before body, credential client or table access`, async () => {
    const { state, handlers } = fixture(null);
    const response = await handlers[name](new Proxy({}, { get: forbidden }));
    assert.equal(response.status, 401); assert.equal(state.clients, 0); assert.equal(state.queries.length, 0);
  });
}

test('anonymous transcript read cannot reach a credential client', async () => {
  const { state, handlers } = fixture(null);
  assert.equal((await handlers.readTranscript(new Proxy({}, { get: forbidden }))).status, 401);
  assert.equal(state.clients, 0);
});

for (const [name, body, method] of [
  ['saveDecision', decisionBody(B), 'POST'],
  ['updateDecision', { sessionId: B, decisionId: DB, value: 'forged' }, 'PATCH'],
  ['updateDecision', { sessionId: B, confirmAll: true }, 'PATCH'],
  ['appendTranscript', { sessionId: B, role: 'user', content: 'forged' }, 'POST'],
]) {
  test(`${name}: another session, including a linked partner, denies before child access`, async () => {
    const { state, handlers } = fixture(); const before = clone(state.tables);
    assert.equal((await handlers[name](jsonRequest(body, method))).status, 404);
    assert.equal(state.queries.some((q) => q.table !== 'sessions'), false);
    assert.deepEqual(state.tables, before);
  });
}

test('transcript GET enforces own session and never inherits couple read permission', async () => {
  const { state, handlers } = fixture();
  assert.equal((await handlers.readTranscript(new Request(`https://mywillbuddy.com/api/session/transcript?sessionId=${B}`))).status, 404);
  assert.equal(state.queries.some((q) => q.table === 'transcript_entries'), false);
});

test('natural-key save preserves canonical child id and creation time for a text Clerk owner', async () => {
  const { state, handlers } = fixture();
  const r = await handlers.saveDecision(jsonRequest(decisionBody()));
  assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'private, no-store');
  const { decision } = await r.json(); assert.equal(decision.id, DA); assert.equal(decision.created_at, 'original');
  assert.equal(state.tables.decisions.find((d) => d.id === DB).value, 'Partner fixture');
  assert.deepEqual(state.queries[0].filters, [['id', A], ['user_id', 'user_owner']]);
  const write = state.queries.find((q) => q.table === 'decisions' && q.action === 'update');
  assert.equal(Object.hasOwn(write.payload, 'id'), false);
  assert.equal(Object.hasOwn(write.payload, 'created_at'), false);
  assert.equal(Object.hasOwn(write.payload, 'session_id'), false);
  assert.deepEqual(write.filters, [['session_id', A], ['section', 'family'], ['key', 'full_name']]);
});

test('concurrent first saves share the existing natural key and never replace row identity', async () => {
  const { state, handlers } = fixture(); const body = { ...decisionBody(), key: 'partner_name' };
  const responses = await Promise.all([handlers.saveDecision(jsonRequest(body)), handlers.saveDecision(jsonRequest({ ...body, value: 'Second fixture' }))]);
  assert.deepEqual(responses.map((r) => r.status), [200, 200]);
  const rows = state.tables.decisions.filter((d) => d.session_id === A && d.key === 'partner_name');
  assert.equal(rows.length, 1);
  const result = await Promise.all(responses.map((r) => r.json())); assert.equal(result[0].decision.id, result[1].decision.id);
});

for (const additions of [{ id: DB }, { session_id: B }, { user_id: 'user_partner' }, { created_at: 'forged' }, { userId: 'user_partner' }]) {
  test(`save rejects immutable/forged input ${Object.keys(additions)[0]} before any DB lookup`, async () => {
    const { state, handlers } = fixture();
    assert.equal((await handlers.saveDecision(jsonRequest({ ...decisionBody(), ...additions }))).status, 400);
    assert.equal(state.clients, 0);
  });
}

test('foreign child id cannot be updated through an owned session and cannot be reassigned', async () => {
  const { state, handlers } = fixture();
  assert.equal((await handlers.updateDecision(jsonRequest({ sessionId: A, decisionId: DB, value: 'forged' }, 'PATCH'))).status, 404);
  assert.equal(state.tables.decisions.find((d) => d.id === DB).value, 'Partner fixture');
  const update = state.queries.find((q) => q.action === 'update'); assert.deepEqual(update.filters, [['id', DB], ['session_id', A]]);
  assert.equal(Object.hasOwn(update.payload, 'session_id'), false);
});

test('session reassignment race cannot turn an id-only update into a cross-session write', async () => {
  const { state, handlers } = fixture();
  state.beforeExecute = (query) => { if (query.table === 'decisions' && query.action === 'update') state.tables.decisions[0].session_id = B; };
  assert.equal((await handlers.updateDecision(jsonRequest({ sessionId: A, decisionId: DA, value: 'forged after move' }, 'PATCH'))).status, 404);
  assert.equal(state.tables.decisions[0].value, 'Owner fixture');
});

test('owner edit and atomic confirm-all affect only the verified session', async () => {
  const { state, handlers } = fixture();
  assert.equal((await handlers.updateDecision(jsonRequest({ sessionId: A, decisionId: DA, value: 'Owner edit' }, 'PATCH'))).status, 200);
  const response = await handlers.updateDecision(jsonRequest({ sessionId: A, confirmAll: true }, 'PATCH'));
  assert.equal(response.status, 200); assert.equal(state.tables.decisions[0].user_confirmed, true); assert.equal(state.tables.decisions[1].user_confirmed, false);
});

test('transcript append uses a new database id and never upserts an attacker-selected row', async () => {
  const { state, handlers } = fixture();
  const response = await handlers.appendTranscript(jsonRequest({ sessionId: A, role: 'user', content: 'Synthetic append' }));
  assert.equal(response.status, 200); const q = state.queries.find((q) => q.table === 'transcript_entries');
  assert.equal(q.action, 'insert'); assert.equal(Object.hasOwn(q.payload, 'id'), false); assert.equal(q.payload.session_id, A);
  assert.equal((await handlers.appendTranscript(jsonRequest({ sessionId: A, role: 'user', content: 'forged', id: DB }))).status, 400);
});

test('owner full transcript read is ordered/scoped; DB failure is not an empty success', async () => {
  const { state, handlers } = fixture(); const request = new Request(`https://mywillbuddy.com/api/session/transcript?sessionId=${A}`);
  const response = await handlers.readTranscript(request); assert.equal(response.status, 200); assert.equal((await response.json()).entries.length, 1);
  state.failTable = 'transcript_entries'; assert.equal((await handlers.readTranscript(request)).status, 500);
});

test('cross-origin and malformed JSON writes stop before a privileged DB client', async () => {
  const { state, handlers } = fixture();
  assert.equal((await handlers.saveDecision(jsonRequest(decisionBody(), 'POST', 'https://unowned.invalid'))).status, 403);
  const malformed = new Request('https://mywillbuddy.com/api/session/decisions', { method: 'POST', body: '{invalid' });
  assert.equal((await handlers.saveDecision(malformed)).status, 400); assert.equal(state.clients, 0);
});

test('owner session GET includes flags but a foreign session stops before every child table', async () => {
  const { state, session } = fixture();
  const response = await session().GET({ nextUrl: new URL(`https://mywillbuddy.com/api/session?id=${A}`) });
  assert.equal(response.status, 200); assert.equal((await response.json()).flaggedItems.length, 1);
  state.queries.length = 0;
  assert.equal((await session().GET({ nextUrl: new URL(`https://mywillbuddy.com/api/session?id=${B}`) })).status, 404);
  assert.equal(state.queries.some((q) => ['decisions', 'transcript_entries', 'flagged_items'].includes(q.table)), false);
});

test('authenticated session creation continues to use the Clerk identity, never a body owner', async () => {
  const { state, session } = fixture(); const response = await session().POST(new Proxy({}, { get: forbidden }));
  assert.equal(response.status, 200); assert.equal((await response.json()).session.user_id, 'user_owner');
  assert.equal(state.queries.find((q) => q.table === 'sessions' && q.action === 'insert').payload.user_id, 'user_owner');
});

test('first-time profile/session creation still permits the new owner to save a guided answer', async () => {
  const { state, session, handlers } = fixture('user_first_time_fixture');
  const response = await session().POST();
  assert.equal(response.status, 200);
  const { session: created } = await response.json();
  assert.equal(created.user_id, 'user_first_time_fixture');
  assert.ok(state.tables.profiles.some((p) => p.id === 'user_first_time_fixture'));
  const saved = await handlers.saveDecision(jsonRequest(decisionBody(created.id)));
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).decision.session_id, created.id);
});

for (const actor of ['user_owner', 'user_partner']) {
  test(`existing couple comparison permits ${actor} decision reads without transcripts, flags or writes`, async () => {
    const { state, couple } = fixture(actor);
    const response = await couple().GET({}, { params: Promise.resolve({ id: C }) });
    assert.equal(response.status, 200); const data = await response.json(); assert.equal(data.primaryDecisions.length, 1); assert.equal(data.partnerDecisions.length, 1);
    assert.equal(state.queries.some((q) => ['transcript_entries', 'flagged_items'].includes(q.table) || q.action), false);
  });
}

test('outsider couple comparison denies before decision reads', async () => {
  const { state, couple } = fixture('user_outsider');
  assert.equal((await couple().GET({}, { params: Promise.resolve({ id: C }) })).status, 403);
  assert.equal(state.queries.some((q) => q.table === 'decisions'), false);
});

test('existing public document capability remains read-only and rejects missing/expired capability before decisions', async () => {
  const { state, share } = fixture(null); const helper = share();
  assert.equal((await helper.getDocumentsByShareToken('synthetic-valid-capability')).ok, true);
  assert.equal(state.queries.some((q) => q.action), false);
  state.queries.length = 0; assert.equal((await helper.getDocumentsByShareToken('invalid-synthetic-capability')).ok, false);
  assert.equal(state.queries.some((q) => q.table === 'decisions'), false);
  state.tables.documents[0].share_expires_at = '2000-01-01T00:00:00Z'; state.queries.length = 0;
  assert.equal((await helper.getDocumentsByShareToken('synthetic-valid-capability')).reason, 'expired');
  assert.equal(state.queries.some((q) => q.table === 'decisions'), false);
});

test('browser child consumers no longer import a Supabase client or issue direct table requests', () => {
  for (const file of ['src/components/voice/VoiceProvider.tsx', 'src/components/summary/DecisionEditor.tsx', 'src/components/summary/TranscriptViewer.tsx']) {
    const source = read(file);
    assert.doesNotMatch(source, /lib\/supabase\/client|\.from\(['"](?:decisions|transcript_entries|flagged_items)['"]\)/, file);
  }
});

test('client save discards global child ids and shows server rejection instead of success', async () => {
  const sent = [];
  const client = evaluate(read('src/lib/session-children-client.ts'), forbidden, {
    fetch: async (url, init) => { sent.push({ url, ...init, body: JSON.parse(init.body) }); return Response.json({ error: 'Session not found' }, { status: 404 }); },
  });
  await assert.rejects(() => client.saveOwnedDecision(A, { id: DB, session_id: B, section: 'family', key: 'full_name', value: 'Synthetic', created_at: 'forged' }), /Session not found/);
  assert.equal(Object.hasOwn(sent[0].body, 'id'), false); assert.equal(Object.hasOwn(sent[0].body, 'session_id'), false); assert.equal(Object.hasOwn(sent[0].body, 'created_at'), false); assert.equal(sent[0].body.sessionId, A);
});

function componentFunction(file, name, globals, callback = false) {
  const sf = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let source;
  function visit(node) {
    if (!callback && ts.isFunctionDeclaration(node) && node.name?.text === name) source = node.getText(sf);
    if (callback && ts.isVariableDeclaration(node) && node.name.getText(sf) === name) source = `const ${name} = ${node.initializer.arguments[0].getText(sf)};`;
    ts.forEachChild(node, visit);
  }
  visit(sf); assert.ok(source, `Missing actual function ${name}`);
  return evaluate(`${source}\nexport { ${name} };`, forbidden, { console: { error() {} }, ...globals })[name];
}

test('guided provider failure keeps prior answers unchanged and exposes the failure', async () => {
  const calls = { local: 0, capture: 0, errors: [] }, decisionsRef = { current: [] };
  const save = componentFunction('src/components/voice/VoiceProvider.tsx', 'saveGuidedDecision', {
    sessionIdRef: { current: A }, decisionsRef,
    crypto: { randomUUID: () => 'temporary-browser-id' },
    clearOperationError() {}, saveDecision: async () => { throw new Error('Synthetic ownership rejection'); },
    setDecisions() { calls.local++; }, captureAnalyticsEvent() { calls.capture++; },
    setOperationError(value) { calls.errors.push(value); },
  }, true);
  await assert.rejects(() => save({ section: 'family', key: 'full_name', value: 'Synthetic answer' }), /ownership rejection/);
  assert.equal(decisionsRef.current.length, 0); assert.equal(calls.local, 0); assert.equal(calls.capture, 0); assert.equal(calls.errors.length, 1);
});

test('guided provider stores the canonical server decision rather than its temporary browser id', async () => {
  const decisionsRef = { current: [] }, saved = { id: DA, session_id: A, section: 'family', key: 'full_name', value: 'Synthetic answer' };
  let visible;
  const save = componentFunction('src/components/voice/VoiceProvider.tsx', 'saveGuidedDecision', {
    sessionIdRef: { current: A }, decisionsRef, crypto: { randomUUID: () => 'temporary-browser-id' },
    clearOperationError() {}, saveDecision: async () => saved,
    setDecisions(value) { visible = value; }, captureAnalyticsEvent() {}, setOperationError: forbidden,
  }, true);
  await save({ section: 'family', key: 'full_name', value: 'Synthetic answer' });
  assert.equal(decisionsRef.current[0].id, DA); assert.equal(visible[0].id, DA);
});

test('concurrent first guided saves merge one canonical natural-key answer after both replies', async () => {
  const decisionsRef = { current: [] }, pending = [], renders = [];
  const save = componentFunction('src/components/voice/VoiceProvider.tsx', 'saveGuidedDecision', {
    sessionIdRef: { current: A }, decisionsRef, crypto: { randomUUID: () => 'temporary-browser-id' },
    clearOperationError() {}, saveDecision: () => new Promise((resolve) => pending.push(resolve)),
    setDecisions(value) { renders.push(value); }, captureAnalyticsEvent() {}, setOperationError: forbidden,
  }, true);
  const first = save({ section: 'family', key: 'full_name', value: 'First fixture' });
  const second = save({ section: 'family', key: 'full_name', value: 'Second fixture' });
  assert.equal(pending.length, 2, 'Both calls must start before either response');
  pending[0]({ id: DA, session_id: A, section: 'family', key: 'full_name', value: 'First fixture' });
  await first;
  pending[1]({ id: DA, session_id: A, section: 'family', key: 'full_name', value: 'Second fixture' });
  await second;
  assert.equal(decisionsRef.current.length, 1);
  assert.equal(decisionsRef.current[0].id, DA);
  assert.equal(decisionsRef.current[0].value, 'Second fixture');
  assert.equal(renders.at(-1).length, 1);
});

test('guided UI does not advance, complete or change sections after a rejected save', async () => {
  const errors = [], progress = [];
  const proceed = componentFunction('src/components/session/GuidedPlanFlow.tsx', 'continueFlow', {
    value: 'Synthetic answer', reasoning: '', saving: false,
    question: { section: 'family', key: 'full_name' }, step: 0,
    questions: [{ section: 'family', key: 'full_name' }, { section: 'assets', key: 'accounts' }],
    setSaving() {}, setErrorMessage(value) { if (value) errors.push(value); },
    saveGuidedDecision: async () => { throw new Error('Synthetic failure'); },
    setStep(value) { progress.push(value); }, jumpToSection: forbidden, completeGuidedSession: forbidden,
  });
  await proceed(); assert.equal(progress.length, 0); assert.equal(errors.length, 1);
});

for (const name of ['saveEdit', 'toggleConfirmed', 'confirmAll']) {
  test(`summary ${name} never claims a rejected edit or confirmation succeeded`, async () => {
    const effects = { visible: 0, closed: 0, errors: [] };
    const action = componentFunction('src/components/summary/DecisionEditor.tsx', name, {
      sessionId: A, editValue: 'Synthetic edit',
      updateOwnedDecision: async () => { throw new Error('Synthetic failure'); },
      confirmOwnedDecisions: async () => { throw new Error('Synthetic failure'); },
      setSaving() {}, setErrorMessage(value) { if (value) effects.errors.push(value); },
      setLocalDecisions() { effects.visible++; }, setEditingId() { effects.closed++; },
    });
    await action(DA, false); assert.equal(effects.visible, 0); assert.equal(effects.closed, 0); assert.equal(effects.errors.length, 1);
  });
}

test('transcript viewer reports a denied read instead of rendering a misleading empty transcript', async () => {
  const errors = [], loading = []; let changed = false;
  const load = componentFunction('src/components/summary/TranscriptViewer.tsx', 'loadTranscript', {
    sessionId: A, readOwnedTranscript: async () => { throw new Error('Synthetic ownership denial'); },
    setLoading(value) { loading.push(value); }, setErrorMessage(value) { if (value) errors.push(value); },
    setEntries() { changed = true; },
  });
  await load(); assert.deepEqual(loading, [true, false]); assert.equal(changed, false); assert.equal(errors.length, 1);
});
