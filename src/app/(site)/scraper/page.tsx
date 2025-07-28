'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/Common/Loader';

interface Book {
  title: string;
  price: string;
  image: string;
  inStock: string;
  link: string;
}

interface ScrapeResponse {
  success: boolean;
  data: Book[];
  count: number;
  error?: string;
}

export default function ScraperPage() {
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setBooks(result.data || []);
        setLastScrapeTime(new Date());
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

  const getStockBadgeVariant = (inStock: string) => {
    return inStock.toLowerCase().includes('in stock') ? 'default' : 'secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Book Scraper</h1>
        <p className="text-gray-600 mb-6">
          Scrape book data from books.toscrape.com using AI-powered web scraping
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={handleScrape} 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader />
                Scraping...
              </>
            ) : (
              'Start Scraping'
            )}
          </Button>
          
          {lastScrapeTime && (
            <p className="text-sm text-gray-500">
              Last scraped: {lastScrapeTime.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {books.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Scraped Books ({books.length} found)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
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
                    <Badge variant={getStockBadgeVariant(book.inStock)}>
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
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loader />
          <p className="mt-4 text-gray-600">
            AI is analyzing the website and extracting book data...
          </p>
        </div>
      )}

      {!loading && books.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Click "Start Scraping" to begin extracting book data
          </p>
        </div>
      )}
    </div>
  );
}