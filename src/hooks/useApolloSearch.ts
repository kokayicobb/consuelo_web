import { useState } from 'react';
import { ApolloClient } from '@/lib/apollo-client';
import { ApolloSearchParams, ApolloContact } from '../../types/apollo';

// Define the summary type here since it's not being imported properly
interface ApolloSearchSummary {
  returned: number;
  totalAvailable?: number;
  currentPage?: number;
  totalPages?: number;
  pagesFetched?: number;
  maxResults?: number;
  withEmail: number;
  withPhone: number;
}

export const useApolloSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ApolloContact[]>([]);
  const [searchSummary, setSearchSummary] = useState<ApolloSearchSummary | null>(null);

  const apolloClient = new ApolloClient();

  // Original search (up to 100 results)
  const search = async (params: ApolloSearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apolloClient.searchContacts(params);
      setResults(response.people || []);
      setSearchSummary(response.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSearchSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Multi-page search (up to 500+ results)
  const searchMultiple = async (params: ApolloSearchParams, maxResults: number = 200) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apolloClient.searchContactsMultiple(params, maxResults);
      setResults(response.people || []);
      setSearchSummary(response.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSearchSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichContact = async (email: string) => {
    try {
      return await apolloClient.enrichContact(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrichment failed');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return {
    search,
    searchMultiple,
    enrichContact,
    isLoading,
    error,
    results,
    searchSummary,
    clearError,
  };
};