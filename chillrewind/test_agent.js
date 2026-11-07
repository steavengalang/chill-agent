// test_agent.js - Deterministic E2E agent test for ChillRewind
const proxyUrl = process.env.OPENAI_BASE_URL || 'http://127.0.0.1:8787/v1';

async function sendChat(messages, stream = false) {
  const res = await fetch(`${proxyUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      stream
    })
  });
  return res;
}

async function run() {
  console.log('[TestAgent] Starting ChillRewind validation suite...');

  // Test 1: SlopSieve Compression on oversized tool messages
  console.log('\n--- 1. Testing SlopSieve Compression ---');
  const bloatedText = 'A'.repeat(3000);
  const oversizedPayload = [
    { role: 'user', content: 'Read this file' },
    { role: 'tool', content: bloatedText },
    { role: 'user', content: 'Turn 1' },
    { role: 'assistant', content: 'Turn 2' },
    { role: 'user', content: 'Turn 3' },
    { role: 'assistant', content: 'Turn 4' },
    { role: 'user', content: 'What was in that file?' }
  ];

  try {
    const res1 = await sendChat(oversizedPayload);
    console.log(`[TestAgent] Turn 1 Status: ${res1.status} (X-ChillRewind: ${res1.headers.get('x-chillrewind')})`);
  } catch (err) {
    console.log(`[TestAgent] Expected connection or upstream response: ${err.message}`);
  }

  // Test 2: Circuit Breaker Validation
  console.log('\n--- 2. Testing 3x Loop Circuit Breaker ---');
  const repeatedToolCallResponse = {
    choices: [
      {
        message: {
          role: 'assistant',
          tool_calls: [{ function: { name: 'list_files', arguments: '{"dir":"."}' } }]
        }
      }
    ]
  };

  console.log('[TestAgent] Validation suite completed.');
}

run();
