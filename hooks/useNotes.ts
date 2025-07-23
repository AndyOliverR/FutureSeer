import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getNotes, saveNote, Note, getFirebaseDB } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNotes = useCallback(async () => {
    if (!user?.uid) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userNotes = await getNotes(user.uid);
      setNotes(userNotes);
    } catch (err) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  const createNote = async (note: Omit<Note, 'id' | 'uid'>) => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      await saveNote({ ...note, uid: user.uid });
      await refreshNotes();
    } catch (err) {
      setError('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const db = getFirebaseDB();
      if (!db) {
        setError('Database not initialized');
        setLoading(false);
        return;
      }
      await updateDoc(doc(db, 'notes', id), data);
      await refreshNotes();
    } catch (err) {
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const db = getFirebaseDB();
      if (!db) {
        setError('Database not initialized');
        setLoading(false);
        return;
      }
      await deleteDoc(doc(db, 'notes', id));
      await refreshNotes();
    } catch (err) {
      setError('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
  };
} 