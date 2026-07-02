import { readFileSync } from 'node:fs';

const files = [
  'src/lib/gemini.ts',
  'src/lib/feedbackAnalysis.ts',
  'src/lib/feedbackGrowthAnalytics.ts',
  'src/app/api/ai/validate-key/route.ts',
  'src/app/api/ai/learner-analysis/route.ts',
  'src/app/api/ai/instructor-analysis/route.ts',
  'src/app/api/ai/quality-monitoring/route.ts',
  'src/app/api/ai/analyze-student-responses/route.ts',
  'src/app/api/ai/analyze-comprehensive/route.ts',
];

const expectedModel = 'gemini-3.1-flash-lite';
const helperPath = 'src/lib/geminiModel.ts';

let ok = true;
const fail = (message) => {
  ok = false;
  console.error(message);
};

let helper = '';
try {
  helper = readFileSync(helperPath, 'utf8');
} catch {
  fail(`${helperPath} is missing`);
}

if (helper && !helper.includes(`DEFAULT_GEMINI_MODEL = '${expectedModel}'`)) {
  fail(`${helperPath} must default to ${expectedModel}`);
}
if (helper && !helper.includes('NEXT_PUBLIC_GEMINI_MODEL')) {
  fail(`${helperPath} must allow NEXT_PUBLIC_GEMINI_MODEL override`);
}
if (helper && !helper.includes('getGeminiModel')) {
  fail(`${helperPath} must expose getGeminiModel`);
}

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (text.includes("model: 'gemini-2.5-flash'") || text.includes('model: "gemini-2.5-flash"')) {
    fail(`${file} still hardcodes gemini-2.5-flash`);
  }
}

if (!ok) process.exit(1);
console.log(`Gemini model config defaults to ${expectedModel} with env override; no legacy hardcoded call sites remain.`);
