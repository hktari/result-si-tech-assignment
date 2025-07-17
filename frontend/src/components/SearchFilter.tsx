'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useGetActivitiesQuery } from '@/lib/features/activities/activitiesApi'

import type { components } from '@/lib/api-types'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']

interface SearchFilterProps {
  onSearchResults: (activities: ActivityResponseDto[]) => void
}

export function SearchFilter({ onSearchResults }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: searchResults, isLoading } = useGetActivitiesQuery({
    search: debouncedSearchTerm,
    limit: 50
  }, {
    skip: !debouncedSearchTerm
  })

  useEffect(() => {
    if (searchResults?.activities) {
      onSearchResults(searchResults.activities)
    }
  }, [searchResults, onSearchResults])

  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    onSearchResults([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>
        
        {isLoading && debouncedSearchTerm && (
          <div className="mt-2 text-sm text-muted-foreground">
            Searching...
          </div>
        )}
        
        {debouncedSearchTerm && searchResults?.activities?.length === 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            No results found for &quot;{debouncedSearchTerm}&quot;
          </div>
        )}
      </CardContent>
    </Card>
  )
}
