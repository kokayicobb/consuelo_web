'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loader from '@/components/Common/Loader';

// Enhanced universal lead interface
interface Lead {
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  description?: string;
  image?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  additional_info?: string;
  lead_score: number;
  source_url: string;
}

interface Book {
  title: string;
  price: string;
  image: string;
  inStock: string;
  link: string;
}

type LeadData = Lead | Book;

interface ScrapeResponse {
  success: boolean;
  data: LeadData[];
  count: number;
  type: string;
  source_url: string;
  live_view_url?: string;
  session_id?: string;
  error?: string;
}

export default function ScraperPage() {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);
  const [scrapeType, setScrapeType] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [industry, setIndustry] = useState<string>('general');
  const [liveViewUrl, setLiveViewUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to scrape');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          industry: industry
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      // Try to parse JSON
      let result: ScrapeResponse;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (result.success) {
        setLeads(result.data || []);
        setScrapeType(result.type || 'unknown');
        setLastScrapeTime(new Date());
        setLiveViewUrl(result.live_view_url || null);
        setSessionId(result.session_id || null);
      } else {
        setError(result.error || 'Failed to scrape data');
      }
    } catch (err) {
      console.error('Scraping error:', err);
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getLeadScoreBadgeVariant = (score: number) => {
    if (score >= 70) return 'default';  // High quality
    if (score >= 50) return 'secondary'; // Medium quality
    return 'outline'; // Low quality
  };

  const renderLeadCard = (lead: LeadData, index: number) => {
    // Check if it's a book (for backward compatibility)
    if ('title' in lead && 'price' in lead) {
      const book = lead as Book;
      return (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={book.image.startsWith('http') ? book.image : `https://books.toscrape.com/${book.image}`}
              alt={book.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm" title={book.title}>
              {book.title.length > 50 ? `${book.title.substring(0, 50)}...` : book.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-green-600">
                {book.price}
              </span>
              <Badge variant={book.inStock.toLowerCase().includes('in stock') ? 'default' : 'secondary'}>
                {book.inStock}
              </Badge>
            </div>
            {book.link && (
              <a
                href={book.link.startsWith('http') ? book.link : `https://books.toscrape.com/${book.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View Details
              </a>
            )}
          </CardContent>
        </Card>
      );
    }

    // Standard lead card
    const leadData = lead as Lead;
    return (
      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            {leadData.image && (
              <img
                src={leadData.image}
                alt={leadData.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{leadData.name}</CardTitle>
              {leadData.title && (
                <CardDescription>{leadData.title}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leadData.company && <p className="text-sm"><strong>Company:</strong> {leadData.company}</p>}
            {leadData.email && (
              <p className="text-sm">
                <strong>Email:</strong> 
                <a href={`mailto:${leadData.email}`} className="text-blue-600 hover:underline ml-1">
                  {leadData.email}
                </a>
              </p>
            )}
            {leadData.phone && (
              <p className="text-sm">
                <strong>Phone:</strong> 
                <a href={`tel:${leadData.phone}`} className="text-blue-600 hover:underline ml-1">
                  {leadData.phone}
                </a>
              </p>
            )}
            {leadData.location && <p className="text-sm"><strong>Location:</strong> {leadData.location}</p>}
            {leadData.website && (
              <p className="text-sm">
                <strong>Website:</strong> 
                <a href={leadData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  {leadData.website}
                </a>
              </p>
            )}
            {leadData.description && (
              <p className="text-sm text-gray-600 mt-2">{leadData.description}</p>
            )}
            {leadData.additional_info && (
              <p className="text-sm text-gray-500 mt-1"><strong>Additional:</strong> {leadData.additional_info}</p>
            )}
            {leadData.social_media && (
              <div className="flex gap-2 mt-2">
                {leadData.social_media.linkedin && (
                  <a href={leadData.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                    LinkedIn
                  </a>
                )}
                {leadData.social_media.twitter && (
                  <a href={leadData.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">
                    Twitter
                  </a>
                )}
                {leadData.social_media.facebook && (
                  <a href={leadData.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-xs">
                    Facebook
                  </a>
                )}
                {leadData.social_media.instagram && (
                  <a href={leadData.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline text-xs">
                    Instagram
                  </a>
                )}
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <Badge variant={getLeadScoreBadgeVariant(leadData.lead_score)}>
                Score: {leadData.lead_score}
              </Badge>
              <a href={leadData.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                Source
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Lead Scraper</h1>
        <p className="text-gray-600 mb-6">
          Extract business leads from any website using AI-powered web scraping. Perfect for loan officers, ecommerce brands, gyms, and more.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Business</SelectItem>
                  <SelectItem value="ecommerce">Ecommerce/Retail</SelectItem>
                  <SelectItem value="gyms">Gyms/Fitness</SelectItem>
                  <SelectItem value="loans">Loan Officers/Mortgage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleScrape} 
              disabled={loading || !url.trim()}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader />
                  Extracting Leads...
                </>
              ) : (
                'Extract Leads'
              )}
            </Button>
            
            {lastScrapeTime && (
              <p className="text-sm text-gray-500">
                Last scraped: {lastScrapeTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {liveViewUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-800">Live Browser View</h3>
              {sessionId && (
                <Badge variant="outline">Session: {sessionId.slice(0, 8)}...</Badge>
              )}
            </div>
            <p className="text-blue-600 text-sm mb-3">
              Watch the AI scrape in real-time! Click the link below to see the browser in action.
            </p>
            <a 
              href={liveViewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔴 View Live Browser Session
            </a>
          </div>
        )}
      </div>

      {leads.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {scrapeType === 'ecommerce' && `E-commerce Leads (${leads.length} found)`}
              {scrapeType === 'gyms' && `Gym/Fitness Leads (${leads.length} found)`}
              {scrapeType === 'loans' && `Loan Officer Leads (${leads.length} found)`}
              {scrapeType === 'general' && `Business Leads (${leads.length} found)`}
              {(!scrapeType || scrapeType === 'unknown') && `Leads (${leads.length} found)`}
            </h2>
            {scrapeType && scrapeType !== 'unknown' && (
              <Badge variant="outline" className="capitalize">
                {scrapeType === 'ecommerce' ? 'E-commerce' : 
                 scrapeType === 'gyms' ? 'Fitness' :
                 scrapeType === 'loans' ? 'Finance' : 
                 scrapeType} Industry
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead, index) => renderLeadCard(lead, index))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loader />
          <p className="mt-4 text-gray-600">
            AI is analyzing the website and extracting lead data...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This may take 30-60 seconds depending on the website complexity
          </p>
        </div>
      )}

      {!loading && leads.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Enter a website URL above to start extracting business leads
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Try websites like:</p>
            <p>• Business directories</p>
            <p>• Company "About Us" or "Team" pages</p>
            <p>• Industry association member lists</p>
            <p>• Local business listings</p>
          </div>
        </div>
      )}
    </div>
  );
}