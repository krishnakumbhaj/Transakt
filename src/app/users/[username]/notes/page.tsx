'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Search, MoreVertical } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function UserNotesPage() {
  const { username } = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    
    try {
      const res = await fetch(`/api/${username}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
        setIsAddingNote(false);
      } else {
        alert(data.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/${username}/notes?id=${id}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotes(prev => prev.filter(note => note.id !== id));
        setSelectedNote(null);
      } else {
        alert(data.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getRandomColor = () => {
    const colors = [
      'bg-yellow-100 border-yellow-200',
      'bg-blue-100 border-blue-200',
      'bg-green-100 border-green-200',
      'bg-pink-100 border-pink-200',
      'bg-purple-100 border-purple-200',
      'bg-orange-100 border-orange-200',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg border-b border-amber-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white hover:bg-amber-50 rounded-full transition-all duration-200 shadow-md hover:shadow-lg border border-amber-200 hover:border-amber-300"
            >
              <ArrowLeft className="w-5 h-5 text-amber-700" />
            </button>
            <h1 className="text-2xl font-bold text-amber-800 drop-shadow-sm">📝 My Notes</h1>
          </div>
          <button
            onClick={() => setIsAddingNote(true)}
            className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all duration-200 shadow-md text-gray-700 placeholder-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="p-4 bg-gradient-to-br from-amber-25 via-yellow-25 to-orange-25 min-h-screen">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-bounce">📝</div>
            <h2 className="text-2xl font-bold text-amber-700 mb-2">
              {searchQuery ? 'No notes found' : 'Start Your Journey'}
            </h2>
            <p className="text-amber-600 text-lg">
              {searchQuery ? 'Try a different search term' : 'Create your first note and capture your thoughts'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-5 rounded-2xl border-2 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1 ${getRandomColor()} backdrop-blur-sm`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="space-y-3">
                  <p className="text-gray-800 whitespace-pre-wrap break-words font-medium leading-relaxed">
                    {truncateText(note.content)}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 bg-white bg-opacity-60 px-2 py-1 rounded-full">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">New Note</h2>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Take a note..."
                className="w-full h-40 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Note</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap break-words mb-4">
                {selectedNote.content}
              </p>
              <p className="text-sm text-gray-500">
                Created: {new Date(selectedNote.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this note?')) {
                    handleDeleteNote(selectedNote.id);
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}