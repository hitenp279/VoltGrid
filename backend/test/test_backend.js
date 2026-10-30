const http = require('http');

const PORT = 8000;

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runBackendTests() {
  console.log('🧪 Starting VoltGrid Backend Automated Verification Suite...');
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Health check
    const health = await request('/');
    if (health.status === 200 && health.body.status) {
      console.log('  ✓ Test 1 Passed: Server Health Check GET /');
      passed++;
    } else {
      console.error('  ❌ Test 1 Failed:', health);
      failed++;
    }

    // Test 2: Telemetry
    const telemetry = await request('/api/telemetry');
    if (telemetry.status === 200 && typeof telemetry.body.voltage === 'number') {
      console.log(`  ✓ Test 2 Passed: GET /api/telemetry (Voltage: ${telemetry.body.voltage}V, Current: ${telemetry.body.current}A, Action: ${telemetry.body.action})`);
      passed++;
    } else {
      console.error('  ❌ Test 2 Failed:', telemetry);
      failed++;
    }

    // Test 3: Stations list
    const stations = await request('/api/stations');
    if (stations.status === 200 && Array.isArray(stations.body) && stations.body.length >= 4) {
      console.log(`  ✓ Test 3 Passed: GET /api/stations (${stations.body.length} station hubs returned)`);
      passed++;
    } else {
      console.error('  ❌ Test 3 Failed:', stations);
      failed++;
    }

    // Test 4: EV Priority Queue
    const queue = await request('/api/ev-queue');
    if (queue.status === 200 && Array.isArray(queue.body)) {
      console.log(`  ✓ Test 4 Passed: GET /api/ev-queue (${queue.body.length} queued vehicles)`);
      passed++;
    } else {
      console.error('  ❌ Test 4 Failed:', queue);
      failed++;
    }

    // Test 5: Session History
    const history = await request('/api/sessions/history');
    if (history.status === 200 && Array.isArray(history.body)) {
      console.log(`  ✓ Test 5 Passed: GET /api/sessions/history (${history.body.length} records)`);
      passed++;
    } else {
      console.error('  ❌ Test 5 Failed:', history);
      failed++;
    }

    // Test 6: Toggle Grid Stress
    const stress = await request('/api/telemetry/stress', 'POST', { enabled: true });
    if (stress.status === 200 && stress.body.isStressSimulated === true) {
      console.log('  ✓ Test 6 Passed: POST /api/telemetry/stress (Overload stress state activated)');
      passed++;
    } else {
      console.error('  ❌ Test 6 Failed:', stress);
      failed++;
    }

    // Test 7: Reset Grid Stress
    const resetStress = await request('/api/telemetry/stress', 'POST', { enabled: false });
    if (resetStress.status === 200 && resetStress.body.isStressSimulated === false) {
      console.log('  ✓ Test 7 Passed: POST /api/telemetry/stress (Stress state deactivated)');
      passed++;
    } else {
      console.error('  ❌ Test 7 Failed:', resetStress);
      failed++;
    }

    // Test 8: Post Event
    const eventRes = await request('/api/events', 'POST', { message: 'Automated test verification event', type: 'SUCCESS', source: 'TestRunner' });
    if (eventRes.status === 201 && eventRes.body.success) {
      console.log('  ✓ Test 8 Passed: POST /api/events (SCADA log appended)');
      passed++;
    } else {
      console.error('  ❌ Test 8 Failed:', eventRes);
      failed++;
    }

    console.log(`====================================================`);
    console.log(`🎉 BACKEND VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED 🎉`);
    console.log(`====================================================`);

    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

// Give server time to boot if run standalone
setTimeout(runBackendTests, 1500);
