import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../app/lib/snippets");

function tailwindEasy() {
  const out = [];
  const space = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "8", "10", "12", "16", "20", "24"];
  const sides = ["p", "px", "py", "pt", "pb", "pl", "pr", "m", "mx", "my", "mt", "mb", "ml", "mr", "gap", "space-x", "space-y"];
  for (const s of space) for (const side of sides) out.push(`${side}-${s}`);
  const sizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];
  for (const s of sizes) out.push(`text-${s}`);
  const colors = ["red", "blue", "green", "yellow", "purple", "pink", "gray", "zinc", "slate", "emerald", "cyan", "orange", "violet", "rose", "amber", "teal", "indigo", "sky", "lime", "fuchsia"];
  const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
  for (const c of colors) for (const sh of shades) {
    out.push(`text-${c}-${sh}`);
    out.push(`bg-${c}-${sh}`);
    out.push(`border-${c}-${sh}`);
  }
  const widths = ["0", "px", "0.5", "1", "2", "4", "8", "full", "screen", "min", "max", "fit"];
  for (const w of widths) out.push(`w-${w}`, `h-${w}`, `min-w-${w}`, `max-w-${w}`);
  return out;
}

function tailwindMedium() {
  const bp = ["sm", "md", "lg", "xl", "2xl"];
  const base = ["flex", "grid", "hidden", "block", "inline-flex", "rounded-lg", "shadow-md", "opacity-75", "ring-2", "underline", "uppercase", "truncate"];
  const out = [];
  for (const b of bp) for (const u of base) out.push(`${b}:${u}`);
  for (const b of bp) out.push(`${b}:px-6`, `${b}:py-4`, `${b}:text-lg`, `${b}:grid-cols-2`, `${b}:grid-cols-3`, `${b}:gap-6`);
  const states = ["hover", "focus", "active", "disabled", "dark"];
  for (const s of states) out.push(`${s}:bg-muted`, `${s}:text-foreground`, `${s}:opacity-50`, `${s}:scale-95`, `${s}:border-violet-500`);
  return out;
}

const EXTRA2 = {
  tailwind: {
    easy: tailwindEasy(),
    medium: tailwindMedium(),
    hard: [
      "@sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4",
      "supports-[backdrop-filter]:bg-background/60",
      "not-prose max-w-none prose-headings:scroll-mt-20",
      "group-data-[state=open]/menu:block",
      "peer-data-[state=checked]:bg-primary",
      "has-[[data-slot=icon]]:pl-10",
      "in-data-[visible=true]:animate-in",
      "starting:open:opacity-0 open:opacity-100",
      "bg-[conic-gradient(from_180deg,var(--tw-gradient-stops))]",
      "text-[13px] leading-[1.4] tracking-[-0.01em]",
      "w-[min(100%,var(--container))]",
      "h-[calc(100dvh-var(--header))]",
      "grid-cols-[240px_1fr]",
      "grid-rows-[auto_1fr_auto]",
      "aspect-[4/3] object-cover",
      "scroll-pt-[--header-h]",
      "underline-offset-[3px] decoration-2",
      "shadow-[0_0_0_1px_rgba(0,0,0,0.05)]",
      "ring-offset-[--background]",
      "outline-[length:2px]",
      "transition-[transform,opacity] duration-300",
      "ease-[cubic-bezier(0.16,1,0.3,1)]",
      "animate-in fade-in zoom-in-95 duration-200",
      "data-[side=bottom]:slide-in-from-top-2",
      "aria-[invalid=true]:border-destructive",
      "forced-colors:outline-auto",
      "print:hidden screen:only:flex",
    ],
  },
  react: {
    easy: [
      "<div className=\"container\">", "<span className=\"sr-only\">", "<button disabled={loading}>",
      "<input readOnly />", "<textarea rows={4} />", "<select defaultValue=\"\">",
      "<form onSubmit={handleSubmit}>", "<label htmlFor=\"email\">", "<img alt=\"\" src={src} />",
      "<a href={url} target=\"_blank\" rel=\"noreferrer\">", "<ul role=\"list\">", "<li role=\"listitem\">",
      "useState(false)", "useState<string>('')", "useState<number | null>(null)",
      "useReducer(reducer, init)", "useContext(Ctx)", "useId()", "useDeferredValue(q)",
      "useTransition()", "useRef<HTMLDivElement>(null)", "useLayoutEffect(() => {}, [])",
      "useImperativeHandle(ref, () => ({}))", "useDebugValue(value)", "createContext(null)",
      "memo(Component)", "lazy(() => import('./X'))", "Fragment", "<></>",
      "cloneElement(child, props)", "Children.map(children, fn)", "isValidElement(node)",
      "createElement('div', props)", "forwardRef(fn)", "displayName = 'X'",
      "propTypes = {}", "defaultProps = {}", "key={id}", "ref={ref}",
      "dangerouslySetInnerHTML={{ __html: html }}", "suppressHydrationWarning",
      "aria-label=\"Close\"", "aria-hidden={true}", "role=\"dialog\"",
      "tabIndex={0}", "onKeyDown={onKeyDown}", "onFocus={onFocus}", "onBlur={onBlur}",
      "className={cn(base, active && 'on')}", "style={{ color: 'red' }}",
      "data-testid=\"btn\"", "data-state=\"open\"", "title=\"Tip\"",
    ],
    medium: [
      "import Image from 'next/image'", "import Link from 'next/link'", "import dynamic from 'next/dynamic'",
      "const router = useRouter()", "const pathname = usePathname()", "const params = useParams()",
      "const searchParams = useSearchParams()", "router.push('/dash')", "router.replace(url)",
      "router.refresh()", "redirect('/login')", "notFound()", "useSearchParams().get('q')",
      "useFormStatus()", "useFormState(action, init)", "useOptimistic(state, fn)",
      "useActionState(fn, init)", "startTransition(() => setTab(t))", "useSyncExternalStore(sub, snap)",
      "useInsertionEffect(() => {}, [])", "useEffect(() => { return () => cleanup() }, [dep])",
      "useMemo(() => expensive(n), [n])", "useCallback((id: string) => () => select(id), [select])",
      "const Comp = memo(function Comp(p: Props) { return <div /> })",
      "forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, ...props }, ref) {",
      "createPortal(children, document.body)", "hydrateRoot(root, <App />)", "createRoot(root).render(<App />)",
      "<ErrorBoundary fallback={<Err />}>{children}</ErrorBoundary>",
      "<Suspense fallback={null}><Lazy /></Suspense>",
      "<AnimatePresence mode=\"wait\">{show && <Panel />}</AnimatePresence>",
      "variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}", "initial=\"closed\" animate=\"open\"",
    ],
    hard: [
      "export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang=\"en\"><body>{children}</body></html> }",
      "const session = await auth(); if (!session?.user?.id) redirect('/sign-in')",
      "export async function generateStaticParams() { return slugs.map((slug) => ({ slug })) }",
      "const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })",
      "const mutation = useMutation({ mutationFn: updateUser, onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) })",
      "const store = create<State>()(persist((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }), { name: 'store' }))",
      "const selected = useSelector((s: RootState) => s.cart.items); const dispatch = useDispatch()",
      "const ref = useRef<HTMLTextAreaElement | null>(null); useEffect(() => { ref.current?.focus() }, [])",
      "useEffect(() => { const ctrl = new AbortController(); fetch(url, { signal: ctrl.signal }); return () => ctrl.abort() }, [url])",
      "function useMediaQuery(query: string) { const [m, setM] = useState(false); useEffect(() => { const mq = window.matchMedia(query); setM(mq.matches); const fn = () => setM(mq.matches); mq.addEventListener('change', fn); return () => mq.removeEventListener('change', fn) }, [query]); return m }",
    ],
  },
  vue: {
    easy: [
      "const msg = ref('')", "const list = ref([])", "const user = reactive({ name: '' })",
      "computed(() => list.value.length)", "watch(msg, (v) => {})", "watchEffect(() => {})",
      "onMounted(() => {})", "onUnmounted(() => {})", "onBeforeMount(() => {})",
      "provide('key', val)", "inject('key')", "toRef(state, 'x')", "toRefs(props)",
      "readonly(state)", "shallowRef({})", "triggerRef(r)", "customRef(() => ({}))",
      "nextTick(() => {})", "defineComponent({})", "h('div', {}, [])", "resolveComponent('X')",
      "<template><slot /></template>", "<template #default>", "<template v-slot:item=\"{ row }\">",
      "v-else-if=\"err\"", "v-else", "v-show=\"open\"", "v-once", "v-pre", "v-memo=\"[id]\"",
      "v-bind=\"$attrs\"", "v-bind:id", ":disabled=\"busy\"", ":class=\"cls\"",
      "@click.prevent", "@submit.stop", "@keyup.enter=\"submit\"",
      "v-model.trim", "v-model.number", "v-model.lazy",
      "import { ref, computed } from 'vue'", "createApp(App).mount('#app')",
    ],
    medium: [
      "defineProps<{ id: string; label?: string }>()", "defineEmits<{ (e: 'update', v: string): void }>()",
      "withDefaults(defineProps<Props>(), { size: 'md' })", "defineExpose({ focus })",
      "defineOptions({ name: 'Card' })", "defineSlots<{ default(): void }>()",
      "defineModel<string>()", "const model = defineModel('count', { type: Number })",
      "watch(() => route.params.id, fetch)", "watch([a, b], ([na, nb]) => {})",
      "watchEffect(async () => { await load() })", "onScopeDispose(() => {})",
      "effectScope(() => {})", "getCurrentInstance()", "useAttrs()", "useSlots()",
      "createRouter({ history: createWebHistory(), routes })", "useRoute()", "useRouter()",
      "createPinia()", "defineStore('cart', { state: () => ({ items: [] }) })",
      "storeToRefs(store)", "const { data } = await useFetch('/api')",
      "defineAsyncComponent(() => import('./Modal.vue'))",
      "<RouterView />", "<RouterLink :to=\"{ name: 'home' }\">", "<KeepAlive><Page /></KeepAlive>",
      "<Teleport to=\"body\"><Modal /></Teleport>", "<Transition name=\"fade\"><Box v-if=\"open\" /></Transition>",
    ],
    hard: [
      "const props = defineProps<{ items: Item[]; dense?: boolean }>()", "const emit = defineEmits<{ select: [id: string] }>()",
      "const { data, error, refresh } = await useAsyncData('key', () => $fetch('/api/x'))",
      "definePageMeta({ middleware: 'auth', layout: 'dashboard' })",
      "export default defineNuxtPlugin((nuxtApp) => { nuxtApp.provide('hello', (msg: string) => msg) })",
      "const store = defineStore('user', () => { const user = ref<User | null>(null); return { user } })",
      "router.beforeEach((to, from, next) => { if (to.meta.auth && !auth.isLoggedIn) next('/login'); else next() })",
      "<script setup lang=\"ts\" generic=\"T extends { id: string }\">",
    ],
  },
  express: {
    easy: [
      "app.get('/users', listUsers)", "app.post('/users', createUser)", "app.put('/users/:id', updateUser)",
      "app.patch('/users/:id', patchUser)", "app.delete('/users/:id', removeUser)",
      "app.head('/health', handler)", "app.options('*', cors())", "router.get('/me', getMe)",
      "req.query.page", "req.query.limit", "req.params.slug", "req.body.email",
      "req.cookies.sid", "req.signedCookies.user", "req.ip", "req.ips", "req.hostname",
      "req.protocol", "req.secure", "req.xhr", "req.path", "req.baseUrl", "req.originalUrl",
      "res.sendStatus(200)", "res.json({ data })", "res.status(201).send({ id })",
      "res.redirect(302, '/login')", "res.render('index', { title: 'Home' })",
      "res.setHeader('Cache-Control', 'no-store')", "res.append('Set-Cookie', 'a=1')",
      "res.locals.user = user", "next('route')", "next(err)", "express.static('public')",
      "express.json({ limit: '2mb' })", "express.urlencoded({ extended: true })",
      "express.Router({ mergeParams: true })", "app.use(morgan('combined'))",
      "app.use(cors({ origin: process.env.CLIENT_URL }))", "app.use(helmet())",
      "app.use(compression())", "app.use(cookieParser(secret))", "app.disable('x-powered-by')",
    ],
    medium: [
      "app.use('/api', authenticate, apiRouter)", "router.param('id', loadById)",
      "app.route('/book').get(getBooks).post(createBook)", "app.all('/ping', ping)",
      "res.format({ json: () => res.json({}), html: () => res.send('<p/>') })",
      "res.download(file, 'report.pdf')", "res.attachment('data.csv')", "res.links({ next: '/p/2' })",
      "req.acceptsCharsets('utf-8')", "req.is('multipart/form-data')", "req.range(size)",
      "const upload = multer({ storage: multer.memoryStorage() })", "app.post('/upload', upload.array('files', 5), done)",
      "import rateLimit from 'express-rate-limit'", "app.use(rateLimit({ windowMs: 60000, max: 100 }))",
      "import session from 'express-session'", "app.use(session({ secret, resave: false, saveUninitialized: false }))",
      "import { body, validationResult } from 'express-validator'",
      "app.post('/signup', body('email').isEmail(), body('password').isLength({ min: 8 }), validate)",
      "await prisma.user.findUnique({ where: { email } })", "await prisma.post.create({ data: { title, authorId } })",
      "mongoose.connect(MONGO_URI)", "const doc = await Model.findById(id).lean()",
      "const io = new Server(server)", "io.on('connection', (socket) => { socket.on('join', (room) => socket.join(room)) })",
      "server.listen(PORT, () => console.log(PORT))", "http.createServer(app)",
    ],
    hard: [
      "const requireAuth: RequestHandler = (req, res, next) => { if (!req.user) return res.sendStatus(401); next() }",
      "app.use('/api', requireAuth, apiRouter)", "router.get('/:id', cache('1m'), asyncHandler(getOne))",
      "app.use((err: HttpError, req, res, next) => { const status = err.status ?? 500; res.status(status).json({ error: err.message }) })",
      "app.use(pinoHttp())", "app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec))",
      "app.use(createProxyMiddleware({ target: 'http://localhost:4000', changeOrigin: true }))",
      "const server = app.listen(PORT); const shutdown = () => server.close(() => process.exit(0)); process.on('SIGTERM', shutdown)",
      "app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook)",
      "const limiter = rateLimit({ keyGenerator: (req) => req.ip ?? 'unknown', standardHeaders: true })",
      "passport.use(new LocalStrategy(async (user, pass, done) => { /* verify */ }))",
      "await redis.setEx(`cache:${key}`, 300, JSON.stringify(payload))", "const hit = await redis.get(key)",
    ],
  },
  next: {
    easy: [
      "export async function HEAD() {}", "export async function OPTIONS() {}",
      "export const dynamic = 'force-static'", "export const runtime = 'edge'",
      "export const preferredRegion = 'auto'", "export const maxDuration = 10",
      "const { searchParams } = new URL(request.url)", "searchParams.get('page')",
      "headers().get('user-agent')", "cookies().set('theme', 'dark')",
      "notFound()", "forbidden()", "unauthorized()", "permanentRedirect('/home')",
      "revalidateTag('products')", "unstable_noStore()", "connection()",
      "fetch(url, { cache: 'force-cache' })", "fetch(url, { next: { revalidate: 60 } })",
      "import prisma from '@/lib/prisma'", "await prisma.item.findMany()",
      "const session = await getServerSession(authOptions)", "signIn('github')", "signOut()",
      "export const metadata = { title: 'App', description: 'Desc' }",
      "export async function generateMetadata({ params }) {}", "params.slug", "await params",
    ],
    medium: [
      "export async function GET(request: Request) { return NextResponse.json({ ok: true }) }",
      "export async function POST(req: Request) { const body = await req.json(); return NextResponse.json(body, { status: 201 }) }",
      "export async function DELETE(_req: Request, { params }: { params: { id: string } }) {}",
      "const token = request.headers.get('authorization')?.replace('Bearer ', '')",
      "return NextResponse.json({ error: 'Bad request' }, { status: 400 })",
      "return NextResponse.redirect(new URL('/login', request.url))",
      "export async function middleware(request: NextRequest) { return NextResponse.next() }",
      "export const config = { matcher: ['/dashboard/:path*'] }",
      "'use server';", "async function createItem(formData: FormData) { 'use server' }",
      "revalidatePath('/posts')", "import { unstable_cache } from 'next/cache'",
      "const getData = unstable_cache(async () => fetchData(), ['data'], { revalidate: 300 })",
      "import { cache } from 'react'", "const getUser = cache(async (id: string) => loadUser(id))",
      "draftMode().enable()", "const { isEnabled } = await draftMode()",
      "import { after } from 'next/server'", "after(() => log())",
      "import { put } from '@vercel/blob'", "const blob = await put(path, file, { access: 'public' })",
    ],
    hard: [
      "export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) { const { id } = await ctx.params; const row = await db.find(id); if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json(row) }",
      "export async function POST(request: Request) { const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'; const { success } = await ratelimit.limit(ip); if (!success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 }); const body = schema.parse(await request.json()); return NextResponse.json(await create(body), { status: 201 }) }",
      "export async function middleware(request: NextRequest) { const session = await auth(); if (!session && request.nextUrl.pathname.startsWith('/app')) return NextResponse.redirect(new URL('/login', request.url)); return NextResponse.next() }",
      "export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string }> }) { const [{ slug }, sp] = await Promise.all([params, searchParams]); return <View slug={slug} q={sp.q} /> }",
      "export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const post = await getPost(slug); return { title: post?.title, openGraph: { images: [post?.image ?? '/og.png'] } } }",
      "export const { GET, POST } = handlers", "export const runtime = 'nodejs'", "export const dynamic = 'force-dynamic'",
    ],
  },
  css: {
    easy: [
      "min-height: 0;", "max-width: none;", "min-width: 100px;", "block-size: auto;",
      "inline-size: 50%;", "margin-inline: auto;", "padding-block: 0.5rem;", "inset: auto;",
      "color-scheme: dark;", "print-color-adjust: exact;", "text-rendering: optimizeLegibility;",
      "font-synthesis: none;", "text-size-adjust: 100%;", "touch-action: auto;", "overscroll-behavior: auto;",
    ],
    medium: [
      "display: flex; flex-wrap: wrap; align-items: flex-start;", "grid-template: 'a b' 'c d' / 1fr 1fr;",
      "background: color-mix(in srgb, #111 80%, transparent);", "border: 1px solid color-mix(in oklab, canvasText 15%, transparent);",
    ],
    hard: [
      "@starting-style { .panel { opacity: 0; transform: translateY(8px); } }", ".panel { transition: opacity 0.3s, transform 0.3s; @starting-style { opacity: 0; } }",
    ],
  },
  html: {
    easy: [
      "<data value=\"\">", "<time datetime=\"\">", "<mark>", "<ruby><rt></rt></ruby>",
      "<bdi>", "<bdo dir=\"rtl\">", "<s>", "<u>", "<var>", "<samp>", "<kbd>",
      "<menu>", "<menuitem>", "<portal>", "<search>", "<slot name=\"\">",
    ],
    medium: [
      "<input enterkeyhint=\"search\" inputmode=\"search\">", "<button popovertarget=\"menu\">",
      "<input type=\"range\" min=\"0\" max=\"100\" step=\"1\">", "<meter low=\"0\" high=\"100\" optimum=\"80\">",
    ],
    hard: [
      "<form><fieldset><legend>Billing</legend><input autocomplete=\"cc-name\" name=\"name\"></fieldset></form>",
    ],
  },
  js: {
    easy: [
      "const x = 1;", "let y = 2;", "const z = x + y;", "foo.bar", "arr[0]", "obj?.a",
      "fn?.()", "a ?? b", "a ??= b", "a &&= b", "a ||= b", "delete obj.k", "void 0;",
      "in obj", "of arr", "new Array(3)", "new Object()", "Array.from({ length: 3 }, (_, i) => i)",
    ],
    medium: [
      "const id = Symbol('id');", "WeakRef(obj)", "FinalizationRegistry(fn)",
      "Atomics.add(i32, 0, 1)", "SharedArrayBuffer", "WebAssembly.instantiate(bytes)",
    ],
    hard: [
      "const pool = new WorkerPool(os.cpus().length); await pool.run(tasks);",
    ],
  },
};

function mergeSnippets(file, extras) {
  const path = join(dir, `${file}.ts`);
  let src = readFileSync(path, "utf8");
  for (const diff of ["easy", "medium", "hard"]) {
    const items = extras[diff];
    if (!items?.length) continue;
    const block = items.map((s) => `    ${JSON.stringify(s)},`).join("\n");
    const re = new RegExp(`(${diff}:\\s*\\[[\\s\\S]*?)(\\n  ],)`, "m");
    if (!re.test(src)) {
      console.warn(`skip ${file} ${diff}`);
      continue;
    }
    src = src.replace(re, `$1\n${block}$2`);
  }
  writeFileSync(path, src);
  console.log(`updated ${file}.ts (+${Object.values(extras).flat().length} snippets)`);
}

for (const [file, extras] of Object.entries(EXTRA2)) {
  mergeSnippets(file, extras);
}
console.log("done");
