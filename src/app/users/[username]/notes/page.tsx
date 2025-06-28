'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function UserNotesPage() {
  const { username } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/${username}/notes`)
      .then(res => res.json())
      .then(data => {
        setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notes:', err);
        setLoading(false);
      });
  }, [username]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const res = await fetch(`/api/${username}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotes(prev => [data.note, ...prev]);
      setNewNote('');
    } else {
      alert(data.message || 'Failed to add note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/${username}/notes?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      setNotes(prev => prev.filter(note => note.id !== id));
    } else {
      alert(data.message || 'Failed to delete note');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-700 mb-6">📝 Notes</h1>

        <div className="mb-6">
          <textarea
            className="w-full border border-yellow-300 rounded-lg p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black"
            rows={3}
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write a new note..."
          />
          <button
            onClick={handleAddNote}
            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
          >
            ➕ Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-gray-600">No notes yet. Start writing one!</p>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <div key={note.id} className="p-4 bg-white shadow rounded-lg border-l-4 border-yellow-400">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:underline text-sm ml-4"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
