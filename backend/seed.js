require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── inline minimal schemas (avoid importing models with side effects) ─────────
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
  endorsements: { type: Map, of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: {} },
  profileViews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  experience: [{
    title: String, company: String, location: String,
    startDate: Date, endDate: Date, current: Boolean, description: String,
  }],
  projects: [{
    title: String, description: String, techStack: [String], githubUrl: String, liveUrl: String,
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

const connectionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'accepted' },
  message: String,
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  messageType: { type: String, default: 'text' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const ConnectionRequest = mongoose.model('ConnectionRequest', connectionSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

// ── seed data ─────────────────────────────────────────────────────────────────
const USERS = [
  {
    username: 'alexchen_dev',
    email: 'alex@devconnect.dev',
    name: 'Alex Chen',
    headline: 'Senior Full-Stack Engineer @ Stripe',
    bio: 'Building payment infrastructure at scale. Ex-Google. Open source contributor. I write about distributed systems and TypeScript.',
    location: 'San Francisco, CA',
    website: 'https://alexchen.dev',
    githubUsername: 'alexchen',
    skills: ['typescript', 'react', 'node.js', 'postgresql', 'kubernetes', 'go'],
    yearsOfExperience: 7,
    openToWork: false,
    experience: [{
      title: 'Senior Software Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      startDate: new Date('2021-03-01'),
      current: true,
      description: 'Building payment processing infrastructure handling $1B+ in daily transactions.',
    }, {
      title: 'Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      startDate: new Date('2018-07-01'),
      endDate: new Date('2021-02-28'),
      current: false,
      description: 'Worked on Google Search ranking systems.',
    }],
    projects: [{
      title: 'ts-result',
      description: 'A type-safe Result monad for TypeScript inspired by Rust.',
      techStack: ['typescript'],
      githubUrl: 'https://github.com/alexchen/ts-result',
    }],
  },
  {
    username: 'priya_builds',
    email: 'priya@devconnect.dev',
    name: 'Priya Sharma',
    headline: 'Frontend Engineer | React & Design Systems',
    bio: 'Obsessed with component architecture and accessibility. Building design systems that scale. she/her',
    location: 'Austin, TX',
    website: 'https://priyasharma.io',
    githubUsername: 'priyabuilds',
    skills: ['react', 'typescript', 'css', 'figma', 'storybook', 'accessibility'],
    yearsOfExperience: 4,
    openToWork: false,
    experience: [{
      title: 'Senior Frontend Engineer',
      company: 'Shopify',
      location: 'Remote',
      startDate: new Date('2022-01-01'),
      current: true,
      description: 'Lead engineer on Polaris design system used by 10k+ merchants.',
    }],
    projects: [{
      title: 'a11y-checker',
      description: 'CLI tool for automated accessibility audits in CI pipelines.',
      techStack: ['node.js', 'typescript'],
      githubUrl: 'https://github.com/priyabuilds/a11y-checker',
    }],
  },
  {
    username: 'ruslan_ml',
    email: 'ruslan@devconnect.dev',
    name: 'Ruslan Petrov',
    headline: 'ML Engineer | PyTorch · Transformers · LLMs',
    bio: 'Training models during the day, reading papers at night. Interested in efficient inference and quantization.',
    location: 'Berlin, Germany',
    website: '',
    githubUsername: 'ruslanml',
    skills: ['python', 'pytorch', 'machine learning', 'cuda', 'docker', 'fastapi'],
    yearsOfExperience: 5,
    openToWork: false,
    experience: [{
      title: 'ML Engineer',
      company: 'Mistral AI',
      location: 'Paris, France',
      startDate: new Date('2023-06-01'),
      current: true,
      description: 'Working on model inference optimization and quantization.',
    }],
    projects: [],
  },
  {
    username: 'dev_omotayo',
    email: 'omotayo@devconnect.dev',
    name: 'Omotayo Adeyemi',
    headline: 'Backend Engineer | Go · Distributed Systems',
    bio: 'Nigerian 🇳🇬. Love building fast, reliable APIs. Currently exploring WebAssembly and edge computing.',
    location: 'Lagos, Nigeria',
    website: 'https://omotayo.dev',
    githubUsername: 'devomotayo',
    skills: ['go', 'rust', 'postgresql', 'redis', 'kafka', 'docker'],
    yearsOfExperience: 6,
    openToWork: true,
    experience: [{
      title: 'Staff Backend Engineer',
      company: 'Paystack',
      location: 'Lagos, Nigeria',
      startDate: new Date('2020-04-01'),
      current: true,
      description: 'Designed the core payment routing engine processing 500k transactions/day.',
    }],
    projects: [{
      title: 'gocache',
      description: 'In-memory LRU cache with TTL support, built in Go.',
      techStack: ['go'],
      githubUrl: 'https://github.com/devomotayo/gocache',
    }],
  },
  {
    username: 'sarah_devops',
    email: 'sarah@devconnect.dev',
    name: 'Sarah Kim',
    headline: 'DevOps/Platform Engineer | K8s · Terraform · AWS',
    bio: 'Making deploys boring (in a good way). I love IaC, observability, and incident postmortems.',
    location: 'Seattle, WA',
    website: '',
    githubUsername: 'sarahdevops',
    skills: ['kubernetes', 'terraform', 'aws', 'docker', 'python', 'bash'],
    yearsOfExperience: 8,
    openToWork: false,
    experience: [{
      title: 'Principal Platform Engineer',
      company: 'Amazon',
      location: 'Seattle, WA',
      startDate: new Date('2019-09-01'),
      current: true,
      description: 'Platform team lead for internal developer tooling serving 20k engineers.',
    }],
    projects: [],
  },
  {
    username: 'marcos_oss',
    email: 'marcos@devconnect.dev',
    name: 'Marcos Oliveira',
    headline: 'Open Source Maintainer · Vue · Vite core contributor',
    bio: 'Brazilian 🇧🇷 living in Lisbon. Day job: software engineer. Night job: merging PRs.',
    location: 'Lisbon, Portugal',
    website: 'https://marcosoliveira.dev',
    githubUsername: 'marcososs',
    skills: ['javascript', 'typescript', 'vue', 'vite', 'node.js', 'rollup'],
    yearsOfExperience: 9,
    openToWork: false,
    experience: [{
      title: 'Senior Software Engineer',
      company: 'Nuxt Labs',
      location: 'Remote',
      startDate: new Date('2022-06-01'),
      current: true,
      description: 'Core contributor to Nuxt 3 and the Vite ecosystem.',
    }],
    projects: [{
      title: 'vite-plugin-inspect',
      description: 'Inspect the intermediate state of Vite plugins.',
      techStack: ['vite', 'typescript', 'vue'],
      githubUrl: 'https://github.com/marcososs/vite-plugin-inspect',
    }],
  },
  {
    username: 'yuki_security',
    email: 'yuki@devconnect.dev',
    name: 'Yuki Tanaka',
    headline: 'Application Security Engineer | Bug Bounty Hunter',
    bio: 'Finding vulns in prod so you don\'t have to. OSCP certified. Top 50 HackerOne.',
    location: 'Tokyo, Japan',
    website: '',
    githubUsername: 'yukisec',
    skills: ['python', 'rust', 'security', 'cryptography', 'linux', 'ctf'],
    yearsOfExperience: 5,
    openToWork: false,
    experience: [{
      title: 'Application Security Engineer',
      company: 'LINE Corporation',
      location: 'Tokyo, Japan',
      startDate: new Date('2021-04-01'),
      current: true,
      description: 'Application security reviews, threat modeling, and bug bounty program management.',
    }],
    projects: [],
  },
  {
    username: 'nina_indie',
    email: 'nina@devconnect.dev',
    name: 'Nina Kozlov',
    headline: 'Indie Hacker | Built 3 SaaS products | $12k MRR',
    bio: 'Ex-corporate, now indie. Love talking about product, marketing, and the maker lifestyle. Currently building Tinymetrics.',
    location: 'Amsterdam, Netherlands',
    website: 'https://ninakozlov.com',
    githubUsername: 'ninaindie',
    skills: ['react', 'node.js', 'postgresql', 'stripe', 'seo', 'product'],
    yearsOfExperience: 6,
    openToWork: false,
    experience: [{
      title: 'Indie Hacker',
      company: 'Self-Employed',
      location: 'Amsterdam, Netherlands',
      startDate: new Date('2022-03-01'),
      current: true,
      description: 'Building and launching SaaS products in the developer tools space.',
    }],
    projects: [{
      title: 'Tinymetrics',
      description: 'Lightweight analytics for indie hackers. No cookie banners needed.',
      techStack: ['react', 'node.js', 'postgresql'],
      liveUrl: 'https://tinymetrics.io',
    }],
  },
];

const POSTS = [
  // Alex Chen
  {
    authorIdx: 0,
    content: 'After 7 years of writing TypeScript, the feature I reach for most is discriminated unions. Not generics, not decorators — discriminated unions.\n\nThey make impossible states unrepresentable at compile time. Here\'s the pattern I use everywhere:',
    codeSnippet: {
      language: 'typescript',
      code: `type Result<T, E extends Error = Error> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: new Error('Division by zero') };
  return { ok: true, value: a / b };
}

const result = divide(10, 2);
if (result.ok) {
  console.log(result.value); // TypeScript knows this is number
} else {
  console.error(result.error.message); // TypeScript knows this is Error
}`,
    },
    tags: ['typescript', 'patterns', 'tips'],
  },
  {
    authorIdx: 0,
    content: 'Hot take: most "microservices" I see in the wild are actually distributed monoliths. You get all the operational complexity of microservices with none of the independence benefits because the services are tightly coupled at the data layer.\n\nThe real question is: can service A be deployed without redeploying service B? If not, you might have a problem.',
    tags: ['architecture', 'microservices', 'engineering'],
  },
  {
    authorIdx: 0,
    content: 'We migrated 3 million lines of JavaScript to TypeScript over 18 months at my previous job. Lessons:\n\n1. Start with `allowJs: true` — don\'t big-bang it\n2. `noImplicitAny` early, it forces the real conversations\n3. Codemods handle 80% of the mechanical work\n4. The hardest part is untyped third-party libs\n5. The ROI is real — runtime errors dropped ~40%',
    tags: ['typescript', 'migration', 'lessons'],
  },

  // Priya
  {
    authorIdx: 1,
    content: 'Design systems lesson learned the hard way: never export implementation details.\n\nWhen we first shipped our Button component, we exported the internal `StyledButton` for "flexibility." Six months later we had 47 different places using internal APIs we couldn\'t change without breaking things.\n\nNow we have a strict rule: if it\'s not in the docs, it\'s not a public API.',
    tags: ['design-systems', 'react', 'frontend'],
  },
  {
    authorIdx: 1,
    content: 'The most underrated CSS property in 2024: `container-size`. Combined with container queries, it completely changes how you think about responsive components.\n\nInstead of "make this layout responsive to viewport width," you think "make this component responsive to its own available space." Components become truly portable.',
    codeSnippet: {
      language: 'css',
      code: `.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
}

/* When the container (not viewport) is wide enough */
@container card (min-width: 400px) {
  .card {
    grid-template-columns: auto 1fr;
  }
}`,
    },
    tags: ['css', 'frontend', 'responsive'],
  },
  {
    authorIdx: 1,
    content: 'Accessibility isn\'t a feature you add at the end. It\'s a quality bar.\n\nWe started running axe-core in CI and blocking merges on violations. First week: 234 violations across the codebase. Three months later: 0.\n\nIt\'s not hard to fix individual issues. It\'s hard to care enough to fix them. Make CI care for you.',
    tags: ['accessibility', 'a11y', 'frontend', 'devops'],
  },

  // Ruslan
  {
    authorIdx: 2,
    content: 'Quantization intuition thread 🧵\n\nFP32 → INT8 quantization reduces model size by 4x. But it\'s not just dividing weights by 4. Here\'s what actually happens under the hood:',
    codeSnippet: {
      language: 'python',
      code: `import torch

def quantize_tensor(x: torch.Tensor, bits: int = 8) -> tuple[torch.Tensor, float, float]:
    """Symmetric per-tensor linear quantization."""
    x_min, x_max = x.min().item(), x.max().item()
    
    # Compute scale factor
    qmin, qmax = -(2 ** (bits - 1)), (2 ** (bits - 1)) - 1
    scale = (x_max - x_min) / (qmax - qmin)
    zero_point = qmin - x_min / scale
    
    # Quantize
    x_q = torch.clamp(torch.round(x / scale + zero_point), qmin, qmax)
    return x_q.to(torch.int8), scale, zero_point

# Dequantize
def dequantize(x_q, scale, zero_point):
    return scale * (x_q.float() - zero_point)`,
    },
    tags: ['ml', 'python', 'llm', 'quantization'],
  },
  {
    authorIdx: 2,
    content: 'Read the Mamba paper this weekend. State Space Models are genuinely interesting — linear time complexity vs transformer\'s quadratic, with competitive quality on many benchmarks.\n\nNot replacing transformers tomorrow. But for long-context tasks (100k+ tokens) the compute savings are significant. Worth watching.',
    tags: ['ml', 'research', 'llm'],
  },

  // Omotayo
  {
    authorIdx: 3,
    content: 'Go\'s `sync.Pool` is one of the most underused standard library features. It\'s a free-list that can dramatically reduce GC pressure in high-throughput services.\n\nWe added it to our HTTP request handler buffer allocation and cut allocations by 80%:',
    codeSnippet: {
      language: 'go',
      code: `var bufPool = sync.Pool{
    New: func() any {
        // allocate a 4KB buffer
        buf := make([]byte, 0, 4096)
        return &buf
    },
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
    // Get a buffer from the pool (zero allocation)
    bufPtr := bufPool.Get().(*[]byte)
    buf := (*bufPtr)[:0] // reset slice length, keep capacity
    defer bufPool.Put(bufPtr)
    
    // Use buf for your work...
    buf = append(buf, "hello world"...)
    w.Write(buf)
}`,
    },
    tags: ['go', 'performance', 'backend'],
  },
  {
    authorIdx: 3,
    content: 'We\'ve been running Kafka in production for 3 years. Things nobody tells you:\n\n- Consumer lag is your most important metric, not throughput\n- Exactly-once semantics have a real latency cost (~15-20%)\n- Replication factor 3 is the minimum for sleep-able production\n- Monitor __consumer_offsets partition health\n- Dead letter queues save careers\n\nHappy to answer questions 👇',
    tags: ['kafka', 'backend', 'distributed-systems'],
  },

  // Sarah
  {
    authorIdx: 4,
    content: 'Kubernetes resource requests/limits are probably the most misunderstood concept in K8s. Setting them wrong is why your cluster nodes keep OOMKilling random pods.\n\nRule of thumb that actually works in prod:',
    codeSnippet: {
      language: 'yaml',
      code: `resources:
  requests:
    # What K8s uses for scheduling decisions
    # Set to your P50 usage (median)
    memory: "128Mi"
    cpu: "100m"
  limits:
    # Hard cap — exceeding memory = OOMKilled
    # Exceeding CPU = throttled (not killed)
    # Set memory limit = request (avoid burstable)
    # Set CPU limit = 4-10x request (allow bursts)
    memory: "128Mi"
    cpu: "1000m"`,
    },
    tags: ['kubernetes', 'devops', 'infrastructure'],
  },
  {
    authorIdx: 4,
    content: 'Had a "fun" incident last week: a Terraform plan showed 0 changes, but applying it took down prod for 22 minutes.\n\nRoot cause: we were importing a resource that had drifted, Terraform knew the drift, but the plan output truncated the diff. We applied without seeing the destroy.\n\nLesson: always use `terraform plan -out=planfile && terraform show planfile` before apply. Never trust the summary line.',
    tags: ['terraform', 'devops', 'incident'],
  },

  // Marcos
  {
    authorIdx: 5,
    content: 'Vite 5.3 ships with a Rolldown-based bundler option. Early benchmarks show 10-20x faster production builds for large projects.\n\nFor context: Rolldown is a Rust-based Rollup-compatible bundler. Switching is (mostly) a one-line config change. The ecosystem compatibility has been the hard part — we\'ve been testing this for 6 months.',
    tags: ['vite', 'javascript', 'bundlers', 'performance'],
  },
  {
    authorIdx: 5,
    content: 'People sleep on `import.meta` in modern JS.\n\n`import.meta.url` gives you the ESM equivalent of `__dirname`.\n`import.meta.env` (Vite) gives you environment variables without process.env.\n`import.meta.hot` enables HMR APIs.\n\nIt\'s the plugin author\'s best friend and most app devs have never touched it.',
    codeSnippet: {
      language: 'javascript',
      code: `// Get current file's directory (ESM equivalent of __dirname)
const __dirname = new URL('.', import.meta.url).pathname;

// Load a file relative to current module
const config = await fs.readFile(
  new URL('./config.json', import.meta.url),
  'utf-8'
);

// Vite: tree-shake dev-only code
if (import.meta.env.DEV) {
  console.log('debug info');
}`,
    },
    tags: ['javascript', 'esm', 'vite'],
  },

  // Yuki
  {
    authorIdx: 6,
    content: 'Security review checklist for every PR I do at work:\n\n□ SQL queries use parameterized statements?\n□ User input reflected in HTML? (XSS)\n□ Auth check on every protected endpoint?\n□ Rate limiting on auth endpoints?\n□ Secrets in env vars, not code?\n□ CORS origin whitelist, not wildcard?\n□ File uploads validated (type + size + virus scan)?\n□ Error messages don\'t leak internals?\n\nSave this. Use it.',
    tags: ['security', 'checklist', 'webdev'],
  },
  {
    authorIdx: 6,
    content: 'Found a stored XSS in a major fintech yesterday through their bug bounty program. The vulnerable field was the "company name" in their KYB form — a field almost no security team thinks to sanitize because "only employees see it."\n\nExcept it was rendered in the internal admin dashboard. Admin cookies = game over.\n\nCheck your internal tools. They\'re usually the least audited.',
    tags: ['security', 'bugbounty', 'xss'],
  },

  // Nina
  {
    authorIdx: 7,
    content: 'Month 14 of being an indie hacker. Revenue update:\n\n📈 Tinymetrics: $8,200 MRR (+$600 from last month)\n📉 ShipLog: $1,100 MRR (sunset planned)\n🆕 Formbase: $2,800 MRR (launched 3 months ago)\n\nTotal: $12,100 MRR\n\nBiggest lesson: churn tells you more than growth. Formbase has 2% monthly churn. Tinymetrics has 5.5%. That difference compounds aggressively.',
    tags: ['indiehacker', 'saas', 'business', 'revenue'],
  },
  {
    authorIdx: 7,
    content: 'The most valuable thing I did for my SaaS: added a cancellation survey. Not a "please don\'t go" modal — an actual 30-second form asking why.\n\nIn 6 months:\n- 38% "too expensive" → I raised prices (counterintuitive but worked)\n- 29% "missing feature X" → built X, recovered 40% of churners\n- 21% "solved the problem differently" → can\'t fix this\n- 12% "wasn\'t using it" → added onboarding email sequence\n\nListening to churners > listening to fans.',
    tags: ['saas', 'product', 'indiehacker'],
  },
  {
    authorIdx: 7,
    content: 'Shipping daily is overrated. Thinking daily is underrated.\n\nI spent 2 weeks not writing a single line of code, just talking to customers and mapping out the problem space. Felt incredibly unproductive.\n\nThen I shipped in 3 days what would have taken 3 weeks if I\'d just started coding immediately.\n\nThink → ship. Not ship → think.',
    tags: ['product', 'indiehacker', 'mindset'],
  },
];

const COMMENTS = [
  { postIdx: 0, authorIdx: 3, content: 'This is exactly how I handle errors in Go with the errors package. Great to see a TS equivalent!' },
  { postIdx: 0, authorIdx: 1, content: 'I\'ve been writing something similar but using a class. The plain object approach is cleaner. Stealing this.' },
  { postIdx: 0, authorIdx: 7, content: 'Never has "borrowing from Rust" been more justified 😄' },
  { postIdx: 1, authorIdx: 4, content: 'The data layer coupling is the giveaway every time. If you\'re doing distributed transactions, you haven\'t really separated the services.' },
  { postIdx: 1, authorIdx: 3, content: 'Preach. I call it "a monolith with extra latency." All the pain, none of the gain.' },
  { postIdx: 3, authorIdx: 0, content: 'We made the same mistake with utility classes. Now everything internal is prefixed with `_` and marked with @internal JSDoc.' },
  { postIdx: 4, authorIdx: 1, content: 'Container queries changed how I build cards and sidebars. Viewport media queries feel primitive now.' },
  { postIdx: 5, authorIdx: 1, content: 'The CI blocking is key. Without enforcement it always slips. "We\'ll fix it in the next sprint" → never fixed.' },
  { postIdx: 5, authorIdx: 0, content: 'Same approach, same result. Also added Lighthouse in CI for perf. Slow creep is real.' },
  { postIdx: 6, authorIdx: 2, content: 'Good intro! Worth noting that QAT (quantization-aware training) gets you back most of the accuracy loss if you need INT4.' },
  { postIdx: 8, authorIdx: 4, content: 'We did the same in our API gateway. The GC latency improvement on p99 was massive.' },
  { postIdx: 8, authorIdx: 5, content: 'Similar pattern available in Rust with object pools, but the GC story in Go makes this especially impactful.' },
  { postIdx: 10, authorIdx: 3, content: 'Saving this. The CPU throttle vs memory OOMKill distinction alone is worth the read.' },
  { postIdx: 11, authorIdx: 4, content: 'This is why I always run `terraform plan -detailed-exitcode` in CI and fail the pipeline on any change.' },
  { postIdx: 11, authorIdx: 6, content: 'Drift detection tools like Driftctl or Infracost Cloud help catch this before apply. Worth adding to your stack.' },
  { postIdx: 13, authorIdx: 6, content: 'The "internal tools are unaudited" part hits hard. I\'ve found more critical vulns in admin dashboards than in public-facing endpoints.' },
  { postIdx: 13, authorIdx: 0, content: 'This is on my team\'s checklist now. Thank you for sharing.' },
  { postIdx: 14, authorIdx: 7, content: 'The churn math is brutal but true. I had the same realization with my first SaaS.' },
  { postIdx: 14, authorIdx: 3, content: 'What stack is Tinymetrics built on? Curious about the data pipeline for analytics.' },
  { postIdx: 16, authorIdx: 1, content: 'The "think → ship" vs "ship → think" framing is going on my wall.' },
];

// follow graph: [follower_idx, following_idx]
const FOLLOWS = [
  [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], // everyone follows Alex
  [0, 1], [2, 1], [3, 1], [5, 1], [7, 1],
  [0, 2], [1, 2], [3, 2], [6, 2],
  [0, 3], [1, 3], [2, 3], [4, 3], [5, 3],
  [0, 4], [1, 4], [3, 4], [6, 4],
  [0, 5], [1, 5], [3, 5], [7, 5],
  [0, 6], [3, 6], [4, 6],
  [0, 7], [1, 7], [3, 7], [5, 7],
];

// likes: [user_idx, post_idx]
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

async function seed() {
  const uri = process.argv[2] || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/devconnect';
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri);
  console.log('Connected.');

  // Wipe existing seed data
  await User.deleteMany({ email: /@devconnect\.dev$/ });
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await ConnectionRequest.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
  console.log('Cleared old data.');

  // Hash password (same for all demo users: Demo1234!)
  const hashedPw = await bcrypt.hash('Demo1234!', 12);

  // Create users
  const users = await User.insertMany(
    USERS.map(u => ({ ...u, password: hashedPw, isActive: true, isVerified: true }))
  );
  console.log(`Created ${users.length} users.`);

  // Apply follows
  for (const [fi, ti] of FOLLOWS) {
    const follower = users[fi];
    const target = users[ti];
    await User.findByIdAndUpdate(follower._id, { $addToSet: { following: target._id }, $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(target._id, { $addToSet: { followers: follower._id }, $inc: { followersCount: 1 } });
  }
  console.log(`Applied ${FOLLOWS.length} follow relationships.`);

  // Create posts
  const now = Date.now();
  const posts = await Post.insertMany(
    POSTS.map((p, i) => ({
      author: users[p.authorIdx]._id,
      content: p.content,
      codeSnippet: p.codeSnippet || undefined,
      tags: p.tags || [],
      visibility: 'public',
      // Stagger creation times over the last 2 weeks
      createdAt: new Date(now - (POSTS.length - i) * 14 * 60 * 60 * 1000),
      updatedAt: new Date(now - (POSTS.length - i) * 14 * 60 * 60 * 1000),
    }))
  );
  console.log(`Created ${posts.length} posts.`);

  // Apply likes
  for (const [ui, pi] of LIKES) {
    await Post.findByIdAndUpdate(posts[pi]._id, {
      $addToSet: { likes: users[ui]._id },
      $inc: { likesCount: 1 },
    });
  }
  // Recalculate engagement score
  for (const post of posts) {
    const p = await Post.findById(post._id);
    await Post.findByIdAndUpdate(p._id, {
      engagementScore: p.likesCount * 1 + p.commentsCount * 2,
    });
  }
  console.log(`Applied ${LIKES.length} likes.`);

  // Create comments
  const comments = await Comment.insertMany(
    COMMENTS.map((c, i) => ({
      post: posts[c.postIdx]._id,
      author: users[c.authorIdx]._id,
      content: c.content,
      createdAt: new Date(now - (COMMENTS.length - i) * 3 * 60 * 60 * 1000),
    }))
  );
  // Update commentsCount on posts
  for (const c of COMMENTS) {
    await Post.findByIdAndUpdate(posts[c.postIdx]._id, { $inc: { commentsCount: 1 } });
  }
  console.log(`Created ${comments.length} comments.`);

  // Update postsCount on users
  for (let i = 0; i < USERS.length; i++) {
    const count = POSTS.filter(p => p.authorIdx === i).length;
    await User.findByIdAndUpdate(users[i]._id, { postsCount: count });
  }

  // Seed accepted connections: [senderIdx, receiverIdx]
  const CONNECTIONS = [[0,1],[0,4],[0,6],[1,2],[4,5],[3,7],[2,6],[1,4]];
  await ConnectionRequest.insertMany(
    CONNECTIONS.map(([si, ri]) => ({
      sender: users[si]._id,
      receiver: users[ri]._id,
      status: 'accepted',
    }))
  );
  console.log(`Created ${CONNECTIONS.length} connections.`);

  // Seed conversations + messages between connected pairs
  const CONV_DATA = [
    { a: 0, b: 1, msgs: [
      { from: 0, text: "Hey Priya! Loved your post on async Python. Have you tried using asyncio with FastAPI?" },
      { from: 1, text: "Thanks Alex! Yes, FastAPI is amazing with async. The performance gains are huge." },
      { from: 0, text: "Agreed. We should collab on a tutorial sometime 🙌" },
    ]},
    { a: 0, b: 4, msgs: [
      { from: 4, text: "Alex, your React performance tips saved our app. Load time dropped 40%!" },
      { from: 0, text: "That's awesome Sarah! React.memo + useMemo can make a huge difference." },
    ]},
    { a: 1, b: 2, msgs: [
      { from: 1, text: "Ruslan, your Rust concurrency post blew my mind. Coming from Python it's a whole new world." },
      { from: 2, text: "Ha! Rust ownership is confusing at first but becomes second nature. Happy to help if you get stuck." },
      { from: 1, text: "I'd love that, thanks!" },
    ]},
    { a: 4, b: 5, msgs: [
      { from: 5, text: "Sarah, are you going to the cloud-native conf next month?" },
      { from: 4, text: "Definitely! We should grab lunch. I want to hear more about your microservices migration." },
    ]},
  ];

  for (const cv of CONV_DATA) {
    const conv = await Conversation.create({
      participants: [users[cv.a]._id, users[cv.b]._id],
    });
    let lastMsg = null;
    const nowMs = Date.now();
    for (let mi = 0; mi < cv.msgs.length; mi++) {
      const m = cv.msgs[mi];
      const msg = await Message.create({
        conversation: conv._id,
        sender: users[m.from]._id,
        content: m.text,
        readBy: [users[m.from]._id],
        createdAt: new Date(nowMs - (cv.msgs.length - mi) * 10 * 60 * 1000),
      });
      lastMsg = msg._id;
    }
    await Conversation.findByIdAndUpdate(conv._id, { lastMessage: lastMsg });
  }
  console.log(`Created ${CONV_DATA.length} conversations with messages.`);

  console.log('\n✅ Seed complete!\n');
  console.log('Demo accounts (password: Demo1234!):');
  users.forEach(u => console.log(`  ${u.username.padEnd(20)} ${u.email}`));

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
