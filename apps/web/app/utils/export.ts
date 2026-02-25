import { type Note, type Highlight, type Bookmark } from '../contexts/UserDataContext';

/**
 * Export notes as Markdown format
 */
export function exportNotesAsMarkdown(notes: Note[]): string {
  if (notes.length === 0) {
    return '# Scripture Study Notes\n\nNo notes found.';
  }

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  let markdown = '# Scripture Study Notes\n\n';
  markdown += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  markdown += `Total Notes: ${notes.length}\n\n`;
  markdown += '---\n\n';

  sortedNotes.forEach((note, index) => {
    markdown += `## ${index + 1}. ${note.verseId}\n\n`;
    markdown += `**Scripture Reference:** ${note.verseId}\n\n`;
    markdown += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n\n`;
    if (note.updatedAt) {
      markdown += `**Updated:** ${new Date(note.updatedAt).toLocaleDateString()}\n\n`;
    }
    markdown += `**Content:**\n\n${note.content}\n\n`;
    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Export all study data (notes, highlights, bookmarks) as Markdown
 */
export function exportAllStudyData(
  notes: Note[],
  highlights: Highlight[],
  bookmarks: Bookmark[]
): string {
  let markdown = '# Complete Scripture Study Export\n\n';
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  markdown += '---\n\n';

  // Notes Section
  markdown += `## 📝 Notes (${notes.length})\n\n`;
  if (notes.length > 0) {
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    sortedNotes.forEach((note, index) => {
      markdown += `### ${index + 1}. ${note.verseId}\n\n`;
      markdown += `> ${note.content}\n\n`;
      markdown += `*Created: ${new Date(note.createdAt).toLocaleDateString()}*\n\n`;
    });
  } else {
    markdown += '*No notes found*\n\n';
  }

  markdown += '---\n\n';

  // Highlights Section
  markdown += `## ✨ Highlights (${highlights.length})\n\n`;
  if (highlights.length > 0) {
    // Group by color
    const byColor: { [key: string]: Highlight[] } = {};
    highlights.forEach((h) => {
      if (!byColor[h.color]) byColor[h.color] = [];
      byColor[h.color].push(h);
    });

    Object.entries(byColor).forEach(([color, items]) => {
      markdown += `### ${color.charAt(0).toUpperCase() + color.slice(1)} (${items.length})\n\n`;
      items.forEach((item) => {
        markdown += `- ${item.verseId}\n`;
      });
      markdown += '\n';
    });
  } else {
    markdown += '*No highlights found*\n\n';
  }

  markdown += '---\n\n';

  // Bookmarks Section
  markdown += `## 🔖 Bookmarks (${bookmarks.length})\n\n`;
  if (bookmarks.length > 0) {
    const sortedBookmarks = [...bookmarks].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    sortedBookmarks.forEach((bookmark, index) => {
      markdown += `${index + 1}. **${bookmark.verseId}**`;
      if (bookmark.note) {
        markdown += ` - ${bookmark.note}`;
      }
      markdown += `\n   *${new Date(bookmark.createdAt).toLocaleDateString()}*\n\n`;
    });
  } else {
    markdown += '*No bookmarks found*\n\n';
  }

  markdown += '---\n\n';
  markdown += `*Exported from BOM Study Tools - Community of Christ*\n`;

  return markdown;
}

/**
 * Download markdown as file
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export notes as PDF (using browser print)
 */
export function exportAsPDF(title: string, content: string): void {
  // Create a new window with formatted content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export as PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 1in;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            color: #1e40af;
          }
          h2 {
            margin-top: 30px;
            color: #1e40af;
            border-bottom: 2px solid #ddd;
            padding-bottom: 5px;
          }
          h3 {
            margin-top: 20px;
            color: #374151;
          }
          blockquote {
            border-left: 4px solid #2563eb;
            padding-left: 15px;
            margin: 15px 0;
            color: #4b5563;
            font-style: italic;
          }
          hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
          }
          .metadata {
            color: #6b7280;
            font-size: 0.9em;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 0.85em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p class="metadata">Generated on ${new Date().toLocaleString()}</p>
        </div>
        ${formatMarkdownToHTML(content)}
        <div class="footer">
          <p>Exported from BOM Study Tools - Community of Christ</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Convert markdown to simple HTML
 */
function formatMarkdownToHTML(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraph
    .replace(/^(.+)$/gim, '<p>$1</p>')
    // Lists
    .replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
}
