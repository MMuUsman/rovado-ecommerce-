/**
 * Automated functional backend test runner
 * Tests /api/health and /api/chat with multiple queries
 */

const BASE_URL = process.env.TEST_API_URL || "http://localhost:4000";

async function runTests() {
  console.log(`\n🧪 Testing Rovado Backend at ${BASE_URL}...\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.status === 200) {
      const data = await res.json();
      console.log(`✅ Health Check PASSED: status=${data.status}, service=${data.service}`);
      passed++;
    } else {
      console.error(`❌ Health Check FAILED: HTTP ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Health Check Connection Error:`, err.message);
    failed++;
  }

  // Test 2: AI Chatbot - Shipping Policy Query
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is your shipping policy?" }),
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data.reply && data.reply.length > 10) {
        console.log(`✅ Chatbot (Shipping) PASSED [Source: ${data.source}]`);
        console.log(`   Reply Preview: "${data.reply.slice(0, 80)}..."`);
        passed++;
      } else {
        console.error(`❌ Chatbot (Shipping) returned empty reply:`, data);
        failed++;
      }
    } else {
      console.error(`❌ Chatbot (Shipping) FAILED: HTTP ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Chatbot (Shipping) Connection Error:`, err.message);
    failed++;
  }

  // Test 3: AI Chatbot - Laptop Recommendation Query
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Can you recommend a high-end laptop?" }),
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data.reply && data.reply.length > 10) {
        console.log(`✅ Chatbot (Laptops) PASSED [Source: ${data.source}]`);
        console.log(`   Reply Preview: "${data.reply.slice(0, 80)}..."`);
        passed++;
      } else {
        console.error(`❌ Chatbot (Laptops) returned empty reply:`, data);
        failed++;
      }
    } else {
      console.error(`❌ Chatbot (Laptops) FAILED: HTTP ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Chatbot (Laptops) Connection Error:`, err.message);
    failed++;
  }

  // Test 4: AI Chatbot - Empty query handling
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });

    if (res.status === 400) {
      console.log(`✅ Chatbot (Empty Query Validation) PASSED: correctly rejected with 400`);
      passed++;
    } else {
      console.error(`❌ Chatbot (Empty Query) expected 400, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Chatbot Validation Error:`, err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Tests Finished: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
