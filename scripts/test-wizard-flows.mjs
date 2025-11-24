// scripts/test-wizard-flows.mjs
// Simple end-to-end tester for the Landlord Heaven wizard API.
// It runs a couple of flows with dummy answers and prints a summary.

const BASE_URL = process.env.WIZARD_BASE_URL || 'http://localhost:3000';

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let json;
  try {
    json = await res.json();
  } catch (e) {
    console.error(`❌ Failed to parse JSON from ${path}`, e);
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  if (!res.ok) {
    console.error(`❌ ${path} responded with error:`, json);
    throw new Error(`${path} -> HTTP ${res.status}`);
  }

  return json;
}

// Very dumb answer generator – just to exercise the API.
// We can refine based on what the server expects once we see the output.
function buildDummyAnswer(question) {
  const qType = question.type || question.input_type || 'string';

  if (qType === 'number' || qType === 'integer') return 1000;
  if (qType === 'boolean') return true;
  if (qType === 'date') return '2024-01-01';
  if (qType === 'money') return 500;
  if (qType === 'choice' && Array.isArray(question.options) && question.options.length > 0) {
    return question.options[0].value ?? question.options[0];
  }
  if (qType === 'multi_choice' && Array.isArray(question.options) && question.options.length > 0) {
    const first = question.options[0].value ?? question.options[0];
    return [first];
  }

  // Default: text/string answer
  return 'Test answer from automated script';
}

async function runFlow({ product, jurisdiction, maxQuestions = 50 }) {
  console.log(`\n==============================`);
  console.log(`▶️  Starting flow: ${product} / ${jurisdiction}`);
  console.log(`==============================`);

  // 1. Start wizard
  const startRes = await apiPost('/api/wizard/start', {
    product,
    jurisdiction,
  });

  const caseId = startRes.case_id;
  let nextQuestion = startRes.next_question ?? startRes.nextQuestion ?? null;
  let progress = startRes.progress ?? 0;
  let isComplete = startRes.is_complete ?? false;

  console.log(`✅ Started case: ${caseId}`);
  console.log(`   First question:`, nextQuestion ? nextQuestion.id || nextQuestion.question : 'NONE');

  let questionsAnswered = 0;

  // 2. Loop answer -> next-question
  while (!isComplete && nextQuestion && questionsAnswered < maxQuestions) {
    const questionId = nextQuestion.id || nextQuestion.question_id || `q_${questionsAnswered}`;
    const dummyAnswer = buildDummyAnswer(nextQuestion);

    console.log(`\n📝 Answering question #${questionsAnswered + 1}`);
    console.log(`   ID:       ${questionId}`);
    console.log(`   Prompt:   ${nextQuestion.question || '(no question text)'}`);
    console.log(`   Type:     ${nextQuestion.type || nextQuestion.input_type}`);
    console.log(`   Answer:  `, dummyAnswer);

    const answerRes = await apiPost('/api/wizard/answer', {
      case_id: caseId,
      question_id: questionId,
      answer: dummyAnswer,
    });

    questionsAnswered++;
    progress = answerRes.progress ?? progress;
    isComplete = answerRes.is_complete ?? isComplete;
    nextQuestion =
      answerRes.next_question ?? answerRes.nextQuestion ?? null;

    console.log(`   ➕ Saved. progress=${progress}, complete=${isComplete}`);
    console.log(`   Ask Heaven suggested wording (truncated):`,
      answerRes.suggested_wording
        ? String(answerRes.suggested_wording).slice(0, 80) + '…'
        : '(none)'
    );

    if (!nextQuestion && !isComplete) {
      // Ask the dedicated next-question endpoint as a fallback
      console.log(`   ⚠️ No next_question in /answer response, calling /next-question directly…`);
      const nextRes = await apiPost('/api/wizard/next-question', {
        case_id: caseId,
      });
      nextQuestion = nextRes.next_question ?? nextRes.nextQuestion ?? null;
      isComplete = nextRes.is_complete ?? isComplete;
      progress = nextRes.progress ?? progress;
      console.log(`   /next-question returned complete=${isComplete}, progress=${progress}`);
    }
  }

  if (!isComplete) {
    console.log(
      `⚠️ Flow stopped after ${questionsAnswered} questions (max=${maxQuestions}) ` +
        `but is_complete=false.`
    );
  } else {
    console.log(`✅ Wizard completed after ${questionsAnswered} questions. progress=${progress}`);
  }

  // 3. Call analyze endpoint if it exists
  let analyzeRes = null;
  try {
    analyzeRes = await apiPost('/api/wizard/analyze', { case_id: caseId });
    console.log(`\n📊 Analyze result for case ${caseId}:`);
    console.log(`   recommended_route:`, analyzeRes.recommended_route);
    console.log(`   case_strength_score:`, analyzeRes.case_strength_score);
    console.log(`   red_flags:`, analyzeRes.red_flags);
    console.log(`   compliance_issues:`, analyzeRes.compliance_issues);
    console.log(
      `   preview_documents:`,
      (analyzeRes.preview_documents || analyzeRes.previewDocs || []).map((d) => ({
        id: d.id,
        type: d.document_type || d.type,
        title: d.document_title || d.title,
      }))
    );
  } catch (err) {
    console.log(`❌ /api/wizard/analyze failed for case ${caseId}:`, err.message);
  }

  return {
    caseId,
    questionsAnswered,
    progress,
    isComplete,
    analyzeRes,
  };
}

async function main() {
  console.log(`Using BASE_URL = ${BASE_URL}`);
  console.log(`Make sure:`);
  console.log(`- dev server is running (e.g. http://localhost:3000)`);
  console.log(`- Supabase env vars and OpenAI key are configured\n`);

  const results = [];

  // You can comment/uncomment flows as needed.

  // 1) England & Wales - notice_only
  try {
    results.push(
      await runFlow({ product: 'notice_only', jurisdiction: 'england-wales', maxQuestions: 60 })
    );
  } catch (err) {
    console.error(`❌ E&W notice_only flow failed:`, err.message);
  }

  // 2) England & Wales - complete_pack
  try {
    results.push(
      await runFlow({ product: 'complete_pack', jurisdiction: 'england-wales', maxQuestions: 80 })
    );
  } catch (err) {
    console.error(`❌ E&W complete_pack flow failed:`, err.message);
  }

  // 3) Scotland - notice_only (Notice to Leave)
  try {
    results.push(
      await runFlow({ product: 'notice_only', jurisdiction: 'scotland', maxQuestions: 80 })
    );
  } catch (err) {
    console.error(`❌ Scotland notice_only flow failed:`, err.message);
  }

  console.log(`\n==============================`);
  console.log(`📦 Summary of flows:`);
  console.log(`==============================`);
  for (const r of results) {
    console.log(
      `- case ${r.caseId}: answered=${r.questionsAnswered}, progress=${r.progress}, complete=${r.isComplete}`
    );
  }
}

main().catch((err) => {
  console.error('Fatal error in test script:', err);
  process.exit(1);
});
