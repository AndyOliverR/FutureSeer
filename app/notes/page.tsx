"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotes } from "@/hooks/useNotes"
import { Note } from "@/lib/firebase"
import { Header } from "@/components/header"

export default function NotesPage() {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes()
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>("gray")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const colors = [
    { name: "gray", class: "bg-gray-500/20", border: "border-gray-500/30" },
    { name: "yellow", class: "bg-yellow-500/20", border: "border-yellow-500/30" },
    { name: "purple", class: "bg-purple-500/20", border: "border-purple-500/30" },
    { name: "blue", class: "bg-blue-500/20", border: "border-blue-500/30" },
    { name: "green", class: "bg-green-500/20", border: "border-green-500/30" },
    { name: "pink", class: "bg-pink-500/20", border: "border-pink-500/30" },
  ]

  const handleSaveNote = async () => {
    const title = noteTitle.trim()
    const content = newNote.trim()
    if (!title || !content) return

    setIsSubmitting(true)
    try {
      if (editingNote?.id) {
        // Update existing note
        await updateNote(editingNote.id, {
          title,
          content,
          color: selectedColor,
          updatedAt: Date.now(),
        })
      } else {
        // Create new note
        await createNote({
          title,
          content,
          color: selectedColor,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      // Reset form
      setShowModal(false)
      setEditingNote(null)
      setNewNote("")
      setNoteTitle("")
      setSelectedColor("gray")
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title ?? "")
    setNewNote(note.content ?? "")
    setSelectedColor(note.color ?? "gray")
    setShowModal(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId)
    }
  }

  const formatDate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  // Cosmic Loader Component
  const CosmicLoader = () => (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl mb-6"
        >
          🌟
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-soft text-lg"
        >
          Loading your spiritual notes...
        </motion.p>
      </div>
    </div>
  )

  if (loading) {
    return <CosmicLoader />
  }

  return (
    <div className="min-h-screen overflow-hidden starfield-ultra-sharp relative">
      <Header />
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-8"
        >
          <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4">Spiritual Notes</h1>
          <h2 className="text-slate-300 font-serif leading-relaxed">Record your mystical insights and experiences</h2>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-center font-serif"
          >
            {error}
          </motion.div>
        )}

        {/* New Note Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingNote(null)
              setNoteTitle("")
              setNewNote("")
              setSelectedColor("gray")
              setShowModal(true)
            }}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-glow"
          >
            ✨ New Note
          </motion.button>
        </motion.div>

        {/* Notes Grid */}
        <AnimatePresence>
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                📝
              </motion.div>
              <p className="text-amber-200 font-serif text-lg mb-4">No notes yet</p>
              <p className="text-slate-300 font-serif">Start recording your spiritual insights and experiences</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl card-glow ${colors.find((c) => c.name === (note.color ?? 'gray'))?.border}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-4 h-4 rounded-full ${colors.find((c) => c.name === (note.color ?? 'gray'))?.class}`}></div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditNote(note)}
                        className="text-slate-400 hover:text-amber-200 text-lg transition-colors duration-200"
                      >
                        ✏️
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => note.id && handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-red-400 text-lg transition-colors duration-200"
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </div>
                  <h3 className="text-amber-200 font-serif font-semibold mb-3 text-lg">{note.title}</h3>
                  <p className="text-slate-300 font-serif text-sm leading-relaxed mb-4 line-clamp-4">{note.content}</p>
                  <div className="text-slate-400 font-serif text-xs flex items-center">
                    <span className="mr-2">🕐</span>
                    {formatDate(note.updatedAt ?? 0)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="backdrop-blur-md bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-6 text-center">
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-2xl p-4 text-amber-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 input-glow"
                  />
                  
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write your insights..."
                    className="w-full h-32 bg-slate-800/50 border border-slate-600 rounded-2xl p-4 text-amber-100 placeholder:text-slate-400 resize-none focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 input-glow"
                  />
                  
                  <div className="flex justify-center space-x-3">
                    {colors.map((color) => (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color.name ? color.name : "gray")}
                        className={`w-8 h-8 rounded-full ${color.class} ${selectedColor === color.name ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900" : ""} transition-all duration-200`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowModal(false)
                      setEditingNote(null)
                      setNoteTitle("")
                      setNewNote("")
                      setSelectedColor("gray")
                    }}
                    className="flex-1 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-slate-300 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveNote}
                    disabled={!noteTitle.trim() || !newNote.trim() || isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 button-glow"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      editingNote ? 'Update Note' : 'Save Note'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
