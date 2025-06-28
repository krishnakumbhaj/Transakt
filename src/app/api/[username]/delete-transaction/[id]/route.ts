import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; id: string }> }
) {
  // Await the params before destructuring
  const { username, id } = await params;
  const txnPath = path.join(process.cwd(), 'data', username, 'transactions.json');

  try {
    const data = await fs.readFile(txnPath, 'utf-8');
    const transactions = JSON.parse(data);

    const updated = transactions.filter((txn: any) => txn.id !== id);

    if (updated.length === transactions.length) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    await fs.writeFile(txnPath, JSON.stringify(updated, null, 2));

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}