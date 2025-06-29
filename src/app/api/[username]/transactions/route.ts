import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  // Await the params since they're now a Promise in newer Next.js versions
  const { username } = await context.params;
  const userDir = path.join(process.cwd(), 'data', username);

  const detailsPath = path.join(userDir, 'details.json');
  const txnPath = path.join(userDir, 'transactions.json');

  try {
    if (!fs.existsSync(detailsPath)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = JSON.parse(fs.readFileSync(detailsPath, 'utf-8'));
    const transactions = fs.existsSync(txnPath)
      ? JSON.parse(fs.readFileSync(txnPath, 'utf-8'))
      : [];

    return NextResponse.json({ user, transactions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
