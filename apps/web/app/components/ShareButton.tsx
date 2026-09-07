'use client';

import { useState } from 'react';
import {
  useShare,
  type ShareData,
  type ShareOptions,
  createVerseShareData,
} from '../hooks/useShare';

interface ShareButtonProps {
  data: ShareData;
  variant?: 'primary' | 'secondary' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showMenu?: boolean;
}

export function ShareButton({
  data,
  variant = 'secondary',
  size = 'md',
  className = '',
  showMenu = false,
}: ShareButtonProps) {
  const { share, isSharing, canUseNativeShare } = useShare();
  const [menuOpen, setMenuOpen] = useState(false);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary:
      'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
    'icon-only':
      'bg-transparent hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
  };

  const handleShare = async (platform?: ShareOptions['platform']) => {
    setMenuOpen(false);
    await share(data, { platform });
  };

  const handleClick = () => {
    if (showMenu && !canUseNativeShare) {
      setMenuOpen(!menuOpen);
    } else {
      handleShare();
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={isSharing}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg font-medium
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
          ${className}
        `}
        aria-label="Share"
      >
        <svg
          className={variant === 'icon-only' ? 'w-5 h-5' : 'w-4 h-4'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {variant !== 'icon-only' && <span>{isSharing ? 'Sharing...' : 'Share'}</span>}
      </button>

      {/* Share menu dropdown */}
      {menuOpen && showMenu && !canUseNativeShare && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={() => handleShare('twitter')}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] flex items-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span>Twitter</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] flex items-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] flex items-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--color-text-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Email</span>
            </button>

            <div className="border-t border-[var(--color-border)]" />

            <button
              onClick={() => handleShare('copy')}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--color-text-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Convenience wrapper for verse sharing
interface ShareVerseButtonProps {
  verse: string;
  reference: string;
  url?: string;
  variant?: ShareButtonProps['variant'];
  size?: ShareButtonProps['size'];
  className?: string;
}

export function ShareVerseButton({
  verse,
  reference,
  url,
  variant,
  size,
  className,
}: ShareVerseButtonProps) {
  const shareData = createVerseShareData(verse, reference, url);

  return (
    <ShareButton
      data={shareData}
      variant={variant}
      size={size}
      className={className}
      showMenu={true}
    />
  );
}
