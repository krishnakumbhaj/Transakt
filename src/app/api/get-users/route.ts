import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export async function GET() {
  try {
    const userFolders = fs.readdirSync(dataDir);
    const users = [];

    for (const folder of userFolders) {
      const detailsPath = path.join(dataDir, folder, 'details.json');
      if (fs.existsSync(detailsPath)) {
        const details = JSON.parse(fs.readFileSync(detailsPath, 'utf-8'));
        users.push(details);
      }
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
