import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'ReelBook — Cinema tickets', description: 'Book demo cinema tickets with a mobile OTP.' };
/** Wraps every booking workflow view with global document metadata. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element { return <html lang="en"><body>{children}</body></html>; }
