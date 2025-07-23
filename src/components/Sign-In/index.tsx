"use client"
import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Github } from 'lucide-react';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/app');
      } else {
        console.log(result);
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_github',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/app',
      });
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/app',
      });
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred');
    }
  };

  return (
		<div 
		className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
		style={{
			background: 'linear-gradient(to bottom right, #fdf6ff, #f0f4ff, #fdf6ff)',
		}}
	>
		{/* Subtle gear-like circles */}
		<svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
			<defs>
				<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{ stopColor: '#e0c3fc', stopOpacity: 0.1 }} />
					<stop offset="100%" style={{ stopColor: '#8ec5fc', stopOpacity: 0.1 }} />
				</linearGradient>
				<linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style={{ stopColor: '#f093fb', stopOpacity: 0.08 }} />
					<stop offset="100%" style={{ stopColor: '#f5576c', stopOpacity: 0.08 }} />
				</linearGradient>
			</defs>
			
			{/* Large circle - top right */}
			<circle 
				cx="85%" 
				cy="15%" 
				r="25%" 
				fill="none" 
				stroke="url(#grad1)" 
				strokeWidth="1"
				opacity="0.4"
			/>
			<circle 
				cx="85%" 
				cy="15%" 
				r="24.5%" 
				fill="none" 
				stroke="url(#grad1)" 
				strokeWidth="0.5"
				opacity="0.3"
			/>
			
			{/* Medium circle - bottom left */}
			<circle 
				cx="15%" 
				cy="85%" 
				r="20%" 
				fill="none" 
				stroke="url(#grad2)" 
				strokeWidth="1"
				opacity="0.4"
			/>
			<circle 
				cx="15%" 
				cy="85%" 
				r="19.5%" 
				fill="none" 
				stroke="url(#grad2)" 
				strokeWidth="0.5"
				opacity="0.3"
			/>
			
			{/* Small circle - center */}
			<circle 
				cx="50%" 
				cy="50%" 
				r="15%" 
				fill="none" 
				stroke="url(#grad1)" 
				strokeWidth="1"
				opacity="0.3"
			/>
			<circle 
				cx="50%" 
				cy="50%" 
				r="14.5%" 
				fill="none" 
				stroke="url(#grad1)" 
				strokeWidth="0.5"
				opacity="0.2"
			/>
			
			{/* Additional subtle circles for depth */}
			<circle 
				cx="70%" 
				cy="70%" 
				r="18%" 
				fill="none" 
				stroke="url(#grad2)" 
				strokeWidth="0.5"
				opacity="0.2"
			/>
			<circle 
				cx="30%" 
				cy="30%" 
				r="12%" 
				fill="none" 
				stroke="url(#grad1)" 
				strokeWidth="0.5"
				opacity="0.2"
			/>
		</svg>
		
		<Card className="w-full max-w-md relative z-10 bg-white border border-gray-200 shadow-xl">
			<CardHeader className="text-center space-y-1">
				<CardTitle className="text-2xl font-bold">Sign in to Clerk</CardTitle>
				<CardDescription className="text-gray-600">
					Welcome back! Please sign in to continue
				</CardDescription>
			</CardHeader>
			
			<CardContent className="space-y-4">
				{/* Google OAuth Button */}
				<Button 
					variant="outline" 
					onClick={handleGoogleSignIn}
					className="w-full h-11 text-base font-normal border-gray-300 hover:bg-gray-50"
				>
					<svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					Google
				</Button>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<Separator />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-gray-500">or</span>
					</div>
				</div>

				{/* Email/Password Form */}
				<div className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium text-gray-700">
							Email address
						</label>
						<Input
							id="email"
							type="email"
							placeholder="Enter your email address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="transition-all duration-200 focus:ring-purple-500"
						/>
					</div>

												<Button 
						onClick={handleSubmit}
						className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200"
						disabled={loading}
					>
						{loading ? (
							<span className="flex items-center">
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Signing in...
							</span>
						) : 'Continue'}
					</Button>

					<div className="text-center">
						<button 
							type="button"
							className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
							onClick={() => console.log('Use passkey')}
						>
							Use passkey instead
						</button>
					</div>
				</div>

				{error && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{error}
					</div>
				)}

				<div className="text-center text-sm pt-4">
					<span className="text-gray-600">Don't have an account? </span>
					<button 
						className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
						onClick={() => console.log('Navigate to sign up')}
					>
						Sign up
					</button>
				</div>

				<div className="text-center text-xs text-gray-500 pt-2">
					Secured by{' '}
					<span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
						Clerk
					</span>
				</div>
			</CardContent>
		</Card>
	</div>
);
}