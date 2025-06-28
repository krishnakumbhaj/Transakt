import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const body = await req.json();

  try {
    const userDir = path.join(process.cwd(), 'data', username);
    const detailsPath = path.join(userDir, 'details.json');
    const transactionsPath = path.join(userDir, 'transactions.json');

    const userExists = await fs.stat(detailsPath).catch(() => null);
    if (!userExists) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let transactions: any[] = [];
    try {
      const data = await fs.readFile(transactionsPath, 'utf-8');
      transactions = JSON.parse(data);
    } catch {
      transactions = [];
    }

    const newTxn = {
      ...body,
      id: Date.now().toString(),
    };

    // Add the newest transaction to the top
    transactions.unshift(newTxn);

    await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2));

    return NextResponse.json({ message: 'Transaction added successfully', id: newTxn.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
