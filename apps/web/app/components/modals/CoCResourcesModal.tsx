import React, { useState } from 'react';
import { motion } from 'motion/react';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

interface CoCResourcesModalProps {
  onClose: () => void;
}

export function CoCResourcesModal({ onClose }: CoCResourcesModalProps) {
  const [showScan, setShowScan] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coc-resources-title"
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        className="bg-[var(--color-bg-primary)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--color-border)]"
      >
        <div className="sticky top-0 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)] px-6 py-4 flex justify-between items-center">
          <h2
            id="coc-resources-title"
            className="text-2xl font-bold text-[var(--color-text-primary)]"
          >
            Community of Christ Study Resources
          </h2>
          <motion.button
            onClick={onClose}
            whileTap={tapPress}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Official CoC Resources */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Official CoC Resources (Free/Purchase)
            </h3>
            <div className="space-y-3">
              <ResourceLink
                href="https://gathering.cofchrist.org/"
                title="Gathering Resources"
                description="FREE worship guides, weekly lessons, and study materials for all ages"
              />
              <ResourceLink
                href="https://www.heraldhouse.org/"
                title="Herald House Publications"
                description="Official CoC publisher - D&C Commentary (Volumes 1-2), 'Sharing in Community of Christ' ($6.95), and study materials"
              />
              <ResourceLink
                href="http://www.centerplace.org/"
                title="Centerplace.org"
                description="FREE access to D&C sections 114-167 with study notes, Inspired Version cross-references, and RLDS historical documents"
              />
              <ResourceLink
                href="https://cofchrist.org/"
                title="Community of Christ Official Website"
                description="Who We Are, Mission, Enduring Principles, Find a Congregation"
              />
            </div>
          </section>

          {/* Downloads */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Download for Offline Reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="/api/pdf?volume=bom"
                className="block p-4 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] rounded-lg transition-colors border border-[var(--color-border)]"
              >
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                  Book of Mormon (PDF)
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  1908 Authorized (RLDS) Edition -- generated from the text in this app
                </p>
              </a>
              <a
                href="/api/pdf?volume=dc"
                className="block p-4 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] rounded-lg transition-colors border border-[var(--color-border)]"
              >
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                  Doctrine and Covenants (PDF)
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Community of Christ Edition, all 167 sections
                </p>
              </a>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
              Large PDF -- generation can take a little while on the first request.
            </p>
          </section>

          {/* Historical RLDS Materials */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Historical RLDS Materials (Free - Public Domain)
            </h3>
            <div className="space-y-3">
              <ResourceLink
                href="https://archiveviewer.org/collections/en/saints-herald-rlds"
                title="Saints' Herald Archive (1860-1928)"
                description="Official RLDS periodical with sermons, theological articles, conference reports, and historical documentation"
              />
              <ResourceLink
                href="https://archive.org/details/historyofchurcho03smitrich"
                title="Joseph Smith III: History of the Church (4 volumes)"
                description="Complete official RLDS history during Joseph Smith III's 54-year presidency (1860-1914)"
              />
              <ResourceLink
                href="https://archive.org/details/TheBookOfMormon1874"
                title="1874 RLDS Book of Mormon Edition"
                description="Historical RLDS edition showing textual variations and RLDS perspective from this era"
              />
              <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[var(--color-text-primary)]">
                      Read the Physical 1874 Scan
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Page through the actual scanned book, hosted by the Internet Archive
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setShowScan((s) => !s)}
                    whileTap={tapPress}
                    className="shrink-0 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium"
                  >
                    {showScan ? 'Hide' : 'Open'}
                  </motion.button>
                </div>
                {showScan && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <iframe
                      src="https://archive.org/embed/TheBookOfMormon1874"
                      title="1874 RLDS Book of Mormon Edition -- scanned pages"
                      className="w-full"
                      style={{ height: '480px', border: 'none' }}
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <ResourceLink
                href="https://archive.org/details/josephsmithsnewt00smit"
                title="Inspired Version Bible (1867 Parallel Edition)"
                description="Joseph Smith Translation side-by-side with King James Version - preserved by Emma Smith and published by RLDS"
              />
              <ResourceLink
                href="http://www.latterdaytruth.org/"
                title="LatterDayTruth.org Historical Documents"
                description="PDFs of conference minutes, sermon series (1892-1894), and historical tracts from mid-1800s through 1970s"
              />
            </div>
          </section>

          {/* Study Tools */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              D&C Sections 114-167 (CoC-Specific Revelations)
            </h3>
            <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-lg p-4">
              <p className="text-[var(--color-text-primary)] mb-2">
                Community of Christ&apos;s Doctrine & Covenants includes{' '}
                <strong>54 additional sections (114-167)</strong> beyond the 113 shared with LDS
                tradition. These contain revelations from:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)] ml-4">
                <li>Joseph Smith III (1860-1914)</li>
                <li>Frederick M. Smith (1915-1946)</li>
                <li>Israel A. Smith (1946-1958)</li>
                <li>
                  W. Wallace Smith (1958-1978, 1982-1984) -{' '}
                  <em>Section 156: Women&apos;s Ordination</em>
                </li>
                <li>Wallace B. Smith (1978-1982, 1984-1996)</li>
                <li>Grant McMurray (1996-2004)</li>
                <li>
                  Stephen M. Veazey (2005-present) - <em>Latest: Section 167 (2025)</em>
                </li>
              </ul>
              <p className="text-[var(--color-text-secondary)] mt-3">
                <strong>Access all 167 sections:</strong> Explore the full D&C in this app, or visit{' '}
                <a
                  href="http://www.centerplace.org/dc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  Centerplace.org
                </a>
              </p>
            </div>
          </section>

          {/* Key Spotlight: Section 156 */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Spotlight: Section 156 (Women&apos;s Ordination, 1984)
            </h3>
            <div className="bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/40 rounded-lg p-4">
              <p className="text-[var(--color-text-primary)] mb-2">
                One of the most significant revelations in CoC history, Section 156 authorized
                women&apos;s ordination to priesthood:
              </p>
              <blockquote className="border-l-4 border-[var(--color-gold)] pl-4 italic my-3 text-[var(--color-text-primary)]">
                &quot;The time has come for you to respond to the need for a broader participation
                of women in the life of the church, including their ordination to priesthood.&quot;
              </blockquote>
              <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)] ml-4">
                <li>
                  <strong>Received:</strong> April 1, 1984 (President W. Wallace Smith)
                </li>
                <li>
                  <strong>Sustained:</strong> April 5, 1984 World Conference
                </li>
                <li>
                  <strong>First women ordained:</strong> 1985 (Ginger Barfield, Linda L. Booth, and
                  others)
                </li>
                <li>
                  <strong>Impact:</strong> ~50,000 members left to form Restoration Branches
                </li>
                <li>
                  <strong>Current:</strong> Approximately 25% of CoC priesthood are women (2024)
                </li>
              </ul>
              <div className="mt-3">
                <a
                  href="https://sites.smith.edu/womens-rites/season-1/background-essay-womens-ordination-in-community-of-christ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline text-sm"
                >
                  → Read detailed historical essay on women&apos;s ordination in CoC
                </a>
              </div>
            </div>
          </section>

          {/* About CoC Link */}
          <section className="border-t border-[var(--color-border-light)] pt-4">
            <motion.button
              onClick={onClose}
              whileTap={tapPress}
              className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-opacity"
            >
              Learn More: About Community of Christ
            </motion.button>
            <p className="text-sm text-[var(--color-text-secondary)] text-center mt-2">
              Click to explore CoC identity, mission, beliefs, and key distinctions
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ResourceLinkProps {
  href: string;
  title: string;
  description: string;
}

function ResourceLink({ href, title, description }: ResourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] rounded-lg transition-colors border border-[var(--color-border)]"
    >
      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1 flex items-center">
        {title}
        <svg
          className="w-4 h-4 ml-2 text-[var(--color-text-tertiary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </h4>
      <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
    </a>
  );
}
