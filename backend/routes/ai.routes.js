const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// Curated post idea templates per technology/skill
const IDEA_TEMPLATES = {
  javascript: [
    'Just discovered {skill} closures behave differently in loops — here\'s the gotcha and how to fix it:',
    'I rewrote a 50-line callback hell into 10 lines using async/await. Here\'s the before & after:',
    'Hidden {skill} array method most devs don\'t use — saved me 20 lines of code today:',
    'Event loop confusion? I built a simple mental model that finally made it click:',
    'Debounce vs Throttle in {skill}: when to use each (with live examples):',
  ],
  typescript: [
    'TypeScript utility type I wish I learned sooner — {skill} tip:',
    'Stopped writing `any` in {skill}. Here\'s what I use instead:',
    'Generic constraints in {skill} demystified — real-world example from my codebase:',
    'How I use discriminated unions in {skill} to eliminate impossible states:',
    'Template literal types in {skill}: the trick that blew my mind this week:',
  ],
  python: [
    'One-liner I use every day in {skill} — most beginners reach for a loop instead:',
    'Context managers in {skill}: beyond `with open()` — practical patterns I use:',
    'Stopped writing nested list comprehensions in {skill}. Here\'s the cleaner way:',
    'Dataclasses vs Pydantic in {skill}: when I use each and why:',
    'Async in {skill} is simpler than you think — here\'s a minimal working example:',
  ],
  react: [
    'Custom hook I extracted this week — turned 40 lines of component logic into a reusable 10-liner:',
    '{skill} re-render deep dive: why my component re-rendered 8 times and how I fixed it:',
    'useEffect patterns I\'ve stopped using in {skill} (and what I do instead):',
    'Built a compound component in {skill} today. Cleaner than prop drilling, simpler than Context:',
    'The {skill} pattern that made my forms 3x easier to maintain:',
  ],
  node: [
    'Middleware pattern in {skill}/Express that saved my codebase from duplication:',
    'Memory leak I found in {skill} production app — how I detected and fixed it:',
    'Streaming large files in {skill} — don\'t load them into memory:',
    'Worker threads in {skill}: when they\'re actually worth the complexity:',
    'How I structure {skill} projects at scale — folder layout that grew with my team:',
  ],
  'node.js': [
    'Middleware pattern in {skill}/Express that saved my codebase from duplication:',
    'How I structure {skill} projects at scale — folder layout that grew with my team:',
    'Memory leak I found in {skill} production — detected with clinic.js:',
  ],
  mongodb: [
    'Aggregation pipeline in {skill} that replaced 3 separate queries — here\'s the trick:',
    '{skill} indexing mistake that slowed my queries by 10x:',
    'When I use $lookup vs embedding in {skill}: my decision framework:',
    'Change streams in {skill}: real-time data without polling:',
  ],
  docker: [
    'Multi-stage {skill} build that cut my image size from 1.2GB to 180MB:',
    '{skill} networking explained simply — host, bridge, overlay:',
    'Health checks in {skill}: don\'t ship containers without them:',
    '{skill} compose patterns for local development I use on every project:',
  ],
  kubernetes: [
    'Resource requests vs limits in {skill}: the mistake that caused my pod to OOMKill:',
    'Rolling updates in {skill}: zero-downtime deploys without the complexity:',
    '{skill} readiness vs liveness probes — when each one fires and why it matters:',
  ],
  rust: [
    'The {skill} borrow checker finally clicked for me — here\'s the mental model:',
    'Lifetimes in {skill} demystified with a real example from my weekend project:',
    'Why I rewrote a Python script in {skill} and the performance difference was wild:',
    '{skill} error handling with `?` operator: cleaner than try/catch in many ways:',
  ],
  go: [
    'Goroutines + channels in {skill}: built a concurrent scraper with 20 lines:',
    '{skill} interface design that made my code testable without a framework:',
    'Error wrapping in {skill}: the pattern I use so stack traces are actually useful:',
    '{skill} vs other languages for CLIs — why I keep reaching for it:',
  ],
  aws: [
    '{skill} cost optimization I applied last week — cut the bill by 30%:',
    'Lambda cold starts in {skill}: how bad are they really? I benchmarked it:',
    '{skill} IAM: least-privilege principle in practice — how I set it up:',
    'S3 + CloudFront for static sites on {skill}: setup guide that actually works:',
  ],
  sql: [
    '{skill} window functions I wish I learned 2 years sooner:',
    'N+1 query problem in {skill}: how I spotted it and fixed it in 5 minutes:',
    '{skill} EXPLAIN ANALYZE: the first thing I run when a query is slow:',
    'Common Table Expressions in {skill}: cleaner recursive queries:',
  ],
  git: [
    '{skill} rebase vs merge: my team settled on a workflow after 6 months of debate:',
    '{skill} bisect saved me 2 hours today — here\'s how it works:',
    'Hooks in {skill} I run on every project to catch issues before they land in CI:',
  ],
  general: [
    'Debugging session that taught me more than any tutorial:',
    'Code review feedback that changed how I write code:',
    'Open source PR merged this week — here\'s what I contributed:',
    'Interview question I got wrong and what I learned:',
    'Side project update: what I built, what broke, what I\'d do differently:',
    'Technical debt I finally paid off — here\'s what it unlocked:',
    'Pair programming session insight — my rubber duck moment this week:',
    'System design decision I second-guessed but turned out right:',
  ],
};

function getIdeasForSkills(skills) {
  const ideas = new Set();

  // Add skill-specific ideas
  skills.forEach((skill) => {
    const key = skill.toLowerCase().trim();
    const templates = IDEA_TEMPLATES[key] || IDEA_TEMPLATES[key.split('.')[0]];
    if (templates) {
      // Pick 2 random templates from this skill
      const shuffled = templates.sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach((tpl) => {
        ideas.add(tpl.replace(/\{skill\}/g, skill));
      });
    }
  });

  // Always pad with general ideas to hit ~6 total
  const general = [...IDEA_TEMPLATES.general].sort(() => 0.5 - Math.random());
  for (const idea of general) {
    if (ideas.size >= 6) break;
    ideas.add(idea);
  }

  return [...ideas].slice(0, 6);
}

// @desc   Generate AI post ideas based on user's skills
// @route  GET /api/v1/ai/post-ideas
// @access Private
router.get('/post-ideas', protect, asyncHandler(async (req, res) => {
  const user = req.user;
  const skills = (user.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean);

  const ideas = getIdeasForSkills(skills.length > 0 ? skills : ['javascript']);
  return ApiResponse.success(res, { ideas });
}));

module.exports = router;
