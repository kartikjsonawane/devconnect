/**
 * TEMPORARY one-shot seed route — remove after seeding Atlas.
 * POST /api/v1/admin/seed  { "secret": "devconnect-seed-2026" }
 * Optimized: uses bulkWrite / pre-calculated counts — only ~8 DB operations total.
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SEED_SECRET = 'devconnect-seed-2026';

const USERS_DATA = [
  { username: 'alexchen_dev', email: 'alex@devconnect.dev', name: 'Alex Chen', headline: 'Senior Full-Stack Engineer @ Stripe', bio: 'Building payment infrastructure at scale. Ex-Google. I write about distributed systems and TypeScript.', location: 'San Francisco, CA', website: 'https://alexchen.dev', githubUsername: 'alexchen', skills: ['typescript','react','node.js','postgresql','kubernetes','go'], yearsOfExperience: 7, openToWork: false },
  { username: 'priya_builds', email: 'priya@devconnect.dev', name: 'Priya Sharma', headline: 'Frontend Engineer | React & Design Systems', bio: 'Obsessed with component architecture and accessibility. Building design systems that scale.', location: 'Austin, TX', website: 'https://priyasharma.io', githubUsername: 'priyabuilds', skills: ['react','typescript','css','figma','storybook','accessibility'], yearsOfExperience: 4, openToWork: false },
  { username: 'ruslan_ml', email: 'ruslan@devconnect.dev', name: 'Ruslan Petrov', headline: 'ML Engineer | PyTorch · Transformers · LLMs', bio: 'Training models during the day, reading papers at night.', location: 'Berlin, Germany', githubUsername: 'ruslanml', skills: ['python','pytorch','machine learning','cuda','docker','fastapi'], yearsOfExperience: 5, openToWork: false },
  { username: 'dev_omotayo', email: 'omotayo@devconnect.dev', name: 'Omotayo Adeyemi', headline: 'Backend Engineer | Go · Distributed Systems', bio: 'Nigerian 🇳🇬. Love building fast, reliable APIs.', location: 'Lagos, Nigeria', website: 'https://omotayo.dev', githubUsername: 'devomotayo', skills: ['go','rust','postgresql','redis','kafka','docker'], yearsOfExperience: 6, openToWork: true },
  { username: 'sarah_devops', email: 'sarah@devconnect.dev', name: 'Sarah Kim', headline: 'DevOps/Platform Engineer | K8s · Terraform · AWS', bio: 'Making deploys boring (in a good way). I love IaC, observability, and incident postmortems.', location: 'Seattle, WA', githubUsername: 'sarahdevops', skills: ['kubernetes','terraform','aws','docker','python','bash'], yearsOfExperience: 8, openToWork: false },
  { username: 'marcos_oss', email: 'marcos@devconnect.dev', name: 'Marcos Oliveira', headline: 'Open Source Maintainer · Vue · Vite core contributor', bio: 'Brazilian 🇧🇷 living in Lisbon. Day job: engineer. Night job: merging PRs.', location: 'Lisbon, Portugal', website: 'https://marcosoliveira.dev', githubUsername: 'marcososs', skills: ['javascript','typescript','vue','vite','node.js','rollup'], yearsOfExperience: 9, openToWork: false },
  { username: 'yuki_security', email: 'yuki@devconnect.dev', name: 'Yuki Tanaka', headline: 'Application Security Engineer | Bug Bounty Hunter', bio: "Finding vulns in prod so you don't have to. OSCP certified. Top 50 HackerOne.", location: 'Tokyo, Japan', githubUsername: 'yukisec', skills: ['python','rust','security','cryptography','linux','ctf'], yearsOfExperience: 5, openToWork: false },
  { username: 'nina_indie', email: 'nina@devconnect.dev', name: 'Nina Kozlov', headline: 'Indie Hacker | Built 3 SaaS products | $12k MRR', bio: 'Ex-corporate, now indie. Love talking about product, marketing, and the maker lifestyle.', location: 'Amsterdam, Netherlands', website: 'https://ninakozlov.com', githubUsername: 'ninaindie', skills: ['react','node.js','postgresql','stripe','seo','product'], yearsOfExperience: 6, openToWork: false },
];

// follow graph [follower_idx, following_idx]
const FOLLOWS = [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[0,1],[2,1],[3,1],[5,1],[7,1],[0,2],[1,2],[3,2],[6,2],[0,3],[1,3],[2,3],[4,3],[5,3],[0,4],[1,4],[3,4],[6,4],[0,5],[1,5],[3,5],[7,5],[0,6],[3,6],[4,6],[0,7],[1,7],[3,7],[5,7]];

const POSTS_DATA = [
  { ai: 0, content: 'After 7 years of TypeScript, the feature I reach for most is discriminated unions — not generics, not decorators.\n\nThey make impossible states unrepresentable at compile time:', codeSnippet: { language: 'typescript', code: "type Result<T> =\n  | { ok: true;  value: T }\n  | { ok: false; error: Error };\n\nfunction divide(a: number, b: number): Result<number> {\n  if (b === 0) return { ok: false, error: new Error('Division by zero') };\n  return { ok: true, value: a / b };\n}" }, tags: ['typescript','patterns','tips'], likes: [1,2,3,4,5,6,7] },
  { ai: 0, content: 'Hot take: most "microservices" I see are actually distributed monoliths. All the operational complexity with none of the independence benefits — because services are tightly coupled at the data layer.\n\nReal question: can service A deploy without redeploying service B?', tags: ['architecture','microservices','engineering'], likes: [3,4,5] },
  { ai: 0, content: 'We migrated 3M lines of JavaScript to TypeScript over 18 months.\n\n1. Start with `allowJs: true` — don\'t big-bang it\n2. `noImplicitAny` early\n3. Codemods handle 80% of mechanical work\n4. Hardest part: untyped third-party libs\n5. ROI is real — runtime errors dropped ~40%', tags: ['typescript','migration','lessons'], likes: [1,3,6] },
  { ai: 1, content: 'Design systems lesson learned the hard way: never export implementation details.\n\nWe exported `StyledButton` for "flexibility." Six months later: 47 places using internal APIs we couldn\'t change.\n\nRule now: if it\'s not in the docs, it\'s not a public API.', tags: ['design-systems','react','frontend'], likes: [0,2,5,6] },
  { ai: 1, content: 'Most underrated CSS property in 2024: `container-type`. Combined with container queries, components become responsive to their own available space — not the viewport.', codeSnippet: { language: 'css', code: '.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 400px) {\n  .card { grid-template-columns: auto 1fr; }\n}' }, tags: ['css','frontend','responsive'], likes: [0,2,3,6,7] },
  { ai: 1, content: 'Accessibility is not a feature you add at the end. It\'s a quality bar.\n\nWe added axe-core to CI, blocking merges on violations. Week 1: 234 violations. Three months later: 0.\n\nMake CI care so you don\'t have to.', tags: ['accessibility','a11y','frontend','devops'], likes: [0,2,3,6] },
  { ai: 2, content: 'FP32 → INT8 quantization reduces model size 4x. But it\'s not just dividing weights. Here\'s what actually happens:', codeSnippet: { language: 'python', code: 'def quantize(x, bits=8):\n    qmin, qmax = -(2**(bits-1)), (2**(bits-1))-1\n    scale = (x.max()-x.min()) / (qmax-qmin)\n    zero_point = qmin - x.min()/scale\n    return torch.clamp(torch.round(x/scale + zero_point), qmin, qmax).to(torch.int8), scale, zero_point' }, tags: ['ml','python','llm','quantization'], likes: [3,4,7] },
  { ai: 2, content: 'Read the Mamba paper. State Space Models are genuinely interesting — linear time complexity vs transformer\'s quadratic, competitive quality on many benchmarks.\n\nNot replacing transformers tomorrow. But for 100k+ token contexts, the compute savings are real.', tags: ['ml','research','llm'], likes: [0,1,3,5] },
  { ai: 3, content: 'Go\'s `sync.Pool` is the most underused stdlib feature. It\'s a free-list that slashes GC pressure in high-throughput services.\n\nWe added it to our HTTP handler buffer allocation: cut allocations by 80%:', codeSnippet: { language: 'go', code: 'var bufPool = sync.Pool{\n    New: func() any {\n        b := make([]byte, 0, 4096)\n        return &b\n    },\n}\n\nfunc handle(w http.ResponseWriter, r *http.Request) {\n    bp := bufPool.Get().(*[]byte)\n    buf := (*bp)[:0]\n    defer bufPool.Put(bp)\n    w.Write(append(buf, "ok"...))\n}' }, tags: ['go','performance','backend'], likes: [1,2,4,5,7] },
  { ai: 3, content: '3 years of Kafka in prod. Things nobody tells you:\n\n- Consumer lag > throughput as your key metric\n- Exactly-once semantics cost ~15-20% latency\n- Replication factor 3 is the minimum for sleep-able production\n- Dead letter queues save careers', tags: ['kafka','backend','distributed-systems'], likes: [0,2,1,5] },
  { ai: 4, content: 'K8s resource requests/limits are the most misunderstood concept. Wrong settings = random OOMKills.', codeSnippet: { language: 'yaml', code: 'resources:\n  requests:\n    memory: "128Mi"  # P50 usage — used for scheduling\n    cpu: "100m"\n  limits:\n    memory: "128Mi"  # Exceed this = OOMKilled\n    cpu: "1000m"     # Exceed this = throttled (not killed)' }, tags: ['kubernetes','devops','infrastructure'], likes: [1,3,7] },
  { ai: 4, content: '"Fun" incident: Terraform plan showed 0 changes. Apply took down prod for 22 minutes.\n\nRoot cause: imported drifted resource, plan output truncated the diff. We applied without seeing the destroy.\n\nAlways: `terraform plan -out=plan.bin && terraform show plan.bin`', tags: ['terraform','devops','incident'], likes: [0,3,6] },
  { ai: 5, content: 'Vite 5.3 ships with a Rolldown-based bundler option. Early benchmarks: 10-20x faster production builds for large projects.\n\nRolldown is a Rust-based Rollup-compatible bundler. Switching is (mostly) a one-line config change.', tags: ['vite','javascript','bundlers','performance'], likes: [1,0,3,4,7] },
  { ai: 5, content: 'People sleep on `import.meta`.\n\n`import.meta.url` = ESM `__dirname`\n`import.meta.env` = Vite env vars\n`import.meta.hot` = HMR APIs\n\nThe plugin author\'s best friend.', codeSnippet: { language: 'javascript', code: "const __dirname = new URL('.', import.meta.url).pathname;\n\nif (import.meta.env.DEV) console.log('debug');" }, tags: ['javascript','esm','vite'], likes: [0,1,3,4] },
  { ai: 6, content: 'My security review checklist for every PR:\n\n□ Parameterized SQL queries?\n□ User input in HTML? (XSS)\n□ Auth check on every protected endpoint?\n□ Rate limiting on auth endpoints?\n□ Secrets in env vars, not code?\n□ CORS origin whitelist, not wildcard?\n□ Error messages leak internals?', tags: ['security','checklist','webdev'], likes: [1,0,6,3] },
  { ai: 6, content: 'Found a stored XSS in a major fintech. Vulnerable field: "company name" in KYB form.\n\n"Only employees see it" — except it rendered in the internal admin dashboard. Admin cookies = game over.\n\nCheck your internal tools. They\'re the least audited.', tags: ['security','bugbounty','xss'], likes: [0,2,3,5] },
  { ai: 7, content: 'Month 14 indie hacking:\n\n📈 Tinymetrics: $8,200 MRR (+$600)\n📉 ShipLog: $1,100 MRR (sunsetting)\n🆕 Formbase: $2,800 MRR (3 months old)\n\nTotal: $12,100 MRR\n\nBiggest lesson: churn tells you more than growth. 2% vs 5.5% monthly churn — that difference compounds aggressively.', tags: ['indiehacker','saas','business','revenue'], likes: [0,2,3,5,6] },
  { ai: 7, content: 'Best thing I did for my SaaS: cancellation survey.\n\n38% "too expensive" → raised prices (it worked)\n29% "missing feature X" → built X, recovered 40% of churners\n21% "solved differently" → can\'t fix\n12% "wasn\'t using it" → added onboarding sequence\n\nListening to churners > listening to fans.', tags: ['saas','product','indiehacker'], likes: [0,2,3,4] },
];

const COMMENTS_DATA = [
  { pi: 0, ai: 3, content: 'This is exactly how I handle errors in Go. Great to see a TS equivalent!' },
  { pi: 0, ai: 1, content: "Stealing the plain object approach. More ergonomic than classes for this." },
  { pi: 3, ai: 0, content: 'Same mistake with utility classes. Now everything internal is prefixed `_`.' },
  { pi: 4, ai: 1, content: 'Container queries changed how I build cards. Viewport breakpoints feel primitive now.' },
  { pi: 5, ai: 1, content: 'The CI blocking is key. Without enforcement it always slips to "next sprint."' },
  { pi: 8, ai: 4, content: 'Same in our API gateway. GC latency improvement on p99 was massive.' },
  { pi: 10, ai: 3, content: 'CPU throttle vs memory OOMKill distinction alone is worth bookmarking.' },
  { pi: 11, ai: 4, content: 'I always run `terraform plan -detailed-exitcode` in CI to catch this.' },
  { pi: 13, ai: 6, content: 'More critical vulns in admin dashboards than public-facing endpoints. Always.' },
  { pi: 16, ai: 1, content: '"think → ship" framing going on my wall.' },
];

router.post('/', async (req, res) => {
  if (req.body?.secret !== SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const User = mongoose.models.User;
    const Post = mongoose.models.Post;
    const Comment = mongoose.models.Comment;

    if (!User || !Post || !Comment) {
      return res.status(500).json({ success: false, message: 'Models not loaded — server not fully initialised yet' });
    }

    const log = [];

    // 1. Clear seed data
    await User.deleteMany({ email: /@devconnect\.dev$/ });
    await Post.deleteMany({});
    await Comment.deleteMany({});
    log.push('cleared');

    // 2. Hash password once
    const hashedPw = await bcrypt.hash('Demo1234!', 10); // cost 10 = ~100ms vs 12 = ~800ms

    // 3. Insert users
    const now = Date.now();
    const users = await User.insertMany(
      USERS_DATA.map(u => ({
        ...u,
        password: hashedPw,
        isActive: true,
        isVerified: true,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      }))
    );
    log.push(`users: ${users.length}`);

    // 4. Bulk-write all follow relationships in ONE operation
    const followOps = [];
    const followerCounts = new Array(users.length).fill(0);
    const followingCounts = new Array(users.length).fill(0);
    for (const [fi, ti] of FOLLOWS) {
      followOps.push({ updateOne: { filter: { _id: users[fi]._id }, update: { $addToSet: { following: users[ti]._id } } } });
      followOps.push({ updateOne: { filter: { _id: users[ti]._id }, update: { $addToSet: { followers: users[fi]._id } } } });
      followingCounts[fi]++;
      followerCounts[ti]++;
    }
    await User.bulkWrite(followOps);
    // Update counts in a second bulk
    const countOps = users.map((u, i) => ({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { followersCount: followerCounts[i], followingCount: followingCounts[i] } }
      }
    }));
    await User.bulkWrite(countOps);
    log.push(`follows: ${FOLLOWS.length}`);

    // 5. Pre-calculate per-post likes counts, then insert posts in one go
    const postDocs = POSTS_DATA.map((p, i) => {
      const likerIds = (p.likes || []).map(ui => users[ui]._id);
      return {
        author: users[p.ai]._id,
        content: p.content,
        ...(p.codeSnippet ? { codeSnippet: p.codeSnippet } : {}),
        tags: p.tags || [],
        likes: likerIds,
        likesCount: likerIds.length,
        commentsCount: COMMENTS_DATA.filter(c => c.pi === i).length,
        visibility: 'public',
        engagementScore: likerIds.length + COMMENTS_DATA.filter(c => c.pi === i).length * 2,
        createdAt: new Date(now - (POSTS_DATA.length - i) * 14 * 60 * 60 * 1000),
        updatedAt: new Date(now - (POSTS_DATA.length - i) * 14 * 60 * 60 * 1000),
      };
    });
    const posts = await Post.insertMany(postDocs);
    log.push(`posts: ${posts.length}`);

    // 6. Insert comments in one go
    const commentDocs = COMMENTS_DATA.map((c, i) => ({
      post: posts[c.pi]._id,
      author: users[c.ai]._id,
      content: c.content,
      createdAt: new Date(now - (COMMENTS_DATA.length - i) * 3 * 60 * 60 * 1000),
    }));
    await Comment.insertMany(commentDocs);
    log.push(`comments: ${COMMENTS_DATA.length}`);

    // 7. Update postsCount per user in one bulk
    const postsCountOps = users.map((u, i) => ({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { postsCount: POSTS_DATA.filter(p => p.ai === i).length } }
      }
    }));
    await User.bulkWrite(postsCountOps);
    log.push('postsCount updated');

    const accounts = users.map(u => `${u.username} / ${u.email}`);
    return res.json({ success: true, log, accounts, password: 'Demo1234!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

module.exports = router;
