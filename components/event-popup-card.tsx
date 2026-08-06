"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, Users, ImageIcon, Clock } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PopupCard } from "./popup-card"
import { AutoScrollGallery } from "./auto-scroll-gallery"

interface EventPopupCardProps {
  event: {
    title: string
    date: string
    location?: string
    attendees?: number
    description: string
    images: string[]
    category: string
    duration?: string
  }
  index: number
}

export function EventPopupCard({ event, index }: EventPopupCardProps) {
  const frontContent = (
    <Card className="h-full border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-gh-border dark:from-gh-surface dark:to-gh-elevated dark:hover:border-gh-muted dark:hover:shadow-black/40">
      <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
        <CardTitle className="mb-4 text-xl leading-tight text-gray-900 dark:text-gh-text">
          {event.title}
        </CardTitle>

        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-center text-gray-600 dark:text-gh-muted">
            <span className="text-sm font-medium">{event.date}</span>
          </div>
          {event.location && (
            <div className="flex items-center justify-center text-gray-600 dark:text-gh-muted">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
          {event.attendees && (
            <div className="flex items-center justify-center text-gray-600 dark:text-gh-muted">
              <Users className="mr-2 h-4 w-4" />
              <span className="text-sm">{event.attendees} attendees</span>
            </div>
          )}
        </div>

        <Badge
          variant="secondary"
          className="mb-4 px-3 py-1 dark:border-gh-border dark:bg-gh-elevated dark:text-gh-text"
        >
          {event.category}
        </Badge>

        <motion.div
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gh-muted"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ImageIcon className="h-4 w-4" />
          Click to see details
        </motion.div>
      </CardContent>
    </Card>
  )

  const backContent = (
    <div className="flex h-full flex-col md:min-h-[700px]">
      {/* Header */}
      <div className="mb-8">
        <motion.h3
          className="mb-4 break-words pr-10 text-2xl font-bold text-gray-900 dark:text-gh-text md:mb-6 md:pr-0 md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {event.title}
        </motion.h3>

        <motion.div
          className="mb-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gh-muted md:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            {event.date}
          </div>
          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5" />
              {event.location}
            </div>
          )}
          {event.attendees && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              {event.attendees} attendees
            </div>
          )}
          {event.duration && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              {event.duration}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Badge
            variant="outline"
            className="border-black px-4 py-2 text-sm text-black dark:border-gh-accent dark:text-gh-accent md:px-6 md:py-3 md:text-base"
          >
            {event.category}
          </Badge>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gh-text md:mb-6 md:text-2xl">
          Event Details
        </h4>
        <p className="text-base leading-relaxed text-gray-600 dark:text-gh-muted md:text-xl">
          {event.description}
        </p>
      </motion.div>

      {/* Gallery — only rendered when images exist */}
      {event.images.length > 0 && (
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <h4 className="mb-6 flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gh-text md:mb-8 md:text-2xl">
            <ImageIcon className="h-5 w-5 md:h-6 md:w-6" />
            Event Gallery
          </h4>
          <AutoScrollGallery images={event.images} title={event.title} />
        </motion.div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full min-h-80"
    >
      <PopupCard
        frontContent={frontContent}
        backContent={backContent}
        cardId={`event-${index}`}
        className="h-full"
      />
    </motion.div>
  )
}
