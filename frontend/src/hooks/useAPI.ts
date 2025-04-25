import { useState, useCallback } from 'react';
import apiService from '../services/api/APIService';
import type { APIError } from '../services/api/types';

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

export function useAPI<T>() {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as APIError;
      setState({ data: null, loading: false, error: apiError });
      throw apiError;
    }
  }, []);

  return {
    ...state,
    execute
  };
}

// Specialized hooks for different API features
export function useFlightSearch() {
  const { execute, ...state } = useAPI();
  
  const searchFlights = useCallback((params) => {
    return execute(() => apiService.searchFlights(params));
  }, [execute]);

  return {
    ...state,
    searchFlights
  };
}

export function useHotelSearch() {
  const { execute, ...state } = useAPI();
  
  const searchHotels = useCallback((params) => {
    return execute(() => apiService.searchHotels(params));
  }, [execute]);

  return {
    ...state,
    searchHotels
  };
}

export function useExperienceSearch() {
  const { execute, ...state } = useAPI();
  
  const searchExperiences = useCallback((params) => {
    return execute(() => apiService.searchExperiences(params));
  }, [execute]);

  return {
    ...state,
    searchExperiences
  };
}

export function useTransferSearch() {
  const { execute, ...state } = useAPI();
  
  const searchTransfers = useCallback((params) => {
    return execute(() => apiService.searchTransfers(params));
  }, [execute]);

  return {
    ...state,
    searchTransfers
  };
}

export function useMarketInsights() {
  const { execute, ...state } = useAPI();
  
  const getMostTraveled = useCallback(() => {
    return execute(() => apiService.getMostTraveledDestinations());
  }, [execute]);

  const getMostBooked = useCallback(() => {
    return execute(() => apiService.getMostBookedDestinations());
  }, [execute]);

  return {
    ...state,
    getMostTraveled,
    getMostBooked
  };
}