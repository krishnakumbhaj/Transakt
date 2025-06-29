import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const userDir = path.join(process.cwd(), 'data', username);

  try {
    await fs.rm(userDir, { recursive: true, force: true });
    return NextResponse.json({ message: `User "${username}" deleted successfully.` });
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
