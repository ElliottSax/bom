/**
 * Unit tests for CrossReferences component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockedProvider } from '@apollo/client/testing';
import { CrossReferences } from '../CrossReferences';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { gql } from '@apollo/client';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    verseId: 'coc-bom-1908-1-nephi-1-1',
    editionId: 'coc-bom-1908',
    book: 'I Nephi',
    chapter: 1,
    verse: 1,
  },
};

// GraphQL mocks
const GET_CROSS_REFERENCES = gql`
  query GetCrossReferences($verseId: String!) {
    crossReferences(verseId: $verseId) {
      id
      sourceVerseId
      targetVerseId
      type
      notes
      createdAt
      targetVerse {
        id
        book
        chapter
        verse
        text
      }
    }
  }
`;

const mocks = [
  {
    request: {
      query: GET_CROSS_REFERENCES,
      variables: { verseId: 'coc-bom-1908-1-nephi-1-1' },
    },
    result: {
      data: {
        crossReferences: [
          {
            id: 'ref1',
            sourceVerseId: 'coc-bom-1908-1-nephi-1-1',
            targetVerseId: 'coc-bom-1908-2-nephi-1-1',
            type: 'parallel',
            notes: 'Similar theme',
            createdAt: '2025-01-01',
            targetVerse: {
              id: 'coc-bom-1908-2-nephi-1-1',
              book: 'II Nephi',
              chapter: 1,
              verse: 1,
              text: 'And now it came to pass...',
            },
          },
        ],
      },
    },
  },
];

describe('CrossReferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ThemeProvider>
          {component}
        </ThemeProvider>
      </MockedProvider>
    );
  };

  describe('Initialization', () => {
    it('should render without crashing', () => {
      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );
      expect(getByText('Cross References')).toBeTruthy();
    });

    it('should display verse info in header', () => {
      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );
      expect(getByText('I Nephi 1:1')).toBeTruthy();
    });

    it('should load cross references from storage', async () => {
      const mockRefs = [
        {
          id: 'local1',
          sourceVerseId: 'coc-bom-1908-1-nephi-1-1',
          targetVerseId: 'coc-bom-1908-alma-1-1',
          type: 'similar',
          notes: 'Local reference',
          createdAt: '2025-01-01',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockRefs)
      );

      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bom_cross_references');
      });
    });
  });

  describe('Reference Types', () => {
    it('should display all 6 reference type buttons', () => {
      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      fireEvent.press(getByText('Add Reference'));

      expect(getByText('Parallel')).toBeTruthy();
      expect(getByText('Similar')).toBeTruthy();
      expect(getByText('Contrast')).toBeTruthy();
      expect(getByText('Fulfillment')).toBeTruthy();
      expect(getByText('Quotation')).toBeTruthy();
      expect(getByText('Custom')).toBeTruthy();
    });

    it('should show correct icons for each type', () => {
      const { getByTestId } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('add-reference-button'));

      expect(getByTestId('type-parallel-icon')).toHaveTextContent('🔄');
      expect(getByTestId('type-similar-icon')).toHaveTextContent('≈');
      expect(getByTestId('type-contrast-icon')).toHaveTextContent('⚡');
      expect(getByTestId('type-fulfillment-icon')).toHaveTextContent('✓');
      expect(getByTestId('type-quotation-icon')).toHaveTextContent('"');
      expect(getByTestId('type-custom-icon')).toHaveTextContent('•');
    });
  });

  describe('Adding References', () => {
    it('should open add modal when button pressed', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('add-reference-button'));

      expect(getByText('Add Cross Reference')).toBeTruthy();
      expect(getByText('Select Type')).toBeTruthy();
    });

    it('should save new reference to AsyncStorage', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      // Open modal
      fireEvent.press(getByTestId('add-reference-button'));

      // Select type
      fireEvent.press(getByText('Similar'));

      // Enter target verse
      const verseInput = getByPlaceholderText('e.g., Alma 5:14');
      fireEvent.changeText(verseInput, 'Alma 5:14');

      // Add notes
      const notesInput = getByPlaceholderText('Add notes about this connection...');
      fireEvent.changeText(notesInput, 'Both discuss faith');

      // Save
      fireEvent.press(getByText('Add Reference'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@bom_cross_references',
          expect.stringContaining('Alma 5:14')
        );
      });
    });

    it('should validate target verse format', () => {
      const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('add-reference-button'));
      fireEvent.press(getByText('Parallel'));

      const verseInput = getByPlaceholderText('e.g., Alma 5:14');
      fireEvent.changeText(verseInput, 'invalid format');

      fireEvent.press(getByText('Add Reference'));

      // Should show error or not close modal
      expect(getByText('Add Cross Reference')).toBeTruthy();
    });
  });

  describe('Reference Display', () => {
    it('should display references with correct type indicators', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('II Nephi 1:1')).toBeTruthy();
        expect(getByTestId('ref-ref1-type')).toHaveTextContent('Parallel');
      });
    });

    it('should show reference notes when present', async () => {
      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Similar theme')).toBeTruthy();
      });
    });

    it('should navigate to target verse on press', async () => {
      const { getByTestId } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const refCard = getByTestId('reference-ref1');
        fireEvent.press(refCard);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Reader', {
          editionId: 'coc-bom-1908',
          book: 'II Nephi',
          chapter: 1,
          verse: 1,
        });
      });
    });
  });

  describe('Reference Deletion', () => {
    it('should delete reference on long press', async () => {
      const mockRefs = [
        {
          id: 'ref1',
          sourceVerseId: 'coc-bom-1908-1-nephi-1-1',
          targetVerseId: 'coc-bom-1908-alma-1-1',
          type: 'similar',
          notes: 'To delete',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockRefs)
      );

      const { getByTestId, getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const refCard = getByTestId('reference-ref1');
        fireEvent.longPress(refCard);
      });

      fireEvent.press(getByText('Delete'));

      await waitFor(() => {
        const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
        const refs = JSON.parse(savedData);
        expect(refs).toHaveLength(0);
      });
    });

    it('should show delete confirmation', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const refCard = getByTestId('reference-ref1');
        fireEvent.longPress(refCard);
      });

      expect(getByText(/Delete this reference/i)).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
    });
  });

  describe('Bidirectional References', () => {
    it('should create bidirectional reference when option selected', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('add-reference-button'));
      fireEvent.press(getByText('Parallel'));

      const verseInput = getByPlaceholderText('e.g., Alma 5:14');
      fireEvent.changeText(verseInput, 'Alma 5:14');

      // Toggle bidirectional
      fireEvent.press(getByTestId('bidirectional-toggle'));

      fireEvent.press(getByText('Add Reference'));

      await waitFor(() => {
        const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
        const refs = JSON.parse(savedData);

        // Should have both forward and reverse references
        expect(refs).toHaveLength(2);
        expect(refs.some(r => r.sourceVerseId === 'coc-bom-1908-1-nephi-1-1')).toBe(true);
        expect(refs.some(r => r.sourceVerseId === 'coc-bom-1908-alma-5-14')).toBe(true);
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter references by type', async () => {
      const mockRefs = [
        { id: '1', type: 'parallel', targetVerseId: 'verse1' },
        { id: '2', type: 'similar', targetVerseId: 'verse2' },
        { id: '3', type: 'parallel', targetVerseId: 'verse3' },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockRefs)
      );

      const { getByTestId, getAllByTestId } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        fireEvent.press(getByTestId('filter-parallel'));
        const refs = getAllByTestId(/reference-/);
        expect(refs).toHaveLength(2);
      });
    });

    it('should group references by type', async () => {
      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Parallel References')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { getByText } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      // Should still render
      expect(getByText('Cross References')).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should handle GraphQL errors', async () => {
      const errorMocks = [
        {
          request: {
            query: GET_CROSS_REFERENCES,
            variables: { verseId: 'coc-bom-1908-1-nephi-1-1' },
          },
          error: new Error('Network error'),
        },
      ];

      const { getByText } = render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <ThemeProvider>
            <CrossReferences route={mockRoute} navigation={mockNavigation} />
          </ThemeProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(getByText(/No references yet/i)).toBeTruthy();
      });
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderWithProviders(
        <CrossReferences route={mockRoute} navigation={mockNavigation} />
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});