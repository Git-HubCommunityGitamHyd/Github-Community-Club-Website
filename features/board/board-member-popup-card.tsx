"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Twitter, Mail, User } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { PopupCard } from "@/components/motion/popup-card"
import { EnhancedButton } from "@/components/motion/enhanced-button"

interface BoardMemberPopupCardProps {
  member: {
    name: string
    role: string
    image: string
    description: string
    github?: string
    linkedin?: string
    twitter?: string
    email?: string
  }
  index: number
}

function MemberImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 shadow-sm dark:border-gh-border">
      {!loaded && <div className="skeleton absolute inset-0 rounded-full" />}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={80}
        height={80}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

function MemberImageLarge({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-full border-4 border-gray-200 shadow-lg dark:border-gh-border">
      {!loaded && <div className="skeleton absolute inset-0 rounded-full" />}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={200}
        height={200}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

export function BoardMemberPopupCard({
  member,
  index,
}: BoardMemberPopupCardProps) {
  const frontContent = (
    <Card className="h-full border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-gh-border dark:from-gh-surface dark:to-gh-elevated dark:hover:border-gh-muted dark:hover:shadow-black/40">
      <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <MemberImage src={member.image} alt={member.name} />
        </motion.div>
        <CardTitle className="mb-4 text-2xl text-gray-900 dark:text-gh-text">
          {member.name}
        </CardTitle>
        <Badge
          variant="secondary"
          className="mb-4 px-4 py-2 text-lg dark:border-gh-border dark:bg-gh-elevated dark:text-gh-text"
        >
          {member.role}
        </Badge>
        <motion.div
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gh-muted"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <User className="h-4 w-4" />
          Click to learn more
        </motion.div>
      </CardContent>
    </Card>
  )

  const backContent = (
    <div className="mx-auto h-auto w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start gap-6 md:flex-row md:gap-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <MemberImageLarge src={member.image} alt={member.name} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.h3
            className="mb-4 break-words pr-10 text-3xl font-bold text-gray-900 dark:text-gh-text md:mb-6 md:pr-0 md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          >
            {member.name}
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
          >
            <Badge
              variant="outline"
              className="border-gh-accent-light px-5 py-2 text-base font-medium text-gh-accent-light dark:border-gh-accent dark:text-gh-accent md:px-8 md:py-3 md:text-xl"
            >
              {member.role}
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Description */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
      >
        <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gh-text md:text-2xl">
          About
        </h4>
        <p className="text-base leading-relaxed text-gray-600 dark:text-gh-muted md:text-xl">
          {member.description}
        </p>
      </motion.div>

      {/* Social links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6, ease: "easeOut" }}
      >
        <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gh-text md:text-2xl">
          Connect
        </h4>
        <div className="flex flex-wrap gap-4">
          {[
            {
              condition: member.github,
              href: `https://github.com/${member.github}`,
              icon: Github,
              label: "GitHub",
              colorScheme: "github" as const,
            },
            {
              condition: member.linkedin,
              href: `https://linkedin.com/in/${member.linkedin}`,
              icon: Linkedin,
              label: "LinkedIn",
              colorScheme: "linkedin" as const,
            },
            {
              condition: member.twitter,
              href: `https://twitter.com/${member.twitter}`,
              icon: Twitter,
              label: "Twitter",
              colorScheme: "twitter" as const,
            },
            {
              condition: member.email,
              href: `mailto:${member.email}`,
              icon: Mail,
              label: "Email",
              colorScheme: "email" as const,
            },
          ].map(
            (social, socialIndex) =>
              social.condition && (
                <motion.div
                  key={social.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.7 + socialIndex * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <EnhancedButton
                    size="lg"
                    colorScheme={social.colorScheme}
                    className="px-4 py-2 text-base"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      window.open(social.href, "_blank")
                    }}
                  >
                    <social.icon className="h-5 w-5" />
                    {social.label}
                  </EnhancedButton>
                </motion.div>
              ),
          )}
        </div>
      </motion.div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <PopupCard
        frontContent={frontContent}
        backContent={backContent}
        cardId={`member-${index}`}
        className="h-full"
      />
    </motion.div>
  )
}
