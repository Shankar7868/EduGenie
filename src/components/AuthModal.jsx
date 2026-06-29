import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AuthModal({ trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the login link!');
        setIsOpen(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsOpen(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp ? 'Enter your details to sign up for EduGenie.' : 'Enter your credentials to access your workspace.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleAuth} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary/50 focus:bg-background"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-secondary/50 focus:bg-background"
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }} 
            className="ml-1 text-indigo-500 hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
