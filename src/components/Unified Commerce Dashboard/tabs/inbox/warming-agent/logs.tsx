"use client";

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, Mail, ShieldAlert, Play, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  created_at: string;
  status: 'sent' | 'failed';
  generated_subject: string;
  generated_body?: string;
  error_message?: string;
  cadence_name?: string;
  clients: { 
    "Client ID": string;
    "Client": string; 
    email: string; 
  } | null;
}

export function WarmingAgentLog() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/warming-agent/log');
      const data = await response.json();
      
      if (data.success) {
        setLogEntries(data.logEntries || []);
      } else {
        toast.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerWarmingAgent = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/warming-agent/log', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Warming agent completed! Processed ${data.processed} clients, ${data.successful} successful.`);
        // Refresh the logs after running
        await fetchLogs();
      } else {
        toast.error(data.error || 'Failed to run warming agent');
      }
    } catch (error) {
      console.error('Error triggering warming agent:', error);
      toast.error('Failed to run warming agent');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading Agent Activity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-500" />
              Automated Warming Agent Activity
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              History of AI-driven emails sent to nurture client relationships.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={triggerWarmingAgent}
              disabled={isRunning}
             variant="default"
            >
              <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? 'Running...' : 'Test Run Agent'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {logEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No activity yet</p>
            <p className="text-sm">The warming agent hasn't run yet. Click "Test Run Agent" to try it out.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Cadence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="font-medium">{entry.clients?.Client || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{entry.clients?.email || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-800 max-w-xs truncate">
                    {entry.generated_subject}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {entry.cadence_name || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      entry.status === 'sent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.status === 'sent' ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <ShieldAlert className="h-3 w-3" />
                      )}
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {entry.status === 'failed' && entry.error_message && (
                      <div className="text-xs text-red-600 max-w-xs truncate" title={entry.error_message}>
                        {entry.error_message}
                      </div>
                    )}
                    {entry.status === 'sent' && entry.generated_body && (
                      <button 
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          navigator.clipboard.writeText(entry.generated_body || '');
                          toast.success('Email content copied to clipboard');
                        }}
                      >
                        Copy Content
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}