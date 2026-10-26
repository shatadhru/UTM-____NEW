#!/usr/bin/env node
const readline = require('readline');

const ENDPOINT = process.env.COOLIFY_ENDPOINT || 'http://31.97.190.84:8000/mcp';
const TOKEN = process.env.COOLIFY_TOKEN || '3|mzkMWHKasqt0ufAakKKdG6kE6tKStNeNkI2Z8DIo37187548';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }

    const hasId = Object.prototype.hasOwnProperty.call(parsed, 'id');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: trimmed,
      });

      if (!hasId) continue;

      if (!response.ok) {
        const errText = await response.text();
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: parsed.id,
            error: {
              code: -32603,
              message: `Coolify HTTP error ${response.status}: ${errText || response.statusText}`,
            },
          }) + '\n'
        );
        continue;
      }

      const data = await response.json();
      process.stdout.write(JSON.stringify(data) + '\n');
    } catch (err) {
      if (hasId) {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: parsed.id,
            error: { code: -32603, message: err.message },
          }) + '\n'
        );
      }
    }
  }
}

main().catch((err) => {
  console.error('Coolify MCP Bridge Fatal:', err);
  process.exit(1);
});
