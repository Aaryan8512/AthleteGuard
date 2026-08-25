import * as React from 'react';
import { authenticate } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuthPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [registering, setRegistering] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { await authenticate({ name: registering ? name : undefined, email, password }); onAuthenticated(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Authentication failed.'); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-background bg-grid px-4"><form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"><div><h1 className="text-xl font-bold text-foreground">AthleteGuard</h1><p className="mt-1 text-sm text-muted-foreground">Sign in to your athlete account</p></div>{registering && <Input required placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />}{<Input required type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />}{<Input required minLength={8} type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />}{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full">{registering ? 'Create account' : 'Sign in'}</Button><button type="button" className="w-full text-sm text-primary" onClick={() => setRegistering(!registering)}>{registering ? 'Already have an account? Sign in' : 'Create an athlete account'}</button></form></main>;
}
