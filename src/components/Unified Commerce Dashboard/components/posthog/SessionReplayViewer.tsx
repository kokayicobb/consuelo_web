import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Calendar,
  Clock,
  User,
  RefreshCw,
  Eye,
  X,
  ExternalLink,
  Search,
  AlertTriangle,
  Download,
  Maximize2,
  Settings,
} from "lucide-react";

interface SessionRecording {
  id: string;
  distinct_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  click_count: number;
  keypress_count: number;
  mouse_activity_count: number;
  active_seconds: number;
  inactive_seconds: number;
  console_log_count: number;
  console_warn_count: number;
  console_error_count: number;
  person?: {
    properties: {
      email?: string;
      name?: string;
    };
  };
}

// PostHog Player Component
const PostHogPlayer = ({ recordingId }: { recordingId: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [snapshots, setSnapshots] = useState<any>(null);

  useEffect(() => {
    if (recordingId) {
      fetchRecordingData(recordingId);
    }
  }, [recordingId]);

  const fetchRecordingData = async (id: string) => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Fetch recording snapshots from your API
      const response = await fetch(`/api/posthog/recordings/${id}/snapshots`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recording data');
      }
      
      const data = await response.json();
      setSnapshots(data);
      setIsLoading(false);
      
      // Initialize rrweb player here if you have the snapshots
      // You would need to install rrweb-player: npm install rrweb-player
      // import rrwebPlayer from 'rrweb-player';
      // new rrwebPlayer({ target: document.getElementById('player'), data: snapshots });
      
    } catch (error) {
      console.error('Error fetching recording:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const openInPostHog = () => {
    const posthogUrl = `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/project/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID}/replay/${recordingId}`;
    window.open(posthogUrl, "_blank");
  };

  const downloadRecording = async () => {
    try {
      const response = await fetch(`/api/posthog/recordings/${recordingId}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${recordingId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading recording:', error);
    }
  };

  if (!recordingId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-700">
            Select a recording to watch
          </h3>
          <p className="text-sm text-gray-500">
            Choose a session from the list to start watching the replay
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Player Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-gray-700">
            Session Recording
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRecordingData(recordingId)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadRecording}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={openInPostHog}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Player Area */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
              <p className="mb-2 text-gray-600">Loading session replay...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
            <div className="max-w-md p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Unable to Load Recording
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                This recording cannot be loaded directly. You can watch it in PostHog or download the data.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={openInPostHog}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Watch in PostHog
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadRecording}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Recording Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Player Container */}
        {!isLoading && !hasError && (
          <div id="player" className="h-full w-full">
            {/* rrweb player will be mounted here */}
            <div className="flex h-full items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="mb-4 text-6xl">🎬</div>
                <h3 className="mb-2 text-lg font-medium text-gray-700">
                  Player Implementation Required
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  To display recordings directly, you need to:
                </p>
                <ol className="text-left text-sm text-gray-600 space-y-2 max-w-md mx-auto">
                  <li>1. Install rrweb-player: <code className="bg-gray-100 px-1 py-0.5 rounded">npm install rrweb-player</code></li>
                  <li>2. Import and initialize the player with snapshot data</li>
                  <li>3. Or use PostHog's official React SDK for easier integration</li>
                </ol>
                <div className="mt-6">
                  <Button onClick={openInPostHog} className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Watch in PostHog Instead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Session List Item Component (unchanged from your original)
const SessionListItem = ({
  recording,
  isSelected,
  onClick,
}: {
  recording: SessionRecording;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getCountryFlag = (id: string) => {
    const flags = ["🇺🇸", "🇬🇧", "🇨🇦", "🇩🇪", "🇫🇷", "🇦🇺"];
    return flags[id.length % flags.length];
  };

  return (
    <div
      className={`cursor-pointer border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 ${
        isSelected ? "border-l-4 border-l-blue-500 bg-blue-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {getCountryFlag(recording.distinct_id)}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">
              {recording.distinct_id.slice(0, 8)}...
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-1 py-0 text-xs">
            {recording.click_count}
          </Badge>
          <Badge variant="outline" className="px-1 py-0 text-xs">
            {recording.keypress_count}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatDuration(recording.duration)}
          </span>
        </div>
      </div>

      <div className="mb-1 text-xs text-gray-600">
        {recording.person?.properties?.email || "www.consuelohq.com/app"}
      </div>

      <div className="text-xs text-gray-500">
        {formatDate(recording.start_time)}
      </div>

      {recording.console_error_count > 0 && (
        <div className="mt-1">
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {recording.console_error_count} errors
          </Badge>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function SessionReplayViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    duration_filter: "all",
    search: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchRecordings();
    }
  }, [isOpen]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/posthog/recordings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        setRecordings(data.results || []);
        // Auto-select first recording
        if (data.results?.length > 0 && !selectedRecordingId) {
          setSelectedRecordingId(data.results[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent shadow-none hover:bg-slate-100"
        >
          <Eye className="mr-2 h-4 w-4" />
          Sessions
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-hidden p-0">
        <div className="flex h-[90vh]">
          {/* Left Sidebar - Session List */}
          <div className="flex w-80 flex-col border-r bg-white">
            {/* Header */}
            <div className="border-b bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recordings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search recordings..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="h-9 pl-8"
                  />
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filters.duration_filter}
                    onValueChange={(value) =>
                      setFilters({ ...filters, duration_filter: value })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All durations</SelectItem>
                      <SelectItem value="short">&lt; 1 min</SelectItem>
                      <SelectItem value="medium">1-5 min</SelectItem>
                      <SelectItem value="long">&gt; 5 min</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRecordings}
                    disabled={loading}
                    className="h-9"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
                  Loading recordings...
                </div>
              ) : recordings.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="mb-2">📹</div>
                  <div className="text-sm">No recordings found</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Users need to interact with your site first
                  </div>
                </div>
              ) : (
                recordings.map((recording) => (
                  <SessionListItem
                    key={recording.id}
                    recording={recording}
                    isSelected={selectedRecordingId === recording.id}
                    onClick={() => setSelectedRecordingId(recording.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Side - PostHog Player */}
          <PostHogPlayer recordingId={selectedRecordingId || ""} />
        </div>
      </DialogContent>
    </Dialog>
  );
}