// src/components/klaviyo/AccountCard.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, Check, AlertCircle, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { KlaviyoAccount } from '@/lib/klaviyo/oath-utils';

interface AccountCardProps {
  account: KlaviyoAccount;
  onDisconnect: () => void;
}

export default function KlaviyoAccountCard({ account, onDisconnect }: AccountCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/klaviyo/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: account.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Klaviyo account');
      }

      // Close the dialog and call the onDisconnect callback
      setDialogOpen(false);
      onDisconnect();
    } catch (error: any) {
      setError(error.message || 'An error occurred while disconnecting the account');
    } finally {
      setLoading(false);
    }
  };

  // Calculate if the token is valid or expired
  const now = new Date();
  const isExpired = now > account.tokenExpiresAt;
  const formattedExpiryDate = format(account.tokenExpiresAt, 'PPpp');
  
  // Format the connected date
  const formattedConnectedDate = format(account.createdAt, 'PPp');

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Klaviyo Integration</CardTitle>
            <CardDescription>
              Connected on {formattedConnectedDate}
            </CardDescription>
          </div>
          <Badge variant={isExpired ? 'destructive' : 'default'}>
            {isExpired ? 'Expired' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpired && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Expired</AlertTitle>
            <AlertDescription>
              Your Klaviyo authentication has expired. Please reconnect your account.
            </AlertDescription>
          </Alert>
        )}
        
        {!isExpired && (
          <Alert variant="default">
            <Check className="h-4 w-4" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Your Klaviyo account is connected and working properly.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Connection Status:</span>
            <span className="text-sm font-medium">
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Token Expires:</span>
            <span className="text-sm font-medium">
              {formattedExpiryDate}
            </span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Permissions:</span>
            <div className="flex flex-wrap justify-end gap-1">
              {account.scopes.split(' ').map((scope) => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full" size="sm">
              <Trash className="h-4 w-4 mr-2" />
              Disconnect Klaviyo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect Klaviyo Integration</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect your Klaviyo account? This will revoke all access tokens 
                and remove the integration. You will need to reconnect if you want to use Klaviyo features again.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleDisconnect} disabled={loading}>
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}