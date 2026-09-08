import React from 'react';
import { motion } from 'motion/react';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

interface AboutCoCModalProps {
  onClose: () => void;
}

export function AboutCoCModal({ onClose }: AboutCoCModalProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-coc-title"
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        className="bg-[var(--color-bg-primary)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--color-border)]"
      >
        <div className="sticky top-0 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)] px-6 py-4 flex justify-between items-center">
          <h2 id="about-coc-title" className="text-2xl font-bold text-[var(--color-text-primary)]">
            About Community of Christ
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
          {/* Identity */}
          <section>
            <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-gold)]/10 rounded-lg p-6 border border-[var(--color-accent)]/20">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                Our Identity
              </h3>
              <p className="text-[var(--color-text-primary)] mb-2">
                <strong>Community of Christ</strong> (formerly the Reorganized Church of Jesus
                Christ of Latter Day Saints, 1860-2001) is an international Christian denomination
                with headquarters in Independence, Missouri.
              </p>
              <p className="text-[var(--color-text-primary)]">
                Founded in 1860 under the leadership of <strong>Joseph Smith III</strong> (son of
                Joseph Smith Jr.), Community of Christ continues the prophetic ministry through
                continuing revelation.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-[var(--color-text-primary)]">Founded:</strong>
                  <p className="text-[var(--color-text-secondary)]">1860 (Amboy, Illinois)</p>
                </div>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Headquarters:</strong>
                  <p className="text-[var(--color-text-secondary)]">Independence, Missouri</p>
                </div>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Current President:</strong>
                  <p className="text-[var(--color-text-secondary)]">
                    Stephen M. Veazey (2005-present)
                  </p>
                </div>
                <div>
                  <strong className="text-[var(--color-text-primary)]">Members:</strong>
                  <p className="text-[var(--color-text-secondary)]">~250,000 worldwide</p>
                </div>
              </div>
            </div>
          </section>

          {/* Eight Sacraments */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Eight Sacraments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Baptism', desc: 'By immersion for believers' },
                { name: 'Confirmation', desc: 'Gift of the Holy Spirit' },
                { name: "Lord's Supper", desc: 'Open communion, remembering Christ' },
                { name: 'Laying on of Hands', desc: 'For healing and blessing' },
                { name: 'Ordination', desc: 'To priesthood (all genders since 1984)' },
                { name: 'Marriage', desc: 'Sacred covenant relationship' },
                {
                  name: 'Blessing of Children',
                  desc: 'Welcome to community (not saving ordinance)',
                },
                { name: 'Evangelist Blessing', desc: 'Personal ministry and guidance' },
              ].map((sacrament, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg border border-[var(--color-border)]"
                >
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    {i + 1}. {sacrament.name}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">{sacrament.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 italic">
              Note: These are sacraments, not &quot;saving ordinances.&quot; CoC does not practice
              temple work for the dead or proxy ordinances as in LDS tradition.
            </p>
          </section>

          {/* Enduring Principles */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Enduring Principles
            </h3>
            <div className="bg-[var(--color-accent)]/10 rounded-lg p-4 border border-[var(--color-accent)]/20">
              <ul className="space-y-2">
                {[
                  'Grace and generosity',
                  'Sacredness of creation',
                  'Continuing revelation',
                  'Worth of all persons',
                  'All are called',
                  'Responsible choices',
                  'Pursuit of peace (Shalom)',
                  'Unity in diversity',
                  'Blessings of community',
                ].map((principle, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-[var(--color-accent)] mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[var(--color-text-primary)]">{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Key Distinctions */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Key Distinctions from LDS Church
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Women Ordained to Priesthood',
                  desc: 'Since 1984 (Section 156), women serve in all priesthood offices. Currently ~25% of CoC priesthood are women.',
                },
                {
                  title: 'Eight Sacraments (Not Temple Ordinances)',
                  desc: 'CoC practices eight sacraments in congregations. No temple endowment or sealing ceremonies.',
                },
                {
                  title: 'No Baptism for the Dead',
                  desc: 'CoC does not believe in proxy ordinances or temple work for deceased persons.',
                },
                {
                  title: 'LGBTQ+ Inclusive Policies',
                  desc: 'LGBTQ+ members may be baptized, ordained, and married. Full inclusion supported.',
                },
                {
                  title: 'Peace and Justice Mission',
                  desc: 'Central to CoC identity. Independence Temple dedicated to peace. Active in social justice work.',
                },
                {
                  title: 'Progressive Christianity',
                  desc: 'Open to diverse interpretations of scripture, including non-literal readings of Book of Mormon.',
                },
                {
                  title: 'Environmental Stewardship',
                  desc: 'Sacredness of creation is an enduring principle. Active in climate and conservation efforts.',
                },
                {
                  title: 'Continuing Revelation',
                  desc: 'Latest revelation: Section 167 (2025). Canon is not closed; prophecy continues.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg border border-[var(--color-border)]"
                >
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Historical Context */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Historical Context: 1844 Succession Crisis
            </h3>
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 border border-[var(--color-border)]">
              <p className="text-[var(--color-text-primary)] mb-3">
                After Joseph Smith Jr.&apos;s death in 1844, multiple succession claims emerged:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)] ml-4 mb-3">
                <li>
                  <strong>Brigham Young</strong> - Led a group to Utah (became LDS Church)
                </li>
                <li>
                  <strong>Sidney Rigdon</strong> - Claimed First Presidency succession
                </li>
                <li>
                  <strong>James Strang</strong> - Claimed angelic ordination (Strangite movement)
                </li>
                <li>
                  <strong>Lyman Wight</strong> - Led Texas colony
                </li>
                <li>
                  <strong>Joseph Smith III</strong> - Lineal succession (became RLDS/CoC)
                </li>
              </ul>
              <p className="text-[var(--color-text-secondary)] mb-2">
                <strong>1860 Reorganization:</strong> Joseph Smith III (age 27) accepted leadership
                after 16 years of resistance. Emma Smith (his mother) and many who remained in the
                Midwest formed the Reorganized Church.
              </p>
              <p className="text-[var(--color-text-secondary)]">
                <strong>Key Differences from Start:</strong> RLDS explicitly rejected polygamy,
                stayed in Midwest (Independence focus), emphasized democratic governance, and
                continued prophetic ministry.
              </p>
            </div>
          </section>

          {/* Temples */}
          <section>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
              Temple Theology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg border border-[var(--color-border)]">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  Kirtland Temple
                </h4>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Owned by CoC from 1880 to 2024</li>
                  <li>• Sold to the LDS Church in 2024</li>
                  <li>• Proceeds support CoC&apos;s mission and historic preservation</li>
                  <li>• Still open for tours under LDS Church stewardship</li>
                </ul>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg border border-[var(--color-border)]">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  Independence Temple
                </h4>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Dedicated 1994 to peace</li>
                  <li>• Spiral design symbolizing journey</li>
                  <li>• Open to all people</li>
                  <li>• Meditation and worship space</li>
                  <li>• Daily Prayer for Peace</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 italic">
              Note: CoC temples are for worship, meditation, and peace - not for exclusive
              ordinances or work for the dead as in LDS tradition.
            </p>
          </section>

          {/* Learn More */}
          <section className="border-t border-[var(--color-border-light)] pt-4">
            <div className="flex justify-between items-center">
              <a
                href="https://cofchrist.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[var(--color-accent)] hover:underline"
              >
                Visit Official Website
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <motion.button
                onClick={onClose}
                whileTap={tapPress}
                className="bg-[var(--color-accent)] hover:opacity-90 text-white font-medium py-2 px-6 rounded-lg transition-opacity"
              >
                Close
              </motion.button>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
