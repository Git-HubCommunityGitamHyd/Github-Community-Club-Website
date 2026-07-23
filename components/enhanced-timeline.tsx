"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRef } from "react"

interface TimelineItem {
  date: string
  title: string
  description: string
}

interface EnhancedTimelineProps {
  items: TimelineItem[]
}

export function EnhancedTimeline({ items }: EnhancedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div ref={containerRef} className="relative">
      {/* Animated timeline line */}
      <div className="absolute left-4 h-full w-1 -translate-x-1/2 transform overflow-hidden rounded-full bg-gray-200 dark:bg-gh-elevated md:left-1/2">
        <motion.div
          className="w-full rounded-full bg-gradient-to-b from-black via-gray-600 to-black dark:from-gh-accent dark:via-gh-muted dark:to-gh-accent"
          style={{ height: lineHeight }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          viewport={{ once: true }}
          className={`relative mb-12 flex items-center ${index % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
        >
          <div
            className={`w-full pl-12 md:w-5/12 ${index % 2 === 0 ? "md:pl-0 md:pr-8 md:text-right" : "md:pl-8"}`}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-gray-200 bg-white transition-all duration-300 hover:border-black hover:shadow-xl hover:shadow-black/10 dark:border-gh-border dark:bg-gh-surface dark:hover:border-gh-accent dark:hover:shadow-black/40">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-gh-elevated dark:to-gh-surface"
                  initial={false}
                />
                <CardHeader className="relative z-10">
                  <motion.div
                    whileHover={{ x: index % 2 === 0 ? -5 : 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="text-xl text-gray-900 transition-colors duration-300 group-hover:text-black dark:text-gh-text dark:group-hover:text-white">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-black dark:text-gh-accent">
                      {item.date}
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.p
                    className="text-gray-600 transition-colors duration-300 group-hover:text-gray-800 dark:text-gh-muted dark:group-hover:text-gh-text"
                    whileHover={{ x: index % 2 === 0 ? -3 : 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.description}
                  </motion.p>
                </CardContent>
                <motion.div
                  className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{
                    x: "200%",
                    transition: { duration: 0.8, ease: "easeInOut" },
                  }}
                />
              </Card>
            </motion.div>
          </div>

          {/* Timeline dot */}
          <motion.div
            className="absolute left-4 z-20 -translate-x-1/2 transform md:left-1/2"
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-black shadow-lg dark:border-gh-bg dark:bg-gh-accent"
              whileHover={{
                scale: 1.5,
                boxShadow: "0 0 20px rgba(88,166,255,0.4)",
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-black dark:bg-gh-accent"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.3,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
