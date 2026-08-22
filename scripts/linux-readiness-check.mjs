#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const REQUIRED_NODE_MAJOR = 24;
const REQUIRED_PNPM = '10.28.2';
const BASE_URL = process.env.LINUX_READINESS_BASE_URL || 'http://localhost:3000';
const SUMMARY_PATH = process.env.LINUX_READINESS_SUMMARY_PATH || 'artifacts/linux-readiness-summary.md';
const SUMMARY_JSON_PATH =
  process.env.LINUX_READINESS_SUMMARY_JSON_PATH || 'artifacts/linux-readiness-summary.json';

const results = [];

function record(name, pass, details) {
  results.push({ name, pass, details });
  const marker = pass ? 'PASS' : 'FAIL';
  console.log(`[${marker}] ${name} - ${details}`);
}

function writeSummaryFile() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  const total = results.length;
  const lines = [
    '# Linux Readiness Summary',
    '',
    `- Base URL: ${BASE_URL}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    '',
    '## Check Results',
    '',
    ...results.map((r) => `- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} — ${r.details}`),
    '',
  ];

  mkdirSync(dirname(SUMMARY_PATH), { recursive: true });
  writeFileSync(SUMMARY_PATH, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Summary written to ${SUMMARY_PATH}`);

  const payload = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    total,
    passed,
    failed,
    checks: results.map((r) => ({
      name: r.name,
      pass: r.pass,
      details: r.details,
    })),
  };
  mkdirSync(dirname(SUMMARY_JSON_PATH), { recursive: true });
  writeFileSync(SUMMARY_JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`JSON summary written to ${SUMMARY_JSON_PATH}`);
}

function runSyncCheck(name, command, args, passWhen) {
  const run = spawnSync(command, args, { encoding: 'utf8', shell: false });
  if (run.error) {
    record(name, false, run.error.message);
    return false;
  }
  const output = `${run.stdout || ''}${run.stderr || ''}`.trim();
  const pass = passWhen(run.status ?? 1, output);
  record(name, pass, output || `exit ${run.status ?? 'unknown'}`);
  return pass;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // keep waiting
    }
    await sleep(1000);
  }
  return false;
}

async function startServer() {
  const proc = spawn('pnpm', ['run', 'start'], {
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  proc.stdout?.on('data', (chunk) => {
    const text = String(chunk);
    if (text.toLowerCase().includes('error')) process.stdout.write(text);
  });
  proc.stderr?.on('data', (chunk) => process.stderr.write(String(chunk)));
  return proc;
}

function stopProcess(proc) {
  if (proc && !proc.killed) {
    proc.kill('SIGTERM');
  }
}

async function checkRoute(name, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const hasHtml = text.includes('<html') || text.includes('<!DOCTYPE html');
    const pass = response.ok && hasHtml;
    record(name, pass, `${response.status} ${response.statusText}`);
    return pass;
  } catch (error) {
    record(name, false, error.message);
    return false;
  }
}

async function main() {
  if (process.platform !== 'linux') {
    console.log('This readiness check is designed for Linux hosts.');
  }

  runSyncCheck('1) Node version is 24.x', 'node', ['-v'], (_, output) => {
    return output.startsWith(`v${REQUIRED_NODE_MAJOR}.`);
  });

  runSyncCheck('2) pnpm version is 10.28.2', 'pnpm', ['-v'], (_, output) => {
    return output === REQUIRED_PNPM;
  });

  runSyncCheck('3) Dependency install', 'pnpm', ['install', '--frozen-lockfile'], (status) => status === 0);
  runSyncCheck('4) Production build', 'pnpm', ['run', 'build'], (status) => status === 0);

  const serverProc = await startServer();
  const ready = await waitForUrl(BASE_URL);
  record('5) Production server starts', ready, ready ? BASE_URL : `unreachable: ${BASE_URL}`);

  if (ready) {
    await checkRoute('6) /signin renders HTML', '/signin');
    await checkRoute('7) /profile renders HTML', '/profile');
    await checkRoute('8) Mobile-width homepage render', '/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Mobile' },
    });
  } else {
    record('6) /signin renders HTML', false, 'server not reachable');
    record('7) /profile renders HTML', false, 'server not reachable');
    record('8) Mobile-width homepage render', false, 'server not reachable');
  }

  stopProcess(serverProc);

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log('\nLinux readiness summary');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  writeSummaryFile();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`Readiness check crashed: ${error.message}`);
  process.exit(1);
});
