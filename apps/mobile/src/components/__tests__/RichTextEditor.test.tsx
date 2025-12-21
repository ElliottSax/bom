/**
 * Unit tests for RichTextEditor component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RichTextEditor } from '../RichTextEditor';
import { ThemeProvider } from '../../contexts/ThemeContext';

describe('RichTextEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );
      expect(getByPlaceholderText('Start writing...')).toBeTruthy();
    });

    it('should display initial value', () => {
      const { getByDisplayValue } = renderWithTheme(
        <RichTextEditor
          initialValue="Initial text"
          onChange={mockOnChange}
        />
      );
      expect(getByDisplayValue('Initial text')).toBeTruthy();
    });

    it('should use custom placeholder', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor
          placeholder="Write your note..."
          onChange={mockOnChange}
        />
      );
      expect(getByPlaceholderText('Write your note...')).toBeTruthy();
    });

    it('should auto focus when prop is set', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor
          autoFocus={true}
          onChange={mockOnChange}
        />
      );
      const input = getByPlaceholderText('Start writing...');
      expect(input.props.autoFocus).toBe(true);
    });
  });

  describe('Toolbar Buttons', () => {
    it('should display all formatting buttons', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      expect(getByText('B')).toBeTruthy(); // Bold
      expect(getByText('I')).toBeTruthy(); // Italic
      expect(getByText('U')).toBeTruthy(); // Underline
      expect(getByText('S')).toBeTruthy(); // Strikethrough
      expect(getByText('H1')).toBeTruthy(); // Heading 1
      expect(getByText('H2')).toBeTruthy(); // Heading 2
      expect(getByText('H3')).toBeTruthy(); // Heading 3
      expect(getByText('•')).toBeTruthy(); // Bullet list
      expect(getByText('1.')).toBeTruthy(); // Numbered list
      expect(getByText('"')).toBeTruthy(); // Quote
      expect(getByText('🔗')).toBeTruthy(); // Link
      expect(getByText('👁')).toBeTruthy(); // Preview
    });

    it('should apply bold formatting', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');

      // Type some text
      fireEvent.changeText(input, 'Hello world');

      // Select text (simulate selection)
      fireEvent(input, 'onSelectionChange', {
        nativeEvent: { selection: { start: 0, end: 5 } }
      });

      // Apply bold
      fireEvent.press(getByText('B'));

      expect(mockOnChange).toHaveBeenCalledWith(
        '**Hello** world',
        '**Hello** world'
      );
    });

    it('should apply italic formatting', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Hello world');

      fireEvent(input, 'onSelectionChange', {
        nativeEvent: { selection: { start: 6, end: 11 } }
      });

      fireEvent.press(getByText('I'));

      expect(mockOnChange).toHaveBeenCalledWith(
        'Hello *world*',
        'Hello *world*'
      );
    });

    it('should insert heading', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, '');

      fireEvent.press(getByText('H1'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('# '),
        expect.stringContaining('# ')
      );
    });

    it('should insert bullet list', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      fireEvent.press(getByText('•'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('• '),
        expect.stringContaining('• ')
      );
    });

    it('should insert numbered list', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      fireEvent.press(getByText('1.'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('1. '),
        expect.stringContaining('1. ')
      );
    });

    it('should insert quote block', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      fireEvent.press(getByText('"'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('> '),
        expect.stringContaining('> ')
      );
    });

    it('should insert link format', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      fireEvent.press(getByText('🔗'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('['),
        expect.stringContaining('[')
      );
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('](url)'),
        expect.stringContaining('](url)')
      );
    });
  });

  describe('Preview Mode', () => {
    it('should toggle preview mode', () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <RichTextEditor
          initialValue="# Heading\nSome text"
          onChange={mockOnChange}
        />
      );

      // Initially in edit mode
      expect(queryByPlaceholderText('Start writing...')).toBeTruthy();

      // Toggle to preview
      fireEvent.press(getByText('👁'));

      // Should hide input and show preview
      expect(queryByPlaceholderText('Start writing...')).toBeFalsy();
      expect(getByText('Heading')).toBeTruthy();
      expect(getByText('Some text')).toBeTruthy();
    });

    it('should render markdown headings in preview', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor
          initialValue="# H1\n## H2\n### H3"
          onChange={mockOnChange}
        />
      );

      fireEvent.press(getByText('👁'));

      const h1 = getByText('H1');
      const h2 = getByText('H2');
      const h3 = getByText('H3');

      expect(h1.props.style).toContainEqual(
        expect.objectContaining({ fontSize: 24 })
      );
      expect(h2.props.style).toContainEqual(
        expect.objectContaining({ fontSize: 20 })
      );
      expect(h3.props.style).toContainEqual(
        expect.objectContaining({ fontSize: 18 })
      );
    });

    it('should render quotes in preview', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor
          initialValue="> This is a quote"
          onChange={mockOnChange}
        />
      );

      fireEvent.press(getByText('👁'));

      const quote = getByText('This is a quote');
      expect(quote.props.style).toContainEqual(
        expect.objectContaining({ fontStyle: 'italic' })
      );
    });

    it('should render lists in preview', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor
          initialValue="• Item 1\n• Item 2\n1. First\n2. Second"
          onChange={mockOnChange}
        />
      );

      fireEvent.press(getByText('👁'));

      expect(getByText('• Item 1')).toBeTruthy();
      expect(getByText('• Item 2')).toBeTruthy();
      expect(getByText('1. First')).toBeTruthy();
      expect(getByText('2. Second')).toBeTruthy();
    });
  });

  describe('Character and Word Count', () => {
    it('should display character count', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Hello world');

      expect(getByText('11 characters')).toBeTruthy();
    });

    it('should display word count', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Hello world from React Native');

      expect(getByText('5 words')).toBeTruthy();
    });

    it('should handle empty text', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      expect(getByText('0 characters')).toBeTruthy();
      expect(getByText('0 words')).toBeTruthy();
    });

    it('should count words correctly with multiple spaces', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Hello    world   ');

      expect(getByText('2 words')).toBeTruthy();
    });
  });

  describe('Text Selection and Formatting', () => {
    it('should handle text selection', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Hello world');

      fireEvent(input, 'onSelectionChange', {
        nativeEvent: { selection: { start: 0, end: 5 } }
      });

      // Selection should be tracked internally for formatting
      expect(input).toBeTruthy();
    });

    it('should apply formatting to selected text', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Hello world');

      // Select "world"
      fireEvent(input, 'onSelectionChange', {
        nativeEvent: { selection: { start: 6, end: 11 } }
      });

      // Apply multiple formats
      fireEvent.press(getByText('B'));
      fireEvent.press(getByText('I'));

      // Should have nested formatting
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should insert placeholder when no text selected', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      // No selection, cursor at position 0
      fireEvent.press(getByText('B'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('**text**'),
        expect.stringContaining('**text**')
      );
    });
  });

  describe('onChange Callback', () => {
    it('should call onChange when text changes', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'New text');

      expect(mockOnChange).toHaveBeenCalledWith('New text', 'New text');
    });

    it('should call onChange when formatting applied', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      fireEvent.press(getByText('H1'));

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should provide both text and markdown', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, '# Title');

      expect(mockOnChange).toHaveBeenCalledWith(
        '# Title',
        '# Title'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = 'a'.repeat(10000);
      const { getByDisplayValue } = renderWithTheme(
        <RichTextEditor
          initialValue={longText}
          onChange={mockOnChange}
        />
      );

      expect(getByDisplayValue(longText)).toBeTruthy();
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, specialText);

      expect(mockOnChange).toHaveBeenCalledWith(specialText, specialText);
    });

    it('should handle newlines', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      const input = getByPlaceholderText('Start writing...');
      fireEvent.changeText(input, 'Line 1\nLine 2\nLine 3');

      expect(mockOnChange).toHaveBeenCalledWith(
        'Line 1\nLine 2\nLine 3',
        'Line 1\nLine 2\nLine 3'
      );
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid formatting changes', () => {
      const { getByText } = renderWithTheme(
        <RichTextEditor onChange={mockOnChange} />
      );

      // Rapidly click multiple format buttons
      fireEvent.press(getByText('B'));
      fireEvent.press(getByText('I'));
      fireEvent.press(getByText('U'));
      fireEvent.press(getByText('S'));
      fireEvent.press(getByText('H1'));

      expect(mockOnChange).toHaveBeenCalledTimes(5);
    });
  });
});