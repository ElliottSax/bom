/**
 * Unit tests for Notebooks component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notebooks } from '../Notebooks';
import { ThemeProvider } from '../../contexts/ThemeContext';

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
};

describe('Notebooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  describe('Initialization', () => {
    it('should render without crashing', () => {
      const { getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );
      expect(getByText('My Notebooks')).toBeTruthy();
    });

    it('should load notebooks from AsyncStorage', async () => {
      const mockNotebooks = [
        {
          id: 'notebook1',
          name: 'Personal Study',
          description: 'My personal notes',
          color: '#FF5722',
          icon: '📖',
          noteIds: ['note1', 'note2'],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-02',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockNotebooks)
      );

      const { getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bom_notebooks');
        expect(getByText('Personal Study')).toBeTruthy();
      });
    });

    it('should display empty state when no notebooks exist', () => {
      const { getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );
      expect(getByText(/No notebooks yet/i)).toBeTruthy();
      expect(getByText(/Create your first notebook/i)).toBeTruthy();
    });
  });

  describe('Notebook Creation', () => {
    it('should open create modal when add button pressed', () => {
      const { getByTestId, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      const addButton = getByTestId('add-notebook-button');
      fireEvent.press(addButton);

      expect(getByText('New Notebook')).toBeTruthy();
      expect(getByText('Choose a color')).toBeTruthy();
      expect(getByText('Choose an icon')).toBeTruthy();
    });

    it('should save new notebook to AsyncStorage', async () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      // Open create modal
      fireEvent.press(getByTestId('add-notebook-button'));

      // Fill in details
      const nameInput = getByPlaceholderText('Notebook name');
      fireEvent.changeText(nameInput, 'Study Notes');

      const descInput = getByPlaceholderText('Description (optional)');
      fireEvent.changeText(descInput, 'My study notes');

      // Select color
      const colorButton = getByTestId('color-#FF5722');
      fireEvent.press(colorButton);

      // Select icon
      const iconButton = getByTestId('icon-📖');
      fireEvent.press(iconButton);

      // Create notebook
      const createButton = getByText('Create Notebook');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@bom_notebooks',
          expect.stringContaining('Study Notes')
        );
      });
    });

    it('should validate notebook name is not empty', () => {
      const { getByTestId, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      fireEvent.press(getByTestId('add-notebook-button'));

      const createButton = getByText('Create Notebook');
      fireEvent.press(createButton);

      // Should show error or not close modal
      expect(getByText('New Notebook')).toBeTruthy();
    });
  });

  describe('Notebook Display', () => {
    const mockNotebooks = [
      {
        id: '1',
        name: 'Faith',
        color: '#4CAF50',
        icon: '🙏',
        noteIds: ['n1', 'n2', 'n3'],
        createdAt: '2025-01-01',
        updatedAt: '2025-01-02',
      },
      {
        id: '2',
        name: 'Prayer',
        color: '#2196F3',
        icon: '📿',
        noteIds: ['n4'],
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ];

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockNotebooks)
      );
    });

    it('should display notebooks in grid layout', async () => {
      const { getByText, getAllByTestId } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Faith')).toBeTruthy();
        expect(getByText('Prayer')).toBeTruthy();
        expect(getAllByTestId(/notebook-card-/)).toHaveLength(2);
      });
    });

    it('should show note count for each notebook', async () => {
      const { getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('3 notes')).toBeTruthy();
        expect(getByText('1 note')).toBeTruthy();
      });
    });

    it('should navigate to notebook details on press', async () => {
      const { getByTestId } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.press(notebookCard);

        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'NotebookDetail',
          { notebookId: '1' }
        );
      });
    });
  });

  describe('Notebook Editing', () => {
    const mockNotebook = {
      id: '1',
      name: 'Original Name',
      description: 'Original description',
      color: '#FF5722',
      icon: '📖',
      noteIds: [],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockNotebook])
      );
    });

    it('should open edit modal on long press', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.longPress(notebookCard);

        expect(getByText('Edit Notebook')).toBeTruthy();
      });
    });

    it('should pre-fill edit form with current values', async () => {
      const { getByTestId, getByDisplayValue } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.longPress(notebookCard);

        expect(getByDisplayValue('Original Name')).toBeTruthy();
        expect(getByDisplayValue('Original description')).toBeTruthy();
      });
    });

    it('should update notebook in AsyncStorage', async () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.longPress(notebookCard);
      });

      const nameInput = getByPlaceholderText('Notebook name');
      fireEvent.changeText(nameInput, 'Updated Name');

      const saveButton = getByText('Save Changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@bom_notebooks',
          expect.stringContaining('Updated Name')
        );
      });
    });
  });

  describe('Notebook Deletion', () => {
    const mockNotebooks = [
      { id: '1', name: 'To Delete', noteIds: [], color: '#FF5722', icon: '📖' },
      { id: '2', name: 'To Keep', noteIds: [], color: '#4CAF50', icon: '📚' },
    ];

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockNotebooks)
      );
    });

    it('should show delete confirmation dialog', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.longPress(notebookCard);
      });

      const deleteButton = getByText('Delete Notebook');
      fireEvent.press(deleteButton);

      expect(getByText(/Are you sure/i)).toBeTruthy();
      expect(getByText(/cannot be undone/i)).toBeTruthy();
    });

    it('should delete notebook from storage', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.longPress(notebookCard);
      });

      fireEvent.press(getByText('Delete Notebook'));
      fireEvent.press(getByText('Delete'));

      await waitFor(() => {
        const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
        const notebooks = JSON.parse(savedData);
        expect(notebooks).toHaveLength(1);
        expect(notebooks[0].name).toBe('To Keep');
      });
    });

    it('should warn if notebook has notes', async () => {
      const notebookWithNotes = {
        id: '1',
        name: 'Has Notes',
        noteIds: ['note1', 'note2'],
        color: '#FF5722',
        icon: '📖',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([notebookWithNotes])
      );

      const { getByTestId, getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const notebookCard = getByTestId('notebook-card-1');
        fireEvent.longPress(notebookCard);
      });

      fireEvent.press(getByText('Delete Notebook'));

      expect(getByText(/contains 2 notes/i)).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading notebooks:',
          expect.any(Error)
        );
      });

      // Should still render empty state
      expect(getByText(/No notebooks yet/i)).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should handle corrupted data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const { getByText } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText(/No notebooks yet/i)).toBeTruthy();
      });
    });
  });

  describe('Sorting and Filtering', () => {
    const mockNotebooks = [
      { id: '1', name: 'Alpha', updatedAt: '2025-01-03', noteIds: [] },
      { id: '2', name: 'Beta', updatedAt: '2025-01-01', noteIds: [] },
      { id: '3', name: 'Charlie', updatedAt: '2025-01-02', noteIds: [] },
    ];

    it('should sort notebooks by last updated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockNotebooks)
      );

      const { getAllByTestId } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      await waitFor(() => {
        const cards = getAllByTestId(/notebook-card-/);
        expect(cards[0]).toHaveTextContent('Alpha'); // Most recent
        expect(cards[1]).toHaveTextContent('Charlie');
        expect(cards[2]).toHaveTextContent('Beta'); // Oldest
      });
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderWithTheme(
        <Notebooks navigation={mockNavigation} />
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});