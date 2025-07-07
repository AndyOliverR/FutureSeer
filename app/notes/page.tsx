"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { saveNote, getNotes, Note } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function NotesPage() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState("gray")
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const colors = [
    { name: "gray", class: "bg-gray-500/20" },
    { name: "yellow", class: "bg-yellow-500/20" },
    { name: "purple", class: "bg-purple-500/20" },
    { name: "blue", class: "bg-blue-500/20" },
    { name: "green", class: "bg-green-500/20" },
    { name: "pink", class: "bg-pink-500/20" },
  ]

  useEffect(() => {
    if (user?.uid) {
      loadNotes()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadNotes = async () => {
    if (!user?.uid) return
    
    try {
      const userNotes = await getNotes(user.uid)
      setNotes(userNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!user?.uid || !noteTitle.trim() || !newNote.trim()) return

    try {
      if (editingNote) {
        // Update existing note
        await updateDoc(doc(db, 'notes', editingNote.id), {
          title: noteTitle,
          content: newNote,
          color: selectedColor,
          updatedAt: Date.now(),
        })
      } else {
        // Create new note
        await saveNote({
          uid: user.uid,
          title: noteTitle,
          content: newNote,
          color: selectedColor,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      // Reset form and reload notes
      setShowModal(false)
      setEditingNote(null)
      setNewNote("")
      setNoteTitle("")
      setSelectedColor("gray")
      await loadNotes()
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNewNote(note.content)
    setSelectedColor(note.color)
    setShowModal(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!user?.uid) return

    try {
      await deleteDoc(doc(db, 'notes', noteId))
      await loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-soft">Loading your spiritual notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/dashboard" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Spiritual Notes</h1>
          <p className="text-soft leading-relaxed">Record your mystical insights and experiences</p>
        </div>

        {/* New Note Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              setEditingNote(null)
              setNoteTitle("")
              setNewNote("")
              setSelectedColor("gray")
              setShowModal(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:scale-105 transition-transform"
          >
            + New Note
          </button>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-soft/70">No notes yet. Start recording your spiritual insights!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-3 h-3 rounded-full ${colors.find((c) => c.name === note.color)?.class}`}></div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="text-soft/50 hover:text-soft text-sm transition-colors"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-soft/50 hover:text-red-400 text-sm transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className="text-soft font-medium mb-2">{note.title}</h3>
                <p className="text-soft/70 text-sm leading-relaxed mb-4 line-clamp-3">{note.content}</p>
                <div className="text-soft/50 text-xs">{formatDate(note.updatedAt)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-xl gold-glow mb-6">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h3>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 mb-4"
              />
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your insights..."
                className="w-full h-32 bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 resize-none focus:outline-none focus:border-yellow-400 mb-4"
              />
              <div className="flex space-x-2 mb-6">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-6 h-6 rounded-full ${color.class} ${selectedColor === color.name ? "ring-2 ring-yellow-400" : ""}`}
                  />
                ))}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingNote(null)
                    setNoteTitle("")
                    setNewNote("")
                    setSelectedColor("gray")
                  }}
                  className="flex-1 py-3 glass-card rounded-2xl text-soft hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!noteTitle.trim() || !newNote.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
