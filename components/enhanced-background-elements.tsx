"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import {
  Github,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Code,
  Terminal,
  Hash,
  Star,
  Zap,
  FileCode,
  Folder,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Bug,
  Settings,
  Lock,
  Unlock,
  Users,
  UserPlus,
  MessageSquare,
  Heart,
} from "lucide-react"

export function EnhancedBackgroundElements() {
  const icons = [
    Github,
    GitBranch,
    GitCommit,
    GitMerge,
    GitPullRequest,
    Code,
    Terminal,
    Hash,
    Star,
    Zap,
    FileCode,
    Folder,
    FolderOpen,
    CheckCircle,
    AlertCircle,
    Bug,
    Settings,
    Lock,
    Unlock,
    Users,
    UserPlus,
    MessageSquare,
    Heart,
  ]

  const generateRandomElements = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 10,
      opacity: Math.random() * 0.15 + 0.05,
      rotation: Math.random() * 360,
      duration: Math.random() * 60 + 30,
      delay: Math.random() * 10,
      dx: Math.random() * 100 - 50,
      dy: Math.random() * 100 - 50,
    }))
  }

  const generateBranchPaths = (count: number) =>
    Array.from({ length: count }, (_, i) => {
      const sx = Math.random() * 100,
        sy = Math.random() * 100
      const ex = Math.random() * 100,
        ey = Math.random() * 100
      const mx1 = (sx + ex) / 2 + (Math.random() * 30 - 15)
      const my1 = (sy + ey) / 2 + (Math.random() * 30 - 15)
      const mx2 = (sx + ex) / 2 + (Math.random() * 30 - 15)
      const my2 = (sy + ey) / 2 + (Math.random() * 30 - 15)
      return {
        id: i,
        path: `M${sx},${sy} C${mx1},${my1} ${mx2},${my2} ${ex},${ey}`,
        opacity: Math.random() * 0.1 + 0.02,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }
    })

  const generateShapes = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      type: Math.floor(Math.random() * 3),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      opacity: Math.random() * 0.08 + 0.02,
      rotation: Math.random() * 360,
      duration: Math.random() * 40 + 20,
      delay: Math.random() * 8,
    }))

  const generateCodeSnippets = (count: number) => {
    const snippets = [
      "git commit -m 'fix: bug'",
      "npm install",
      "function hello() { }",
      "const x = 42;",
      "<Component />",
      "import React from 'react'",
      "git push origin main",
      "docker build -t app .",
      "SELECT * FROM users",
      "curl https://api.github.com",
    ]
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      text: snippets[Math.floor(Math.random() * snippets.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.15 + 0.05,
      rotation: Math.random() * 30 - 15,
      duration: Math.random() * 50 + 30,
      delay: Math.random() * 10,
    }))
  }

  // Generated once — the page re-renders on every scroll event, and regenerating
  // here made the whole background teleport mid-animation.
  const randomElements = useMemo(() => generateRandomElements(30), [])
  const branchPaths = useMemo(() => generateBranchPaths(15), [])
  const shapes = useMemo(() => generateShapes(10), [])
  const codeSnippets = useMemo(() => generateCodeSnippets(8), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {randomElements.map((element) => (
        <motion.div
          key={`icon-${element.id}`}
          className="absolute"
          style={{
            left: `${element.x}vw`,
            top: `${element.y}vh`,
            opacity: element.opacity,
            rotate: element.rotation,
          }}
          animate={{
            x: [0, element.dx, 0],
            y: [0, element.dy, 0],
            rotate: [
              element.rotation,
              element.rotation + 360,
              element.rotation,
            ],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: element.delay,
          }}
        >
          <element.Icon
            size={element.size}
            className="text-gray-300 dark:text-gh-elevated"
          />
        </motion.div>
      ))}

      <svg className="absolute inset-0 h-full w-full">
        {branchPaths.map((branch) => (
          <motion.path
            key={`branch-${branch.id}`}
            d={branch.path}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-gray-200 dark:text-gh-elevated"
            style={{ opacity: branch.opacity }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: branch.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: branch.delay,
            }}
          />
        ))}
      </svg>

      {shapes.map((shape) => (
        <motion.div
          key={`shape-${shape.id}`}
          className="absolute"
          style={{
            left: `${shape.x}vw`,
            top: `${shape.y}vh`,
            opacity: shape.opacity,
            rotate: shape.rotation,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [shape.opacity, shape.opacity * 1.5, shape.opacity],
            rotate: [shape.rotation, shape.rotation + 180, shape.rotation],
          }}
          transition={{
            duration: shape.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        >
          {shape.type === 0 && (
            <div
              className="rounded-full border border-gray-300 dark:border-gh-elevated"
              style={{ width: shape.size, height: shape.size }}
            />
          )}
          {shape.type === 1 && (
            <div
              className="border border-gray-300 dark:border-gh-elevated"
              style={{ width: shape.size, height: shape.size }}
            />
          )}
          {shape.type === 2 && (
            <div
              className="border border-gray-300 dark:border-gh-elevated"
              style={{
                width: shape.size,
                height: shape.size * 0.866,
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            />
          )}
        </motion.div>
      ))}

      {codeSnippets.map((snippet) => (
        <motion.div
          key={`snippet-${snippet.id}`}
          className="absolute font-mono text-xs text-gray-300 dark:text-gh-elevated"
          style={{
            left: `${snippet.x}vw`,
            top: `${snippet.y}vh`,
            opacity: snippet.opacity,
            rotate: snippet.rotation,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [snippet.opacity, snippet.opacity * 1.5, snippet.opacity],
          }}
          transition={{
            duration: snippet.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: snippet.delay,
          }}
        >
          {snippet.text}
        </motion.div>
      ))}

      <motion.div
        className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full border border-gray-200 opacity-10 dark:border-gh-elevated"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full border border-gray-200 opacity-10 dark:border-gh-elevated"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute left-2/3 top-2/3 h-32 w-32 border border-gray-200 opacity-10 dark:border-gh-elevated"
        animate={{ rotate: [0, 360], opacity: [0.1, 0.15, 0.1] }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          delay: 5,
        }}
      />
    </div>
  )
}
