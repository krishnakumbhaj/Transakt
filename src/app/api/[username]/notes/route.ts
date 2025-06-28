// src/app/api/[username]/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(_: NextRequest, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const notesPath = path.join(process.cwd(), 'data', username, 'notes.json');

  try {
    const exists = await fs.stat(notesPath).catch(() => null);
    if (!exists) return NextResponse.json({ notes: [] });

    const data = await fs.readFile(notesPath, 'utf-8');
    return NextResponse.json({ notes: JSON.parse(data) });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const body = await req.json();
  const notesPath = path.join(process.cwd(), 'data', username, 'notes.json');

  try {
    await fs.mkdir(path.join(process.cwd(), 'data', username), { recursive: true });

    let notes: any[] = [];
    try {
      const fileData = await fs.readFile(notesPath, 'utf-8');
      notes = JSON.parse(fileData);
    } catch {
      notes = [];
    }

    if (!body.content || body.content.trim() === '') {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    const newNote = {
      id: Date.now().toString(),
      content: body.content,
      createdAt: new Date().toISOString()
    };

    notes.push(newNote);

    await fs.writeFile(notesPath, JSON.stringify(notes, null, 2));
    return NextResponse.json({ message: 'Note saved successfully', note: newNote });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get('id');
  const notesPath = path.join(process.cwd(), 'data', username, 'notes.json');

  if (!noteId) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  try {
    const data = await fs.readFile(notesPath, 'utf-8');
    const notes = JSON.parse(data);

    const updatedNotes = notes.filter((note: any) => note.id !== noteId);

    await fs.writeFile(notesPath, JSON.stringify(updatedNotes, null, 2));
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
