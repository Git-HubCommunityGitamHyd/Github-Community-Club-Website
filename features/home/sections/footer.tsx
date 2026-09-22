import { Github, Mail, MapPin, Instagram } from "lucide-react"
import { NAV_ITEMS } from "@/features/home/content"

export function FooterSection() {
  return (
    <footer className="bg-black py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-gray-800 pb-10 sm:grid-cols-3">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <Github className="h-7 w-7" />
              <span className="text-base font-extrabold">
                GitHub Community GITAM
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Empowering the next generation of developers through collaboration
              and open source.
            </p>
          </div>

          <div>
            <div className="mb-4 font-mono text-[13px] font-bold uppercase tracking-wide text-gray-400">
              Quick Links
            </div>
            <div className="flex flex-col gap-2.5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 font-mono text-[13px] font-bold uppercase tracking-wide text-gray-400">
              Contact
            </div>
            <div className="flex flex-col gap-2.5 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:github.gitamhyd@gmail.com">
                  github.gitamhyd@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>GITAM University, Hyderabad</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <a
                  href="https://instagram.com/github.gitam.hyd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @github.gitam.hyd
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-7 text-center font-mono text-xs text-gray-500">
          <div>© 2026 GitHub Community GITAM. All rights reserved.</div>
          <div>
            <a
              href="https://skfb.ly/oHnR9"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              &quot;GitHub Octocat&quot;
            </a>{" "}
            by pissang is licensed under{" "}
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              Creative Commons Attribution
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
