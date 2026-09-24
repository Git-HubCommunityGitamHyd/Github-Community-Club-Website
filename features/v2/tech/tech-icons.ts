import type { IconType } from "react-icons"
import * as Si from "react-icons/si"
import { FaJava, FaWindows } from "react-icons/fa6"
import { RiOpenaiFill } from "react-icons/ri"
import { VscVscode } from "react-icons/vsc"
import { AwsIcon } from "@/features/v2/about/aws-icon"

/**
 * Logos for the tech stack on project and build pages.
 *
 * The stack is typed free text in the CMS ("Next.js, Firebase"), and students
 * spell things every way ("nextjs", "Next", "next.js"), so each logo lists
 * the names it answers to. Matching ignores case, spaces, dots and hyphens.
 * A name with no entry is not an error: it renders as a monogram tile the
 * same size as a logo (see TechStack), and the CMS preview shows which names
 * fell back so a typo can be fixed. Adding a logo is one line here.
 *
 * Almost everything is Simple Icons (`react-icons/si`), like the homepage
 * marquee. The exceptions are marks Simple Icons removed over trademark
 * policy: Java, OpenAI, VS Code and Windows come from other react-icons
 * packs, and AWS is the site's own inlined mark (features/v2/about/aws-icon).
 */
type Tech = { label: string; icon: IconType; names: string[] }

const TECH: Tech[] = [
  // Version control and CI
  { label: "Git", icon: Si.SiGit, names: ["git"] },
  { label: "GitHub", icon: Si.SiGithub, names: ["github"] },
  {
    label: "GitHub Actions",
    icon: Si.SiGithubactions,
    names: ["githubactions", "actions", "gha"],
  },
  { label: "GitLab", icon: Si.SiGitlab, names: ["gitlab"] },

  // Languages
  { label: "TypeScript", icon: Si.SiTypescript, names: ["typescript", "ts"] },
  {
    label: "JavaScript",
    icon: Si.SiJavascript,
    names: ["javascript", "js", "vanillajs", "es6"],
  },
  { label: "Python", icon: Si.SiPython, names: ["python", "py", "python3"] },
  { label: "Java", icon: FaJava, names: ["java"] },
  { label: "Kotlin", icon: Si.SiKotlin, names: ["kotlin"] },
  { label: "Swift", icon: Si.SiSwift, names: ["swift", "swiftui"] },
  { label: "Dart", icon: Si.SiDart, names: ["dart"] },
  { label: "C", icon: Si.SiC, names: ["c"] },
  { label: "C++", icon: Si.SiCplusplus, names: ["c++", "cpp", "cplusplus"] },
  { label: "C#", icon: Si.SiDotnet, names: ["c#", "csharp", "dotnet", "net"] },
  { label: "Go", icon: Si.SiGo, names: ["go", "golang"] },
  { label: "Rust", icon: Si.SiRust, names: ["rust"] },
  { label: "PHP", icon: Si.SiPhp, names: ["php"] },
  { label: "Ruby", icon: Si.SiRuby, names: ["ruby"] },
  { label: "R", icon: Si.SiR, names: ["r", "rlang"] },
  { label: "Lua", icon: Si.SiLua, names: ["lua"] },
  { label: "HTML", icon: Si.SiHtml5, names: ["html", "html5"] },
  { label: "CSS", icon: Si.SiCss, names: ["css", "css3"] },
  { label: "Sass", icon: Si.SiSass, names: ["sass", "scss"] },
  { label: "Markdown", icon: Si.SiMarkdown, names: ["markdown", "md", "mdx"] },

  // Web
  {
    label: "React",
    icon: Si.SiReact,
    names: ["react", "reactjs", "reactnative"],
  },
  { label: "Next.js", icon: Si.SiNextdotjs, names: ["nextjs", "next"] },
  { label: "Vue", icon: Si.SiVuedotjs, names: ["vue", "vuejs"] },
  { label: "Svelte", icon: Si.SiSvelte, names: ["svelte", "sveltekit"] },
  { label: "Angular", icon: Si.SiAngular, names: ["angular", "angularjs"] },
  { label: "Astro", icon: Si.SiAstro, names: ["astro"] },
  { label: "Remix", icon: Si.SiRemix, names: ["remix"] },
  { label: "Vite", icon: Si.SiVite, names: ["vite"] },
  { label: "Node.js", icon: Si.SiNodedotjs, names: ["node", "nodejs"] },
  { label: "Express", icon: Si.SiExpress, names: ["express", "expressjs"] },
  { label: "NestJS", icon: Si.SiNestjs, names: ["nest", "nestjs"] },
  { label: "Hono", icon: Si.SiHono, names: ["hono"] },
  { label: "Bun", icon: Si.SiBun, names: ["bun"] },
  { label: "Deno", icon: Si.SiDeno, names: ["deno"] },
  { label: "Django", icon: Si.SiDjango, names: ["django"] },
  { label: "Flask", icon: Si.SiFlask, names: ["flask"] },
  { label: "FastAPI", icon: Si.SiFastapi, names: ["fastapi"] },
  {
    label: "Spring Boot",
    icon: Si.SiSpringboot,
    names: ["springboot", "spring"],
  },
  { label: "Laravel", icon: Si.SiLaravel, names: ["laravel"] },
  {
    label: "Rails",
    icon: Si.SiRubyonrails,
    names: ["rails", "rubyonrails", "ror"],
  },
  {
    label: "Tailwind CSS",
    icon: Si.SiTailwindcss,
    names: ["tailwind", "tailwindcss"],
  },
  { label: "Bootstrap", icon: Si.SiBootstrap, names: ["bootstrap"] },
  { label: "shadcn/ui", icon: Si.SiShadcnui, names: ["shadcn", "shadcnui"] },
  { label: "Radix UI", icon: Si.SiRadixui, names: ["radix", "radixui"] },
  { label: "MUI", icon: Si.SiMui, names: ["mui", "materialui"] },
  { label: "Chakra UI", icon: Si.SiChakraui, names: ["chakra", "chakraui"] },
  { label: "Redux", icon: Si.SiRedux, names: ["redux", "reduxtoolkit"] },
  {
    label: "React Query",
    icon: Si.SiReactquery,
    names: ["reactquery", "tanstackquery"],
  },
  { label: "GraphQL", icon: Si.SiGraphql, names: ["graphql"] },
  {
    label: "Socket.IO",
    icon: Si.SiSocketdotio,
    names: ["socketio", "socket", "websockets"],
  },
  { label: "Three.js", icon: Si.SiThreedotjs, names: ["threejs", "three"] },
  { label: "GSAP", icon: Si.SiGsap, names: ["gsap"] },
  {
    label: "Framer",
    icon: Si.SiFramer,
    names: ["framer", "framermotion", "motion"],
  },
  { label: "jQuery", icon: Si.SiJquery, names: ["jquery"] },
  { label: "Zod", icon: Si.SiZod, names: ["zod"] },
  { label: "WordPress", icon: Si.SiWordpress, names: ["wordpress", "wp"] },
  { label: "PWA", icon: Si.SiPwa, names: ["pwa"] },

  // Mobile and desktop
  { label: "Flutter", icon: Si.SiFlutter, names: ["flutter"] },
  { label: "Android", icon: Si.SiAndroid, names: ["android"] },
  {
    label: "Android Studio",
    icon: Si.SiAndroidstudio,
    names: ["androidstudio"],
  },
  { label: "Expo", icon: Si.SiExpo, names: ["expo"] },
  { label: "Ionic", icon: Si.SiIonic, names: ["ionic"] },
  { label: "Electron", icon: Si.SiElectron, names: ["electron"] },
  { label: "Tauri", icon: Si.SiTauri, names: ["tauri"] },

  // Data
  { label: "Firebase", icon: Si.SiFirebase, names: ["firebase", "firestore"] },
  { label: "Supabase", icon: Si.SiSupabase, names: ["supabase"] },
  { label: "Appwrite", icon: Si.SiAppwrite, names: ["appwrite"] },
  { label: "PocketBase", icon: Si.SiPocketbase, names: ["pocketbase"] },
  {
    label: "PostgreSQL",
    icon: Si.SiPostgresql,
    names: ["postgres", "postgresql", "psql"],
  },
  { label: "MySQL", icon: Si.SiMysql, names: ["mysql"] },
  { label: "SQLite", icon: Si.SiSqlite, names: ["sqlite"] },
  {
    label: "MongoDB",
    icon: Si.SiMongodb,
    names: ["mongodb", "mongo", "mongoose"],
  },
  { label: "Redis", icon: Si.SiRedis, names: ["redis"] },
  { label: "Prisma", icon: Si.SiPrisma, names: ["prisma"] },
  { label: "Drizzle", icon: Si.SiDrizzle, names: ["drizzle", "drizzleorm"] },
  {
    label: "CockroachDB",
    icon: Si.SiCockroachlabs,
    names: ["cockroachdb", "cockroach"],
  },
  { label: "Neon", icon: Si.SiNeon, names: ["neon"] },
  { label: "Turso", icon: Si.SiTurso, names: ["turso"] },
  {
    label: "Elasticsearch",
    icon: Si.SiElasticsearch,
    names: ["elasticsearch", "elastic"],
  },
  {
    label: "Google Sheets",
    icon: Si.SiGooglesheets,
    names: ["googlesheets", "sheets"],
  },

  // AI and data science
  { label: "TensorFlow", icon: Si.SiTensorflow, names: ["tensorflow", "tf"] },
  { label: "PyTorch", icon: Si.SiPytorch, names: ["pytorch", "torch"] },
  { label: "Keras", icon: Si.SiKeras, names: ["keras"] },
  {
    label: "scikit-learn",
    icon: Si.SiScikitlearn,
    names: ["scikitlearn", "sklearn"],
  },
  { label: "NumPy", icon: Si.SiNumpy, names: ["numpy"] },
  { label: "pandas", icon: Si.SiPandas, names: ["pandas"] },
  {
    label: "Jupyter",
    icon: Si.SiJupyter,
    names: ["jupyter", "jupyternotebook"],
  },
  { label: "OpenCV", icon: Si.SiOpencv, names: ["opencv", "cv2"] },
  {
    label: "Hugging Face",
    icon: Si.SiHuggingface,
    names: ["huggingface", "hf", "transformers"],
  },
  {
    label: "OpenAI",
    icon: RiOpenaiFill,
    names: ["openai", "chatgpt", "gpt", "openaiapi"],
  },
  { label: "Claude", icon: Si.SiClaude, names: ["claude", "anthropic"] },
  {
    label: "Gemini",
    icon: Si.SiGooglegemini,
    names: ["gemini", "googlegemini"],
  },
  { label: "LangChain", icon: Si.SiLangchain, names: ["langchain"] },
  { label: "Ollama", icon: Si.SiOllama, names: ["ollama"] },
  { label: "Streamlit", icon: Si.SiStreamlit, names: ["streamlit"] },

  // Infrastructure
  { label: "Docker", icon: Si.SiDocker, names: ["docker"] },
  { label: "Kubernetes", icon: Si.SiKubernetes, names: ["kubernetes", "k8s"] },
  { label: "Linux", icon: Si.SiLinux, names: ["linux"] },
  { label: "Ubuntu", icon: Si.SiUbuntu, names: ["ubuntu"] },
  {
    label: "Shell",
    icon: Si.SiGnubash,
    names: ["shell", "bash", "sh", "zsh", "shellscript"],
  },
  { label: "Nginx", icon: Si.SiNginx, names: ["nginx"] },
  {
    label: "Cloudflare",
    icon: Si.SiCloudflare,
    names: ["cloudflare", "cloudflarepages"],
  },
  {
    label: "Cloudflare Workers",
    icon: Si.SiCloudflareworkers,
    names: ["cloudflareworkers", "workers"],
  },
  // Cloudflare's products have no marks of their own in Simple Icons; they
  // carry the Cloudflare mark under their own name.
  {
    label: "Cloudflare D1",
    icon: Si.SiCloudflare,
    names: ["d1", "cloudflared1"],
  },
  {
    label: "Workers KV",
    icon: Si.SiCloudflare,
    names: ["kv", "workerskv", "cloudflarekv"],
  },
  {
    label: "Durable Objects",
    icon: Si.SiCloudflare,
    names: ["durableobjects"],
  },
  {
    label: "Cloudflare R2",
    icon: Si.SiCloudflare,
    names: ["r2", "cloudflarer2"],
  },
  { label: "Vercel", icon: Si.SiVercel, names: ["vercel"] },
  { label: "Netlify", icon: Si.SiNetlify, names: ["netlify"] },
  { label: "Render", icon: Si.SiRender, names: ["render"] },
  { label: "Railway", icon: Si.SiRailway, names: ["railway"] },
  {
    label: "Google Cloud",
    icon: Si.SiGooglecloud,
    names: ["googlecloud", "gcp"],
  },
  {
    label: "AWS",
    icon: AwsIcon,
    names: ["aws", "amazonwebservices", "s3", "ec2", "lambda"],
  },
  { label: "Terraform", icon: Si.SiTerraform, names: ["terraform"] },

  // Services
  { label: "Stripe", icon: Si.SiStripe, names: ["stripe"] },
  { label: "Razorpay", icon: Si.SiRazorpay, names: ["razorpay"] },
  { label: "Clerk", icon: Si.SiClerk, names: ["clerk"] },
  { label: "Auth0", icon: Si.SiAuth0, names: ["auth0"] },
  {
    label: "Google Maps",
    icon: Si.SiGooglemaps,
    names: ["googlemaps", "maps"],
  },
  { label: "Mapbox", icon: Si.SiMapbox, names: ["mapbox"] },
  { label: "Leaflet", icon: Si.SiLeaflet, names: ["leaflet"] },
  {
    label: "WhatsApp",
    icon: Si.SiWhatsapp,
    names: ["whatsapp", "whatsappapi"],
  },
  {
    label: "Telegram",
    icon: Si.SiTelegram,
    names: ["telegram", "telegrambot"],
  },
  { label: "Discord", icon: Si.SiDiscord, names: ["discord", "discordjs"] },
  { label: "Resend", icon: Si.SiResend, names: ["resend"] },
  { label: "Sentry", icon: Si.SiSentry, names: ["sentry"] },

  // Hardware, games, tools, design
  { label: "Arduino", icon: Si.SiArduino, names: ["arduino"] },
  {
    label: "Raspberry Pi",
    icon: Si.SiRaspberrypi,
    names: ["raspberrypi", "rpi"],
  },
  { label: "Unity", icon: Si.SiUnity, names: ["unity"] },
  { label: "Godot", icon: Si.SiGodotengine, names: ["godot", "godotengine"] },
  {
    label: "Unreal Engine",
    icon: Si.SiUnrealengine,
    names: ["unreal", "unrealengine", "ue5"],
  },
  { label: "Blender", icon: Si.SiBlender, names: ["blender"] },
  { label: "Postman", icon: Si.SiPostman, names: ["postman"] },
  { label: "Jest", icon: Si.SiJest, names: ["jest"] },
  { label: "Vitest", icon: Si.SiVitest, names: ["vitest"] },
  { label: "VS Code", icon: VscVscode, names: ["vscode", "visualstudiocode"] },
  { label: "Windows", icon: FaWindows, names: ["windows"] },
  { label: "Figma", icon: Si.SiFigma, names: ["figma"] },
  { label: "Notion", icon: Si.SiNotion, names: ["notion"] },
]

/** Case, spaces, dots, hyphens and slashes do not matter; + and # do (C++). */
export function normaliseTech(name: string): string {
  return name.toLowerCase().replace(/[\s._\-/]/g, "")
}

const BY_NAME = new Map<string, Tech>()
for (const tech of TECH) {
  for (const name of [tech.label, ...tech.names]) {
    BY_NAME.set(normaliseTech(name), tech)
  }
}

export type ResolvedTech = {
  /** The proper name when known ("nextjs" shows as Next.js), else as typed. */
  name: string
  icon: IconType | null
}

export function resolveTech(name: string): ResolvedTech {
  const tech = BY_NAME.get(normaliseTech(name))
  return { name: tech?.label ?? name.trim(), icon: tech?.icon ?? null }
}

/** Up to two letters for a tool with no logo: "Hive" is Hi, "Power BI" is PB. */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  const word = words[0] ?? "?"
  return word.slice(0, 2).charAt(0).toUpperCase() + word.slice(1, 2)
}
