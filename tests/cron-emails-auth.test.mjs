import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {autoImplementMethods} from 'next/dist/server/route-modules/app-route/helpers/auto-implement-methods.js';

const source = readFileSync(new URL('../src/app/api/cron/emails/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText;
const SECRET = 'synthetic-existing-cron-fixture';
const NOW = Date.parse('2026-10-20T12:00:00Z');
const forbidden = () => {throw new Error('Real dependency or request-body access forbidden');};
const plain = value => JSON.parse(JSON.stringify(value));

function fixture(expected, {authorizedWork = false, emailOutcome} = {}) {
  if (arguments.length === 0) expected = SECRET;
  const state = {credentialClients: 0, queries: [], emails: [], names: [], templates: [], comparisons: 0, envReads: []};
  const tables = {
    couple_sessions: [
      {id: 'fixture-waiting-couple', status: 'awaiting_partner', primary_session_id: 'waiting', partner_session_id: null},
      {id: 'fixture-done-couple', status: 'comparing', primary_session_id: 'primary', partner_session_id: 'partner'},
    ],
    sessions: [
      {id: 'waiting', user_id: 'fixture-user-waiting', status: 'completed'},
      {id: 'primary', user_id: 'fixture-user-primary', status: 'completed'},
      {id: 'partner', user_id: 'fixture-user-partner', status: 'completed'},
      {id: 'idle', user_id: 'fixture-user-idle', status: 'in_progress', started_at: '2026-10-01T00:00:00Z'},
      {id: 'active', user_id: 'fixture-user-active', status: 'in_progress', started_at: '2026-10-01T00:00:00Z'},
    ],
    decisions: [
      {session_id: 'primary', value: 'Synthetic primary fixture'},
      {session_id: 'partner', value: 'Synthetic partner fixture'},
      {session_id: 'idle', updated_at: '2026-10-02T00:00:00Z'},
      {session_id: 'active', updated_at: '2026-10-19T00:00:00Z'},
    ],
  };
  class Query {
    constructor(table) {this.table = table; this.filters = []; state.queries.push({table});}
    select() {return this;}
    eq(key, value) {this.filters.push(row => row[key] === value); return this;}
    in(key, values) {this.filters.push(row => values.includes(row[key])); return this;}
    lt(key, value) {this.filters.push(row => row[key] < value); return this;}
    order() {return this;}
    limit(count) {this.max = count; return this;}
    async execute(single = false) {
      let rows = (tables[this.table] ?? []).filter(row => this.filters.every(f => f(row)));
      if (this.max) rows = rows.slice(0, this.max);
      return {data: plain(single ? rows[0] ?? null : rows)};
    }
    single() {return this.execute(true);}
    then(resolve, reject) {return this.execute().then(resolve, reject);}
  }
  const template = kind => args => {state.templates.push({kind, args}); return {subject: 'Synthetic subject', html: '<p>Synthetic fixture</p>', text: 'Synthetic fixture'};};
  const modules = {
    'next/server': {NextResponse: {json: (body, init) => Response.json(body, init)}},
    '@/lib/supabase/server': {createServiceClient: () => {state.credentialClients++; if (!authorizedWork) forbidden(); return {from: table => new Query(table)};}},
    '@/lib/emails/send': {
      sendEmailOnce: async args => {if (!authorizedWork) forbidden(); state.emails.push(plain(args)); return emailOutcome ?? {ok: true};},
      getUserDisplayName: async id => {if (!authorizedWork) forbidden(); state.names.push(id); return 'Synthetic name';},
    },
    '@/lib/emails/templates': {renderWaitingEmail: template('waiting'), renderBothDoneEmail: template('both'), renderIdleEmail: template('idle')},
    '@/lib/couple/compare': {compareDecisions: () => {if (!authorizedWork) forbidden(); state.comparisons++; return {agreements: [{}], disagreements: []};}},
    '@/lib/resend': {getAppUrl: () => {if (!authorizedWork) forbidden(); return 'https://synthetic-owned.invalid';}},
  };
  const exports = {};
  class FixedDate extends Date {
    constructor(value = NOW) {super(value);}
    static now() {return NOW;}
  }
  vm.runInNewContext(compiled, {
    exports, require: name => {if (!Object.hasOwn(modules, name)) forbidden(); return modules[name];},
    Response, Date: FixedDate, fetch: forbidden, console: new Proxy({}, {get: forbidden}),
    process: {env: new Proxy({}, {get: (_, key) => {state.envReads.push(key); if (key !== 'CRON_SECRET') forbidden(); return expected;}})},
  });
  const request = header => new Proxy({headers: {get: name => {assert.equal(name, 'authorization'); return header;}}}, {
    get: (target, key) => {if (key !== 'headers') forbidden(); return target.headers;},
  });
  return {state, exports, methods: autoImplementMethods(exports), request};
}

function assertNoWork(state) {
  assert.equal(state.credentialClients, 0);
  assert.deepEqual(state.queries, []);
  assert.deepEqual(state.emails, []);
  assert.deepEqual(state.templates, []);
  assert.deepEqual(state.names, []);
  assert.equal(state.comparisons, 0);
  assert.ok(state.envReads.every(key => key === 'CRON_SECRET'));
}

for (const [label, expected] of [['missing', undefined], ['empty', ''], ['spaces', '   '], ['tabs', '\t\t'], ['mixed whitespace', '\r\n \t']]) {
  for (const method of ['GET', 'HEAD']) {
    test(`${method}: ${label} configuration denies before credential client/provider/body`, async () => {
      const {state, methods, request} = fixture(expected);
      const response = await methods[method](request(`Bearer ${expected ?? ''}`));
      assert.equal(response.status, 401);
      assert.deepEqual(await response.json(), {error: 'Unauthorized'});
      assertNoWork(state);
    });
  }
}

for (const header of [null, '', 'Bearer wrong-fixture', `bearer ${SECRET}`, SECRET, `Bearer ${SECRET}extra`, `Bearer ${SECRET} `]) {
  test(`configured scheduler rejects mismatched authorization ${JSON.stringify(header)}`, async () => {
    const {state, methods, request} = fixture();
    assert.equal((await methods.GET(request(header))).status, 401);
    assertNoWork(state);
  });
}

test('valid exact existing scheduler credential preserves all three synthetic email paths', async () => {
  const {state, methods, request} = fixture(SECRET, {authorizedWork: true});
  const response = await methods.GET(request(`Bearer ${SECRET}`));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {partner_waiting: 1, both_done: 2, idle_7d: 1, errors: []});
  assert.equal(state.credentialClients, 1);
  assert.deepEqual(state.emails.map(x => x.kind), ['partner_waiting', 'both_done', 'both_done', 'idle']);
  assert.equal(state.comparisons, 1);
  assert.equal(state.emails.some(x => x.userId === 'fixture-user-active'), false);
  assert.equal(state.emails.find(x => x.kind === 'idle').contextId, `idle:${Math.floor(NOW / (1000 * 60 * 60 * 24 * 7))}`);
});

for (const reason of ['already_sent', 'opted_out']) {
  test(`valid scheduler preserves ${reason} outcome without reporting an email error`, async () => {
    const {methods, request} = fixture(SECRET, {authorizedWork: true, emailOutcome: {ok: false, reason}});
    const response = await methods.GET(request(`Bearer ${SECRET}`));
    assert.deepEqual(await response.json(), {partner_waiting: 0, both_done: 0, idle_7d: 0, errors: []});
  });
}

test('nonblank configured value is compared exactly without silently trimming its credential bytes', async () => {
  const configured = ` ${SECRET} `;
  const denied = fixture(configured);
  assert.equal((await denied.methods.GET(denied.request(`Bearer ${SECRET}`))).status, 401);
  assertNoWork(denied.state);
  const accepted = fixture(configured, {authorizedWork: true});
  assert.equal((await accepted.methods.GET(accepted.request(`Bearer ${configured}`))).status, 200);
});

test('framework automatic HEAD reuses the guarded GET; OPTIONS and unsupported methods do no work', async () => {
  const {state, exports, methods, request} = fixture();
  assert.deepEqual(Object.keys(exports), ['GET']);
  assert.equal(methods.HEAD, exports.GET);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal((await methods[method](new Proxy({}, {get: forbidden}))).status, 405);
  }
  const options = await methods.OPTIONS(new Proxy({}, {get: forbidden}));
  assert.equal(options.status, 204);
  assert.equal(options.headers.get('allow'), 'GET, HEAD, OPTIONS');
  assertNoWork(state);
});
