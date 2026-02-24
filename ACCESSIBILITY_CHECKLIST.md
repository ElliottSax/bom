# Accessibility Checklist

Use this checklist when creating new components or features to ensure WCAG 2.1 AA compliance.

## General Guidelines

### ✅ Semantic HTML
- [ ] Use proper HTML5 elements (`<button>`, `<nav>`, `<main>`, etc.)
- [ ] Use `<button>` for actions, `<a>` for navigation
- [ ] Use proper heading hierarchy (h1 → h2 → h3)
- [ ] Use `<label>` for all form inputs
- [ ] Use `<form>` for form groups

### ✅ Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Focus indicators are clearly visible
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate where appropriate (tabs, lists)

### ✅ Color & Contrast
- [ ] Text contrast ≥ 4.5:1 (normal text)
- [ ] Text contrast ≥ 3:1 (large text 18pt+)
- [ ] UI elements contrast ≥ 3:1
- [ ] Don't rely on color alone to convey information
- [ ] Dark mode also meets contrast requirements

### ✅ Images & Icons
- [ ] All images have alt text
- [ ] Decorative images have `alt=""` or `aria-hidden="true"`
- [ ] Icon-only buttons have `aria-label`
- [ ] SVG icons have `aria-hidden="true"` when decorative

---

## Component-Specific Checklists

### Modals / Dialogs

```tsx
// Required attributes
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Title</h2>
  {/* content */}
  <button aria-label="Close modal">×</button>
</div>
```

**Checklist:**
- [ ] `role="dialog"` and `aria-modal="true"`
- [ ] `aria-labelledby` points to title
- [ ] Focus trapped inside modal
- [ ] Escape key closes modal
- [ ] Close button has descriptive label
- [ ] Focus returns to trigger on close

---

### Forms

```tsx
<form aria-label="Form name">
  <label htmlFor="name">Name</label>
  <input
    id="name"
    type="text"
    required
    aria-describedby="name-hint"
  />
  <span id="name-hint">Helpful hint</span>

  {error && <div role="alert">{error}</div>}

  <button type="submit">Submit</button>
</form>
```

**Checklist:**
- [ ] All inputs have associated `<label>`
- [ ] Required fields marked (visually + `required` attribute)
- [ ] Error messages use `role="alert"`
- [ ] Hints use `aria-describedby`
- [ ] Submit button clearly labeled
- [ ] Loading state announced
- [ ] Success message announced

---

### Buttons

```tsx
// Good
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>

// Also good (visible text)
<button>
  <TrashIcon aria-hidden="true" />
  Delete
</button>

// Bad (no label)
<div onClick={handleClick}>
  <TrashIcon />
</div>
```

**Checklist:**
- [ ] Use `<button>` element (not `<div>` with onClick)
- [ ] Has visible text OR `aria-label`
- [ ] Icons have `aria-hidden="true"`
- [ ] Disabled state uses `disabled` attribute
- [ ] Loading state announced
- [ ] Type specified (`button`, `submit`, `reset`)

---

### Links

```tsx
// Good
<a href="/page" aria-label="Go to profile page">
  Profile
</a>

// Bad (vague)
<a href="/page">Click here</a>
```

**Checklist:**
- [ ] Has descriptive text (not "click here")
- [ ] External links indicated
- [ ] `target="_blank"` has warning
- [ ] Links look different from regular text

---

### Lists

```tsx
// Native HTML (preferred)
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// Custom (when needed)
<div role="list">
  <div role="listitem">Item 1</div>
  <div role="listitem">Item 2</div>
</div>
```

**Checklist:**
- [ ] Use native `<ul>`/`<ol>` when possible
- [ ] If custom, use `role="list"` and `role="listitem"`
- [ ] List items are focusable if interactive

---

### Loading States

```tsx
<div role="status" aria-live="polite">
  <Spinner aria-hidden="true" />
  <p>Loading data...</p>
</div>
```

**Checklist:**
- [ ] Use `role="status"` and `aria-live="polite"`
- [ ] Spinner is `aria-hidden="true"`
- [ ] Text describes what's loading
- [ ] Loading state announced to screen readers

---

### Error Messages

```tsx
{error && (
  <div role="alert">
    Error: {error}
  </div>
)}
```

**Checklist:**
- [ ] Use `role="alert"` for immediate attention
- [ ] Message is clear and actionable
- [ ] Associated with relevant form field
- [ ] Visible and announced to screen readers

---

### Progress Bars

```tsx
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${progress}% complete`}
>
  <div style={{ width: `${progress}%` }} />
</div>
```

**Checklist:**
- [ ] `role="progressbar"`
- [ ] `aria-valuenow` = current value
- [ ] `aria-valuemin` = minimum (usually 0)
- [ ] `aria-valuemax` = maximum (usually 100)
- [ ] `aria-label` or `aria-labelledby`
- [ ] Visual indicator matches aria value

---

### Tabs

```tsx
<div role="tablist" aria-label="Settings tabs">
  <button
    role="tab"
    aria-selected={active === 'general'}
    aria-controls="general-panel"
  >
    General
  </button>
  {/* more tabs */}
</div>

<div
  role="tabpanel"
  id="general-panel"
  aria-labelledby="general-tab"
>
  {/* panel content */}
</div>
```

**Checklist:**
- [ ] Container has `role="tablist"`
- [ ] Tabs have `role="tab"` and `aria-selected`
- [ ] Panels have `role="tabpanel"`
- [ ] `aria-controls` links tab to panel
- [ ] Arrow keys navigate between tabs
- [ ] Only selected panel shown

---

### Toggle Buttons

```tsx
<button
  aria-pressed={isActive}
  aria-label="Toggle dark mode"
>
  {isActive ? 'On' : 'Off'}
</button>
```

**Checklist:**
- [ ] Use `aria-pressed` (not `aria-selected`)
- [ ] Visual indicator of state
- [ ] Label describes action, not state
- [ ] State announced to screen readers

---

## React Native / Mobile

### Buttons

```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Delete item"
  accessibilityHint="Removes this item from your list"
  onPress={handleDelete}
>
  <TrashIcon />
</TouchableOpacity>
```

**Checklist:**
- [ ] `accessibilityRole="button"`
- [ ] `accessibilityLabel` describes action
- [ ] `accessibilityHint` explains result (optional)
- [ ] Touch target ≥ 44x44 points

---

### Images

```tsx
<Image
  source={imageSource}
  accessibilityLabel="Profile picture of John Doe"
/>

// Decorative
<Image
  source={decorativeImage}
  accessible={false}
/>
```

**Checklist:**
- [ ] All images have `accessibilityLabel`
- [ ] Decorative images use `accessible={false}`

---

### Text

```tsx
<Text accessibilityRole="header">
  Chapter Title
</Text>

<Text accessibilityRole="text">
  Body content
</Text>
```

**Checklist:**
- [ ] Headings use `accessibilityRole="header"`
- [ ] Long text is wrappable
- [ ] Text scales with system font size

---

### Lists

```tsx
<FlatList
  data={items}
  renderItem={({ item }) => (
    <View accessible accessibilityLabel={item.label}>
      {/* item content */}
    </View>
  )}
  accessibilityRole="list"
/>
```

**Checklist:**
- [ ] Container has `accessibilityRole="list"`
- [ ] Items are `accessible`
- [ ] Items have descriptive labels

---

## Testing Checklist

### Automated Testing
- [ ] Run axe-core or similar tool
- [ ] Check Lighthouse accessibility score (aim for 90+)
- [ ] Run WAVE accessibility checker
- [ ] Validate HTML with W3C validator

### Manual Testing - Keyboard
- [ ] Tab through entire page
- [ ] Verify focus order is logical
- [ ] Test all interactive elements
- [ ] Verify modal focus trap works
- [ ] Test Escape key closes overlays

### Manual Testing - Screen Reader

**Web:**
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (Mac)
- [ ] Verify all content announced
- [ ] Verify interactive elements labeled

**Mobile:**
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify swipe navigation works
- [ ] Verify all content announced

### Visual Testing
- [ ] Test at 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Test in dark mode
- [ ] Verify focus indicators visible
- [ ] Check color contrast ratios

---

## Common Mistakes to Avoid

❌ **Don't:**
- Use `<div>` or `<span>` with `onClick` for buttons
- Rely on color alone to convey information
- Use placeholder text as a label
- Hide content with `display: none` that should be announced
- Use `role="button"` on native `<button>` elements (redundant)
- Use `tabindex` values > 0 (disrupts natural order)
- Remove focus indicators

✅ **Do:**
- Use semantic HTML elements
- Provide text alternatives for non-text content
- Ensure keyboard accessibility
- Use ARIA attributes appropriately
- Test with actual assistive technologies
- Provide clear labels and instructions
- Maintain logical focus order

---

## Quick Reference - ARIA Attributes

### Common ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Names element | `<button aria-label="Close">×</button>` |
| `aria-labelledby` | Points to labeling element | `<div aria-labelledby="title-id">` |
| `aria-describedby` | Points to description | `<input aria-describedby="hint-id">` |
| `aria-hidden` | Hides from screen readers | `<Icon aria-hidden="true" />` |
| `aria-live` | Announces changes | `<div aria-live="polite">` |
| `aria-pressed` | Toggle button state | `<button aria-pressed={isOn}>` |
| `aria-expanded` | Collapsible state | `<button aria-expanded={isOpen}>` |
| `aria-selected` | Selected item | `<div role="tab" aria-selected>` |
| `aria-modal` | Modal dialog | `<div role="dialog" aria-modal>` |
| `aria-current` | Current item | `<a aria-current="page">` |

### ARIA Live Regions

| Value | Urgency | Use Case |
|-------|---------|----------|
| `polite` | Low | Status updates, search results |
| `assertive` | High | Errors, warnings, urgent notifications |
| `off` | None | No announcements (default) |

### Common Roles

| Role | Purpose | Native HTML |
|------|---------|-------------|
| `button` | Clickable button | `<button>` |
| `link` | Navigation link | `<a>` |
| `navigation` | Nav section | `<nav>` |
| `main` | Main content | `<main>` |
| `dialog` | Modal dialog | N/A |
| `alert` | Error/warning | N/A |
| `status` | Status update | N/A |
| `progressbar` | Progress indicator | N/A |
| `tab` | Tab in tablist | N/A |
| `tabpanel` | Tab panel | N/A |
| `list` | List of items | `<ul>`, `<ol>` |
| `listitem` | List item | `<li>` |

---

## Resources

### Official Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Lighthouse (Chrome DevTools)](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers
- [NVDA (Windows, Free)](https://www.nvaccess.org/)
- [JAWS (Windows, Paid)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (Mac/iOS, Built-in)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Android, Built-in)](https://support.google.com/accessibility/android/answer/6283677)

---

**Remember:** Accessibility is not optional. It's a requirement for building inclusive applications that everyone can use.

**Pro Tip:** Test early and often. It's much easier to build accessibility in from the start than to retrofit it later.
