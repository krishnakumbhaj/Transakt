// src/app/page.tsx
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export default function Home() {
  const dataDir = path.join(process.cwd(), 'data');
  let userExists = false;

  try {
    const files = fs.readdirSync(dataDir);
    userExists = files.length > 0;
  } catch {
    userExists = false;
  }

  // Redirect based on user data
  if (userExists) {
    redirect('/users');
  } else {
    redirect('/create-user');
  }
}
