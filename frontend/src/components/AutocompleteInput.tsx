'use client'

import { Clock } from 'lucide-react'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useGetSuggestionsQuery } from '@/lib/redux/features/activities/activitiesApi'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  required,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce the search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  // Fetch suggestions from API
  const { data: suggestions = [], isLoading } = useGetSuggestionsQuery(
    { q: debouncedValue },
    { skip: debouncedValue.length < 2 }
  )

  // Show suggestions when we have a debounced value and suggestions
  useEffect(() => {
    if (debouncedValue.length >= 2 && suggestions.length > 0) {
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }, [debouncedValue, suggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = useCallback(
    (suggestionTitle: string) => {
      onChange(suggestionTitle)
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.focus()
    },
    [onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex].title)
        }
        break
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          required={required}
          autoComplete="off"
        />
        {isLoading && debouncedValue.length >= 2 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => handleSuggestionClick(suggestion.title)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                index === selectedIndex
                  ? 'bg-blue-50 border-l-2 border-blue-500'
                  : ''
              }`}
            >
              <span className="font-medium">{suggestion.title}</span>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>{suggestion.count}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen &&
        debouncedValue.length >= 2 &&
        suggestions.length === 0 &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-3 py-2 text-gray-500 text-sm">
              No suggestions found
            </div>
          </div>
        )}
    </div>
  )
}
