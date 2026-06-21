/**
 * TEMPORARY one-shot seed route — remove after seeding Atlas.
 * POST /api/v1/admin/seed  { "secret": "devconnect-seed-2026" }
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use inline schemas to avoid model-registration side-effects
const getModels = () => {
  const userSchema = new mongoose.Schema({
    username: String, email: String, password: String, name: String,
    bio: String, headline: String, location: String, website: String,
    githubUsername: String, skills: [String], yearsOfExperience: Number,
    openToWork: Boolean,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    experience: [{
      title: String, company: String, location: String,
      startDate: Date, endDate: Date, current: Boolean, description: String,
    }],
    projects: [{
      title: String, description: String, techStack: [String],
      githubUrl: String, liveUrl: String,
    }],
  }, { timestamps: true });

  const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    codeSnippet: { code: String, language: String },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    visibility: { type: String, default: 'public' },
    engagementScore: { type: Number, default: 0 },
  }, { timestamps: true });

  const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    likesCount: { type: Number, default: 0 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  }, { timestamps: true });

  // Re-use existing registered models if available
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
  const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
  return { User, Post, Comment };
};

const SEED_SECRET = 'devconnect-seed-2026';

const USERS = [
  {
    username: 'alexchen_dev', email: 'alex@devconnect.dev', name: 'Alex Chen',
    headline: 'Senior Full-Stack Engineer @ Stripe',
    bio: 'Building payment infrastructure at scale. Ex-Google. Open source contributor. I write about distributed systems and TypeScript.',
    location: 'San Francisco, CA', website: 'https://alexchen.dev', githubUsername: 'alexchen',
    skills: ['typescript', 'react', 'node.js', 'postgresql', 'kubernetes', 'go'],
    yearsOfExperience: 7, openToWork: false,
    experience: [{ title: 'Senior Software Engineer', company: 'Stripe', location: 'San Francisco, CA', startDate: new Date('2021-03-01'), current: true, description: 'Building payment processing infrastructure handling $1B+ in daily transactions.' }],
    projects: [{ title: 'ts-result', description: 'A type-safe Result monad for TypeScript.', techStack: ['typescript'], githubUrl: 'https://github.com/alexchen/ts-result' }],
  },
  {
    username: 'priya_builds', email: 'priya@devconnect.dev', name: 'Priya Sharma',
    headline: 'Frontend Engineer | React & Design Systems',
    bio: 'Obsessed with component architecture and accessibility. Building design systems that scale.',
    location: 'Austin, TX', website: 'https://priyasharma.io', githubUsername: 'priyabuilds',
    skills: ['react', 'typescript', 'css', 'figma', 'storybook', 'accessibility'],
    yearsOfExperience: 4, openToWork: false,
    experience: [{ title: 'Senior Frontend Engineer', company: 'Shopify', location: 'Remote', startDate: new Date('2022-01-01'), current: true, description: 'Lead engineer on Polaris design system.' }],
    projects: [{ title: 'a11y-checker', description: 'CLI tool for automated accessibility audits.', techStack: ['node.js', 'typescript'], githubUrl: 'https://github.com/priyabuilds/a11y-checker' }],
  },
  {
    username: 'ruslan_ml', email: 'ruslan@devconnect.dev', name: 'Ruslan Petrov',
    headline: 'ML Engineer | PyTorch · Transformers · LLMs',
    bio: 'Training models during the day, reading papers at night.',
    location: 'Berlin, Germany', website: '', githubUsername: 'ruslanml',
    skills: ['python', 'pytorch', 'machine learning', 'cuda', 'docker', 'fastapi'],
    yearsOfExperience: 5, openToWork: false,
    experience: [{ title: 'ML Engineer', company: 'Mistral AI', location: 'Paris, France', startDate: new Date('2023-06-01'), current: true, description: 'Model inference optimization and quantization.' }],
    projects: [],
  },
  {
    username: 'dev_omotayo', email: 'omotayo@devconnect.dev', name: 'Omotayo Adeyemi',
    headline: 'Backend Engineer | Go · Distributed Systems',
    bio: 'Nigerian 🇳🇬. Love building fast, reliable APIs. Exploring WebAssembly and edge computing.',
    location: 'Lagos, Nigeria', website: 'https://omotayo.dev', githubUsername: 'devomotayo',
    skills: ['go', 'rust', 'postgresql', 'redis', 'kafka', 'docker'],
    yearsOfExperience: 6, openToWork: true,
    experience: [{ title: 'Staff Backend Engineer', company: 'Paystack', location: 'Lagos, Nigeria', startDate: new Date('2020-04-01'), current: true, description: 'Designed the core payment routing engine processing 500k transactions/day.' }],
    projects: [{ title: 'gocache', description: 'In-memory LRU cache with TTL support.', techStack: ['go'], githubUrl: 'https://github.com/devomotayo/gocache' }],
  },
  {
    username: 'sarah_devops', email: 'sarah@devconnect.dev', name: 'Sarah Kim',
    headline: 'DevOps/Platform Engineer | K8s · Terraform · AWS',
    bio: 'Making deploys boring (in a good way). I love IaC, observability, and incident postmortems.',
    location: 'Seattle, WA', website: '', githubUsername: 'sarahdevops',
    skills: ['kubernetes', 'terraform', 'aws', 'docker', 'python', 'bash'],
    yearsOfExperience: 8, openToWork: false,
    experience: [{ title: 'Principal Platform Engineer', company: 'Amazon', location: 'Seattle, WA', startDate: new Date('2019-09-01'), current: true, description: 'Platform team lead for internal developer tooling serving 20k engineers.' }],
    projects: [],
  },
  {
    username: 'marcos_oss', email: 'marcos@devconnect.dev', name: 'Marcos Oliveira',
    headline: 'Open Source Maintainer · Vue · Vite core contributor',
    bio: 'Brazilian 🇧🇷 living in Lisbon. Day job: software engineer. Night job: merging PRs.',
    location: 'Lisbon, Portugal', website: 'https://marcosoliveira.dev', githubUsername: 'marcososs',
    skills: ['javascript', 'typescript', 'vue', 'vite', 'node.js', 'rollup'],
    yearsOfExperience: 9, openToWork: false,
    experience: [{ title: 'Senior Software Engineer', company: 'Nuxt Labs', location: 'Remote', startDate: new Date('2022-06-01'), current: true, description: 'Core contributor to Nuxt 3 and the Vite ecosystem.' }],
    projects: [{ title: 'vite-plugin-inspect', description: 'Inspect intermediate state of Vite plugins.', techStack: ['vite', 'typescript', 'vue'], githubUrl: 'https://github.com/marcososs/vite-plugin-inspect' }],
  },
  {
    username: 'yuki_security', email: 'yuki@devconnect.dev', name: 'Yuki Tanaka',
    headline: 'Application Security Engineer | Bug Bounty Hunter',
    bio: "Finding vulns in prod so you don't have to. OSCP certified. Top 50 HackerOne.",
    location: 'Tokyo, Japan', website: '', githubUsername: 'yukisec',
    skills: ['python', 'rust', 'security', 'cryptography', 'linux', 'ctf'],
    yearsOfExperience: 5, openToWork: false,
    experience: [{ title: 'Application Security Engineer', company: 'LINE Corporation', location: 'Tokyo, Japan', startDate: new Date('2021-04-01'), current: true, description: 'Application security reviews and bug bounty program management.' }],
    projects: [],
  },
  {
    username: 'nina_indie', email: 'nina@devconnect.dev', name: 'Nina Kozlov',
    headline: 'Indie Hacker | Built 3 SaaS products | $12k MRR',
    bio: 'Ex-corporate, now indie. Love talking about product, marketing, and the maker lifestyle.',
    location: 'Amsterdam, Netherlands', website: 'https://ninakozlov.com', githubUsername: 'ninaindie',
    skills: ['react', 'node.js', 'postgresql', 'stripe', 'seo', 'product'],
    yearsOfExperience: 6, openToWork: false,
    experience: [{ title: 'Indie Hacker', company: 'Self-Employed', location: 'Amsterdam, Netherlands', startDate: new Date('2022-03-01'), current: true, description: 'Building and launching SaaS products in the developer tools space.' }],
    projects: [{ title: 'Tinymetrics', description: 'Lightweight analytics for indie hackers.', techStack: ['react', 'node.js', 'postgresql'], liveUrl: 'https://tinymetrics.io' }],
  },
];

const POSTS = [
  { authorIdx: 0, content: 'After 7 years of writing TypeScript, the feature I reach for most is discriminated unions. Not generics, not decorators — discriminated unions.\n\nThey make impossible states unrepresentable at compile time.', codeSnippet: { language: 'typescript', code: 'type Result<T, E extends Error = Error> =\n  | { ok: true;  value: T }\n  | { ok: false; error: E };\n\nfunction divide(a: number, b: number): Result<number> {\n  if (b === 0) return { ok: false, error: new Error(\'Division by zero\') };\n  return { ok: true, value: a / b };\n}' }, tags: ['typescript', 'patterns', 'tips'] },
  { authorIdx: 0, content: 'Hot take: most "microservices" I see in the wild are actually distributed monoliths. You get all the operational complexity with none of the independence benefits because services are tightly coupled at the data layer.\n\nThe real question: can service A deploy without redeploying service B?', tags: ['architecture', 'microservices', 'engineering'] },
  { authorIdx: 0, content: 'We migrated 3 million lines of JavaScript to TypeScript over 18 months. Lessons:\n\n1. Start with `allowJs: true` — don\'t big-bang it\n2. `noImplicitAny` early\n3. Codemods handle 80% of mechanical work\n4. Hardest part: untyped third-party libs\n5. ROI is real — runtime errors dropped ~40%', tags: ['typescript', 'migration', 'lessons'] },
  { authorIdx: 1, content: 'Design systems lesson learned the hard way: never export implementation details.\n\nWhen we first shipped our Button component, we exported `StyledButton` for "flexibility." Six months later: 47 places using internal APIs we couldn\'t change.\n\nNow we have a strict rule: if it\'s not in the docs, it\'s not a public API.', tags: ['design-systems', 'react', 'frontend'] },
  { authorIdx: 1, content: 'The most underrated CSS property in 2024: `container-size`. Combined with container queries, it changes how you think about responsive components.\n\nInstead of "responsive to viewport width," you think "responsive to its own available space."', codeSnippet: { language: 'css', code: '.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 400px) {\n  .card {\n    grid-template-columns: auto 1fr;\n  }\n}' }, tags: ['css', 'frontend', 'responsive'] },
  { authorIdx: 1, content: 'Accessibility isn\'t a feature you add at the end. It\'s a quality bar.\n\nWe started running axe-core in CI and blocking merges on violations. First week: 234 violations. Three months later: 0.\n\nMake CI care for you.', tags: ['accessibility', 'a11y', 'frontend', 'devops'] },
  { authorIdx: 2, content: 'Quantization intuition: FP32 → INT8 reduces model size by 4x. But it\'s not just dividing weights by 4. Here\'s what actually happens under the hood:', codeSnippet: { language: 'python', code: 'def quantize_tensor(x, bits=8):\n    x_min, x_max = x.min(), x.max()\n    qmin, qmax = -(2**(bits-1)), (2**(bits-1))-1\n    scale = (x_max - x_min) / (qmax - qmin)\n    zero_point = qmin - x_min / scale\n    return torch.clamp(torch.round(x / scale + zero_point), qmin, qmax).to(torch.int8), scale, zero_point' }, tags: ['ml', 'python', 'llm', 'quantization'] },
  { authorIdx: 2, content: 'Read the Mamba paper this weekend. State Space Models are genuinely interesting — linear time complexity vs transformer\'s quadratic, with competitive quality on many benchmarks.\n\nNot replacing transformers tomorrow. But for long-context tasks the compute savings are significant.', tags: ['ml', 'research', 'llm'] },
  { authorIdx: 3, content: 'Go\'s `sync.Pool` is one of the most underused standard library features. It\'s a free-list that dramatically reduces GC pressure in high-throughput services.\n\nWe added it to our HTTP request handler and cut allocations by 80%:', codeSnippet: { language: 'go', code: 'var bufPool = sync.Pool{\n    New: func() any {\n        buf := make([]byte, 0, 4096)\n        return &buf\n    },\n}\n\nfunc handleRequest(w http.ResponseWriter, r *http.Request) {\n    bufPtr := bufPool.Get().(*[]byte)\n    buf := (*bufPtr)[:0]\n    defer bufPool.Put(bufPtr)\n    buf = append(buf, "hello world"...)\n    w.Write(buf)\n}' }, tags: ['go', 'performance', 'backend'] },
  { authorIdx: 3, content: 'Running Kafka in production for 3 years. Things nobody tells you:\n\n- Consumer lag is your most important metric, not throughput\n- Exactly-once semantics have a real latency cost (~15-20%)\n- Replication factor 3 is the minimum for sleep-able production\n- Dead letter queues save careers', tags: ['kafka', 'backend', 'distributed-systems'] },
  { authorIdx: 4, content: 'Kubernetes resource requests/limits are probably the most misunderstood concept in K8s. Setting them wrong is why your cluster nodes keep OOMKilling random pods.', codeSnippet: { language: 'yaml', code: 'resources:\n  requests:\n    memory: "128Mi"\n    cpu: "100m"\n  limits:\n    memory: "128Mi"  # OOMKilled if exceeded\n    cpu: "1000m"     # Throttled (not killed) if exceeded' }, tags: ['kubernetes', 'devops', 'infrastructure'] },
  { authorIdx: 4, content: 'Had a "fun" incident: Terraform plan showed 0 changes, but applying it took down prod for 22 minutes.\n\nRoot cause: imported a drifted resource, plan output truncated the diff. We applied without seeing the destroy.\n\nLesson: always use `terraform plan -out=planfile && terraform show planfile`.', tags: ['terraform', 'devops', 'incident'] },
  { authorIdx: 5, content: 'Vite 5.3 ships with a Rolldown-based bundler option. Early benchmarks show 10-20x faster production builds for large projects.\n\nRolldown is a Rust-based Rollup-compatible bundler. Switching is (mostly) a one-line config change.', tags: ['vite', 'javascript', 'bundlers', 'performance'] },
  { authorIdx: 5, content: 'People sleep on `import.meta` in modern JS.\n\n`import.meta.url` → ESM equivalent of `__dirname`\n`import.meta.env` → Vite environment variables\n`import.meta.hot` → HMR APIs\n\nThe plugin author\'s best friend.', codeSnippet: { language: 'javascript', code: 'const __dirname = new URL(\'.\', import.meta.url).pathname;\n\nif (import.meta.env.DEV) {\n  console.log(\'debug info\');\n}' }, tags: ['javascript', 'esm', 'vite'] },
  { authorIdx: 6, content: 'Security review checklist for every PR:\n\n□ SQL queries use parameterized statements?\n□ User input reflected in HTML? (XSS)\n□ Auth check on every protected endpoint?\n□ Rate limiting on auth endpoints?\n□ Secrets in env vars, not code?\n□ CORS origin whitelist, not wildcard?\n□ Error messages don\'t leak internals?', tags: ['security', 'checklist', 'webdev'] },
  { authorIdx: 6, content: 'Found a stored XSS in a major fintech yesterday. The vulnerable field was "company name" in their KYB form — almost no security team sanitizes it because "only employees see it."\n\nExcept it was rendered in the internal admin dashboard. Admin cookies = game over.\n\nCheck your internal tools.', tags: ['security', 'bugbounty', 'xss'] },
  { authorIdx: 7, content: 'Month 14 of being an indie hacker. Revenue update:\n\n📈 Tinymetrics: $8,200 MRR (+$600)\n📉 ShipLog: $1,100 MRR (sunset planned)\n🆕 Formbase: $2,800 MRR (launched 3 months ago)\n\nTotal: $12,100 MRR\n\nBiggest lesson: churn tells you more than growth.', tags: ['indiehacker', 'saas', 'business', 'revenue'] },
  { authorIdx: 7, content: 'The most valuable thing I did for my SaaS: added a cancellation survey.\n\n38% "too expensive" → I raised prices (worked)\n29% "missing feature X" → built X, recovered 40% of churners\n21% "solved differently" → can\'t fix\n12% "wasn\'t using it" → added onboarding sequence\n\nListening to churners > listening to fans.', tags: ['saas', 'product', 'indiehacker'] },
];

const COMMENTS = [
  { postIdx: 0, authorIdx: 3, content: 'This is exactly how I handle errors in Go. Great to see a TS equivalent!' },
  { postIdx: 0, authorIdx: 1, content: "I've been writing something similar but using a class. The plain object approach is cleaner. Stealing this." },
  { postIdx: 1, authorIdx: 4, content: 'The data layer coupling is the giveaway every time. All the pain, none of the gain.' },
  { postIdx: 3, authorIdx: 0, content: 'We made the same mistake with utility classes. Everything internal is now prefixed with `_`.' },
  { postIdx: 4, authorIdx: 1, content: 'Container queries changed how I build cards and sidebars. Viewport media queries feel primitive now.' },
  { postIdx: 5, authorIdx: 1, content: 'The CI blocking is key. Without enforcement it always slips.' },
  { postIdx: 6, authorIdx: 2, content: 'Good intro! QAT gets you back most of the accuracy loss if you need INT4.' },
  { postIdx: 8, authorIdx: 4, content: 'We did the same in our API gateway. The GC latency improvement on p99 was massive.' },
  { postIdx: 10, authorIdx: 3, content: 'Saving this. The CPU throttle vs memory OOMKill distinction alone is worth the read.' },
  { postIdx: 11, authorIdx: 4, content: 'This is why I always run `terraform plan -detailed-exitcode` in CI.' },
  { postIdx: 13, authorIdx: 6, content: "The 'internal tools are unaudited' part hits hard. More critical vulns in admin dashboards than public-facing endpoints." },
  { postIdx: 14, authorIdx: 7, content: 'The churn math is brutal but true. I had the same realization with my first SaaS.' },
  { postIdx: 16, authorIdx: 1, content: '"think → ship" vs "ship → think" framing is going on my wall.' },
];

const FOLLOWS = [
  [1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
  [0,1],[2,1],[3,1],[5,1],[7,1],
  [0,2],[1,2],[3,2],[6,2],
  [0,3],[1,3],[2,3],[4,3],[5,3],
  [0,4],[1,4],[3,4],[6,4],
  [0,5],[1,5],[3,5],[7,5],
  [0,6],[3,6],[4,6],
  [0,7],[1,7],[3,7],[5,7],
];

const LIKES = [
  [1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
  [0,1],[3,1],[4,1],[5,1],
  [1,2],[3,2],[6,2],
  [0,3],[2,3],[5,3],[6,3],
  [0,4],[2,4],[3,4],[6,4],[7,4],
  [0,5],[2,5],[3,5],[6,5],
  [1,6],[3,6],[4,6],[7,6],
  [0,7],[1,7],[3,7],
  [1,8],[2,8],[4,8],[5,8],[7,8],
  [0,9],[2,9],[1,9],[5,9],
  [0,10],[1,10],[3,10],[7,10],
  [0,11],[3,11],[6,11],
  [1,12],[0,12],[3,12],[4,12],[7,12],
  [0,13],[1,13],[3,13],[4,13],
  [0,14],[3,14],[4,14],[5,14],[2,14],
  [1,15],[0,15],[6,15],[3,15],
  [0,16],[2,16],[3,16],[5,16],[6,16],
  [0,17],[2,17],[3,17],[4,17],
];

router.post('/', async (req, res) => {
  const { secret } = req.body;
  if (secret !== SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const { User, Post, Comment } = getModels();
    const log = [];

    // Clear existing seed data + all posts/comments
    await User.deleteMany({ email: /@devconnect\.dev$/ });
    await Post.deleteMany({});
    await Comment.deleteMany({});
    log.push('Cleared old seed data');

    const hashedPw = await bcrypt.hash('Demo1234!', 12);
    const users = await User.insertMany(
      USERS.map(u => ({ ...u, password: hashedPw, isActive: true, isVerified: true }))
    );
    log.push(`Created ${users.length} users`);

    for (const [fi, ti] of FOLLOWS) {
      await User.findByIdAndUpdate(users[fi]._id, { $addToSet: { following: users[ti]._id }, $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(users[ti]._id, { $addToSet: { followers: users[fi]._id }, $inc: { followersCount: 1 } });
    }
    log.push(`Applied ${FOLLOWS.length} follows`);

    const now = Date.now();
    const posts = await Post.insertMany(
      POSTS.map((p, i) => ({
        author: users[p.authorIdx]._id,
        content: p.content,
        codeSnippet: p.codeSnippet || undefined,
        tags: p.tags || [],
        visibility: 'public',
        createdAt: new Date(now - (POSTS.length - i) * 14 * 60 * 60 * 1000),
        updatedAt: new Date(now - (POSTS.length - i) * 14 * 60 * 60 * 1000),
      }))
    );
    log.push(`Created ${posts.length} posts`);

    for (const [ui, pi] of LIKES) {
      if (posts[pi]) {
        await Post.findByIdAndUpdate(posts[pi]._id, { $addToSet: { likes: users[ui]._id }, $inc: { likesCount: 1 } });
      }
    }
    log.push(`Applied ${LIKES.length} likes`);

    const comments = await Comment.insertMany(
      COMMENTS.map((c, i) => ({
        post: posts[c.postIdx]._id,
        author: users[c.authorIdx]._id,
        content: c.content,
        createdAt: new Date(now - (COMMENTS.length - i) * 3 * 60 * 60 * 1000),
      }))
    );
    for (const c of COMMENTS) {
      await Post.findByIdAndUpdate(posts[c.postIdx]._id, { $inc: { commentsCount: 1 } });
    }
    log.push(`Created ${comments.length} comments`);

    for (let i = 0; i < USERS.length; i++) {
      const count = POSTS.filter(p => p.authorIdx === i).length;
      await User.findByIdAndUpdate(users[i]._id, { postsCount: count });
    }

    // Engagement scores
    for (const post of posts) {
      const p = await Post.findById(post._id);
      await Post.findByIdAndUpdate(p._id, { engagementScore: p.likesCount + p.commentsCount * 2 });
    }

    const accounts = users.map(u => ({ username: u.username, email: u.email }));
    return res.json({ success: true, log, accounts, password: 'Demo1234!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

module.exports = router;
