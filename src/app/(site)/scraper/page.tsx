'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loader from '@/components/Common/Loader';
import LiveBrowserPlayer from '@/components/LiveBrowserPlayer';

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

    // Enhanced lead card with robust design
    const leadData = lead as Lead;
    return (
      <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start gap-4">
            <div className="relative">
              {leadData.image ? (
                <img
                  src={leadData.image}
                  alt={leadData.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-3 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {leadData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-800">{leadData.name}</CardTitle>
              {leadData.title && (
                <CardDescription className="text-gray-600 font-medium mt-1">
                  {leadData.title}
                </CardDescription>
              )}
              {leadData.company && (
                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                  {leadData.company}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getLeadScoreBadgeVariant(leadData.lead_score)} className="text-xs font-bold">
                {leadData.lead_score}% Match
              </Badge>
              {leadData.location && (
                <span className="text-xs text-gray-500 max-w-24 text-right">📍 {leadData.location}</span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-3">
            {leadData.email && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <span className="text-green-600">✉️</span>
                <a href={`mailto:${leadData.email}`} className="text-green-700 hover:underline font-medium text-sm flex-1">
                  {leadData.email}
                </a>
              </div>
            )}
            
            {leadData.phone && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <span className="text-blue-600">📞</span>
                <a href={`tel:${leadData.phone}`} className="text-blue-700 hover:underline font-medium text-sm flex-1">
                  {leadData.phone}
                </a>
              </div>
            )}
            
            {leadData.website && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                <span className="text-purple-600">🌐</span>
                <a href={leadData.website} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline font-medium text-sm flex-1 truncate">
                  {leadData.website}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {leadData.description && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{leadData.description}</p>
            </div>
          )}

          {/* Additional Info */}
          {leadData.additional_info && (
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">💡 Additional Info:</span> {leadData.additional_info}
              </p>
            </div>
          )}

          {/* Social Media */}
          {leadData.social_media && Object.values(leadData.social_media).some(url => url) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-gray-600 mr-2">Social:</span>
              {leadData.social_media.linkedin && (
                <a href={leadData.social_media.linkedin} target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors">
                  💼 LinkedIn
                </a>
              )}
              {leadData.social_media.twitter && (
                <a href={leadData.social_media.twitter} target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center px-2 py-1 bg-sky-500 text-white text-xs rounded-full hover:bg-sky-600 transition-colors">
                  🐦 Twitter
                </a>
              )}
              {leadData.social_media.facebook && (
                <a href={leadData.social_media.facebook} target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center px-2 py-1 bg-blue-700 text-white text-xs rounded-full hover:bg-blue-800 transition-colors">
                  📘 Facebook
                </a>
              )}
              {leadData.social_media.instagram && (
                <a href={leadData.social_media.instagram} target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors">
                  📸 Instagram
                </a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <a href={leadData.source_url} target="_blank" rel="noopener noreferrer" 
               className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              🔗 View Source
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Quality Score</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    leadData.lead_score >= 70 ? 'bg-green-500' :
                    leadData.lead_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${leadData.lead_score}%` }}
                ></div>
              </div>
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
          <div className="mb-6">
            <LiveBrowserPlayer 
              liveViewUrl={liveViewUrl}
              sessionId={sessionId || undefined}
              onClose={() => setLiveViewUrl(null)}
            />
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