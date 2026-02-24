/**
 * Tests for FeedbackModal component
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FeedbackModal from '../components/modals/FeedbackModal';
import { createLocalStorageMock } from './test-utils';

describe('FeedbackModal', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'test-agent' },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      writable: true,
    });

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render when open', () => {
      const { getByText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      expect(getByText('Send Feedback')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      const { queryByText } = render(
        <FeedbackModal isOpen={false} onClose={jest.fn()} />
      );

      expect(queryByText('Send Feedback')).not.toBeInTheDocument();
    });

    it('should render feedback textarea', () => {
      const { getByPlaceholderText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      expect(
        getByPlaceholderText(/Share your thoughts/i)
      ).toBeInTheDocument();
    });

    it('should render email input', () => {
      const { getByPlaceholderText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      expect(
        getByPlaceholderText(/your@email.com/i)
      ).toBeInTheDocument();
    });

    it('should render submit button', () => {
      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const submitButton = getByRole('button', { name: /send/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render close button', () => {
      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const closeButtons = getByRole('button', { name: /close/i });
      expect(closeButtons).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have dialog role', () => {
      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      expect(getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const dialog = getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const dialog = getByRole('dialog');
      expect(dialog).toHaveAttribute(
        'aria-labelledby',
        'feedback-modal-title'
      );
    });

    it('should have accessible title', () => {
      const { getByText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const title = getByText('Send Feedback');
      expect(title).toHaveAttribute('id', 'feedback-modal-title');
    });
  });

  describe('user input', () => {
    it('should allow typing in feedback textarea', () => {
      const { getByPlaceholderText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(
        /Share your thoughts/i
      ) as HTMLTextAreaElement;

      fireEvent.change(textarea, {
        target: { value: 'Great app!' },
      });

      expect(textarea.value).toBe('Great app!');
    });

    it('should allow typing in email input', () => {
      const { getByPlaceholderText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const emailInput = getByPlaceholderText(
        /your@email.com/i
      ) as HTMLInputElement;

      fireEvent.change(emailInput, {
        target: { value: 'test@example.com' },
      });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should handle multiline feedback', () => {
      const { getByPlaceholderText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(
        /Share your thoughts/i
      ) as HTMLTextAreaElement;

      const multilineText = 'Line 1\nLine 2\nLine 3';
      fireEvent.change(textarea, {
        target: { value: multilineText },
      });

      expect(textarea.value).toBe(multilineText);
    });
  });

  describe('form submission', () => {
    it('should submit feedback with email', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      const emailInput = getByPlaceholderText(/your@email.com/i);

      fireEvent.change(textarea, { target: { value: 'Great app!' } });
      fireEvent.change(emailInput, {
        target: { value: 'test@example.com' },
      });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Feedback submitted:',
          expect.objectContaining({
            feedback: 'Great app!',
            email: 'test@example.com',
          })
        );
      });

      consoleLogSpy.mockRestore();
    });

    it('should submit feedback without email as anonymous', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Good work' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Feedback submitted:',
          expect.objectContaining({
            feedback: 'Good work',
            email: 'anonymous',
          })
        );
      });

      consoleLogSpy.mockRestore();
    });

    it('should not submit empty feedback', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should not submit whitespace-only feedback', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: '   ' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should store feedback in localStorage', async () => {
      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Test feedback' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'coc-feedback-history',
          expect.any(String)
        );
      });
    });

    it('should include timestamp in submission', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Feedback submitted:',
          expect.objectContaining({
            timestamp: expect.any(String),
          })
        );
      });

      consoleLogSpy.mockRestore();
    });

    it('should show success message after submission', async () => {
      const { getByPlaceholderText, getByRole, getByText } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(getByText(/thank you/i)).toBeInTheDocument();
      });
    });

    it('should auto-close after successful submission', async () => {
      const onCloseMock = jest.fn();

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={onCloseMock} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalled();
      });
    });

    it('should disable submit button while submitting', async () => {
      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const submitButton = getByRole('button', {
        name: /send/i,
      }) as HTMLButtonElement;

      fireEvent.click(submitButton);

      expect(submitButton.disabled).toBe(true);

      await waitFor(() => {
        expect(submitButton.disabled).toBe(false);
      });
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const onCloseMock = jest.fn();

      const { getByRole } = render(
        <FeedbackModal isOpen={true} onClose={onCloseMock} />
      );

      const closeButton = getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onCloseMock).toHaveBeenCalled();
    });

    it('should clear form when closing', async () => {
      const onCloseMock = jest.fn();

      const { getByPlaceholderText, getByRole, rerender } = render(
        <FeedbackModal isOpen={true} onClose={onCloseMock} />
      );

      const textarea = getByPlaceholderText(
        /Share your thoughts/i
      ) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test' } });

      expect(textarea.value).toBe('Test');

      const closeButton = getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Reopen
      rerender(<FeedbackModal isOpen={true} onClose={onCloseMock} />);

      const newTextarea = getByPlaceholderText(
        /Share your thoughts/i
      ) as HTMLTextAreaElement;
      expect(newTextarea.value).toBe('');
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();
      localStorageMock.setItem = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('feedback history', () => {
    it('should limit feedback history to last 10 items', async () => {
      // Add 9 existing items
      const existingHistory = Array.from({ length: 9 }, (_, i) => ({
        feedback: `Feedback ${i}`,
        email: 'test@example.com',
        timestamp: new Date().toISOString(),
      }));

      localStorageMock.setItem(
        'coc-feedback-history',
        JSON.stringify(existingHistory)
      );

      const { getByPlaceholderText, getByRole } = render(
        <FeedbackModal isOpen={true} onClose={jest.fn()} />
      );

      const textarea = getByPlaceholderText(/Share your thoughts/i);
      fireEvent.change(textarea, { target: { value: 'New feedback' } });

      const submitButton = getByRole('button', { name: /send/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const setItemCalls = localStorageMock.setItem.mock.calls;
        const lastCall = setItemCalls[setItemCalls.length - 1];
        const savedHistory = JSON.parse(lastCall[1] as string);
        expect(savedHistory).toHaveLength(10);
      });
    });
  });
});
