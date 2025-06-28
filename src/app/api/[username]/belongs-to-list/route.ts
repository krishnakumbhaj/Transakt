import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(_: any, { params }: { params: { username: string } }) {
  const { username } = params;

  try {
    const filePath = path.join(process.cwd(), 'data', 'users', `${username}.json`);
    const fileData = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(fileData);

    const belongsToList = [
      ...new Set(
        parsed.transactions
          .slice() // clone to avoid mutating original
          .reverse() // reverse order
          .map((txn: any) => txn.belongsTo)
      )
    ];

    return NextResponse.json({ belongsTo: belongsToList });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'User not found or error reading data' }, { status: 500 });
  }
}
