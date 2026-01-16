/**
 * Rich Text Editor Component
 *
 * Provides formatting capabilities for notes with markdown support
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { sanitizeInput } from '../utils/validation';

interface RichTextEditorProps {
  initialValue?: string;
  placeholder?: string;
  onChange: (text: string, markdown: string) => void;
  autoFocus?: boolean;
  minHeight?: number;
}

interface FormatButton {
  icon: string;
  label: string;
  action: () => void;
  active?: boolean;
}

export function RichTextEditor({
  initialValue = '',
  placeholder = 'Start writing...',
  onChange,
  autoFocus = false,
  minHeight = 200,
}: RichTextEditorProps) {
  const { colors, isDark } = useTheme();
  const [text, setText] = useState(initialValue);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Apply formatting
  const applyFormat = (prefix: string, suffix: string = '') => {
    const { start, end } = selection;
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    let newText: string;
    let newCursorPosition: number;

    if (start === end) {
      // No selection - insert format markers with placeholder
      const placeholder = prefix === '## ' ? 'Heading' : 'text';
      newText = beforeText + prefix + placeholder + suffix + afterText;
      newCursorPosition = start + prefix.length;
    } else {
      // Format selected text
      newText = beforeText + prefix + selectedText + suffix + afterText;
      newCursorPosition = start + prefix.length + selectedText.length + suffix.length;
    }

    setText(newText);
    onChange(newText, newText); // For now, markdown = raw text

    // Reset cursor position
    setTimeout(() => {
      inputRef.current?.setSelection(newCursorPosition, newCursorPosition);
    }, 10);
  };

  const insertList = (ordered: boolean) => {
    const { start } = selection;
    const beforeText = text.substring(0, start);
    const afterText = text.substring(start);

    const listMarker = ordered ? '1. ' : '• ';
    const newText = beforeText + '\n' + listMarker + afterText;

    setText(newText);
    onChange(newText, newText);

    const newPosition = start + listMarker.length + 1;
    setTimeout(() => {
      inputRef.current?.setSelection(newPosition, newPosition);
    }, 10);
  };

  const insertLink = () => {
    const { start, end } = selection;
    const selectedText = text.substring(start, end) || 'link text';
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = beforeText + `[${selectedText}](url)` + afterText;
    setText(newText);
    onChange(newText, newText);
  };

  const insertQuote = () => {
    const { start } = selection;
    const beforeText = text.substring(0, start);
    const afterText = text.substring(start);

    const newText = beforeText + '\n> Quote\n' + afterText;
    setText(newText);
    onChange(newText, newText);
  };

  const formatButtons: FormatButton[] = [
    { icon: 'B', label: 'Bold', action: () => applyFormat('**', '**') },
    { icon: 'I', label: 'Italic', action: () => applyFormat('*', '*') },
    { icon: 'U', label: 'Underline', action: () => applyFormat('__', '__') },
    { icon: 'S', label: 'Strike', action: () => applyFormat('~~', '~~') },
    { icon: 'H1', label: 'Heading 1', action: () => applyFormat('# ') },
    { icon: 'H2', label: 'Heading 2', action: () => applyFormat('## ') },
    { icon: 'H3', label: 'Heading 3', action: () => applyFormat('### ') },
    { icon: '•', label: 'Bullet List', action: () => insertList(false) },
    { icon: '1.', label: 'Numbered List', action: () => insertList(true) },
    { icon: '"', label: 'Quote', action: () => insertQuote() },
    { icon: '🔗', label: 'Link', action: () => insertLink() },
    { icon: '👁', label: 'Preview', action: () => setShowPreview(!showPreview), active: showPreview },
  ];

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown to React Native rendering
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <Text key={index} style={[styles.previewH3, { color: colors.text }]}>
            {line.substring(4)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={index} style={[styles.previewH2, { color: colors.text }]}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <Text key={index} style={[styles.previewH1, { color: colors.text }]}>
            {line.substring(2)}
          </Text>
        );
      }
      // Quotes
      else if (line.startsWith('> ')) {
        elements.push(
          <View key={index} style={[styles.previewQuote, { borderColor: colors.primary }]}>
            <Text style={[styles.previewQuoteText, { color: colors.textSecondary }]}>
              {line.substring(2)}
            </Text>
          </View>
        );
      }
      // Lists
      else if (line.startsWith('• ') || line.startsWith('- ')) {
        elements.push(
          <Text key={index} style={[styles.previewListItem, { color: colors.text }]}>
            • {line.substring(2)}
          </Text>
        );
      } else if (line.match(/^\d+\. /)) {
        const content = line.replace(/^\d+\. /, '');
        elements.push(
          <Text key={index} style={[styles.previewListItem, { color: colors.text }]}>
            {line.match(/^\d+/)![0]}. {content}
          </Text>
        );
      }
      // Regular text with inline formatting
      else if (line.trim()) {
        let formattedLine = line;

        // Bold
        formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '【b】$1【/b】');
        // Italic
        formattedLine = formattedLine.replace(/\*(.*?)\*/g, '【i】$1【/i】');
        // Underline
        formattedLine = formattedLine.replace(/__(.*?)__/g, '【u】$1【/u】');
        // Strikethrough
        formattedLine = formattedLine.replace(/~~(.*?)~~/g, '【s】$1【/s】');

        elements.push(
          <Text key={index} style={[styles.previewText, { color: colors.text }]}>
            {formattedLine}
          </Text>
        );
      }
    });

    return elements;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    toolbar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    formatButton: {
      padding: 8,
      marginHorizontal: 4,
      marginVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.surface,
      minWidth: 36,
      alignItems: 'center',
    },
    formatButtonActive: {
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    formatButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    formatButtonTextActive: {
      color: colors.primary,
    },
    editorContainer: {
      minHeight,
      padding: 12,
    },
    textInput: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      minHeight: minHeight - 24,
      textAlignVertical: 'top',
    },
    preview: {
      minHeight,
      padding: 12,
      backgroundColor: colors.background,
    },
    statusBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 8,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statusText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={dynamicStyles.container}
    >
      {/* Formatting Toolbar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={dynamicStyles.toolbar}
      >
        {formatButtons.map((button, index) => (
          <Pressable
            key={index}
            style={[
              dynamicStyles.formatButton,
              button.active && dynamicStyles.formatButtonActive,
            ]}
            onPress={button.action}
          >
            <Text
              style={[
                dynamicStyles.formatButtonText,
                button.active && dynamicStyles.formatButtonTextActive,
                button.icon === 'I' && { fontStyle: 'italic' },
                button.icon === 'B' && { fontWeight: 'bold' },
                button.icon === 'U' && { textDecorationLine: 'underline' },
                button.icon === 'S' && { textDecorationLine: 'line-through' },
              ]}
            >
              {button.icon}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Editor/Preview */}
      {showPreview ? (
        <ScrollView style={dynamicStyles.preview}>
          {renderMarkdownPreview(text)}
        </ScrollView>
      ) : (
        <View style={dynamicStyles.editorContainer}>
          <TextInput
            ref={inputRef}
            style={dynamicStyles.textInput}
            value={text}
            onChangeText={(newText) => {
              const sanitized = sanitizeInput(newText);
              setText(sanitized);
              onChange(sanitized, sanitized);
            }}
            onSelectionChange={(event) => {
              setSelection(event.nativeEvent.selection);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline
            autoFocus={autoFocus}
          />
        </View>
      )}

      {/* Status Bar */}
      <View style={dynamicStyles.statusBar}>
        <Text style={dynamicStyles.statusText}>
          {text.length} characters
        </Text>
        <Text style={dynamicStyles.statusText}>
          {text.split(/\s+/).filter(w => w.length > 0).length} words
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  previewH1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  previewH2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  previewH3: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 4,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
  },
  previewQuote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginVertical: 8,
  },
  previewQuoteText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  previewListItem: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 8,
    marginVertical: 2,
  },
});