'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { components } from '@/lib/api-types'
import { useFilterActivitiesQuery } from '@/lib/features/activities/activitiesApi'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']

interface SearchFilterProps {
  onSearchResults: (activities: ActivityResponseDto[]) => void
  onClearSearch?: () => void
}

export function SearchFilter({
  onSearchResults,
  onClearSearch,
}: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const previousSearchTerm = useRef('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 100)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: searchResults, isLoading } = useFilterActivitiesQuery(
    {
      search: debouncedSearchTerm,
      limit: '50',
    },
    {
      skip: !debouncedSearchTerm,
    }
  )

  useEffect(() => {
    const currentSearchTerm = debouncedSearchTerm
    const prevSearchTerm = previousSearchTerm.current

    // Only call callbacks when there's an actual change
    if (currentSearchTerm !== prevSearchTerm) {
      if (currentSearchTerm && searchResults?.activities) {
        onSearchResults(searchResults.activities)
      } else if (!currentSearchTerm && prevSearchTerm) {
        // Search was cleared
        onSearchResults([])
        onClearSearch?.()
      }

      previousSearchTerm.current = currentSearchTerm
    }
  }, [debouncedSearchTerm, searchResults, onSearchResults, onClearSearch])

  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    onSearchResults([])
    onClearSearch?.()
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
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>

        {isLoading && debouncedSearchTerm && (
          <div className="mt-2 text-sm text-muted-foreground">Searching...</div>
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
