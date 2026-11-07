# ChillAgent Comprehensive Operational Guide

> Master Negative Filter, Anti-Slop 2.0, and Pragmatic Senior Developer Standard.

---

## What is ChillAgent?

ChillAgent is a dual-core intelligence layer for AI coding assistants that stops two of the most common AI failure modes:
1. **AI Visual Slop:** Cookie-cutter landing pages with purple gradients, bubbly rounded-3xl cards, generic Lucide-style star icons, and fake metrics.
2. **AI Architectural Over-Engineering:** Writing 5 classes, factory wrappers, and custom repository interfaces for a simple 10-line routine.

---

## The Core Mechanisms

### 1. The Purpose Test (Visual Craftsmanship)
Before rendering any gradient, badge, glassmorphic layer, or shadow, ask:
> *"What specific communicative or domain hierarchy goal does this serve?"*
If the answer is *"it looks modern"* or *"it fills space"*, delete it immediately.

### 2. The 6-Step Minimalist Execution Ladder (Ponytail Creed)
1. Does it need to exist? (Skip unrequested features)
2. Already in this codebase? (Reuse existing house patterns)
3. Standard library or native platform? (Node stdlib, native CSS/HTML)
4. Already-installed dependency? (Use `package.json` packages)
5. Can it be one readable line? (Write the one line)
6. Minimum working code.

### 3. Intensity Controls
Switch intensity modes in chat anytime:
- `/chill lite`: Prototyping mode.
- `/chill full`: Production default.
- `/chill ultra`: Maximum minimalism and audit rigor.

### 4. SlopSieve Runtime Pruning & Loop Circuit Breaker
When running agents through `chillrewind run`:
- Stale tool outputs older than 4 conversation turns exceeding 1.5KB are pruned middle-out, saving up to 80% context tokens.
- If an agent calls the exact same tool with identical arguments 3 times consecutively, the circuit breaker halts upstream calls to stop runaway token burn.

### 5. Mandatory Delivery Disclosure
At the conclusion of every non-trivial technical response, provide:
```markdown
---
**Skipped:** [Deliberately omitted features or abstractions]
**Risk / Limits:** [Known limits and trigger conditions for upgrading]
```


## The Anti-Slop Skills

<!-- antislop:skills:start -->
### antislop

The core, and it is always loaded. All 40 rules and the Delivery Gate live here, so every task gets them whether or not you pick anything else. The five skills below add depth to it.

### antislop-ui

Load it when the AI builds or restyles anything you can see: color, layout, cards, buttons, motion. Sized media and load priority are built in.

| What it covers | The patterns it names |
|----------------|-----------------------|
| Visual & Color | Generic Blue-Purple Gradient, Excessive Glassmorphism, Excessive Border Radius, Overly Soft Shadows, Glow Everywhere, Background Grid, Dark Mode Default for No Reason, Too Many Colors in the Palette, Excessive Accent Color, Sterile Default |
| Layout & Components | Monotonous Template Layout, Copy-Paste Feature Cards, Bento Grid, Uniform Spacing, "How It Works" Always 3 Steps, "Trusted By" Logo Bar, "Most Popular" Pricing Card, Demo Without a Product, 4-Column Template Footer, Uniform Section Rhythm |
| Decorative Elements | Generic AI Icons, Lucide Icons, Emoji as Decoration, Small Arrows on Every Button, Colored Left Stripe, AI Capsule Badges, Eyebrow Badge Above the Headline, Decorative Status Dot, Generic AI Typography, Fake Terminal Window, Illustrations With No Connection |
| Structural & Flow | Dead Navigation, Non-Functional Controls, Sections That Fill a Template |
| App & Dashboard | Default Dashboard Shell, Stat Cards With Invented Numbers, Filler Activity Feed, Charts Without a Question, Generic Table Columns, Filler Data in Fields and Columns, Placeholder Empty and Loading States |
| Motion | Endless Pulses and Loops, Template Animations Stacked |
| Performance | Unsized Media That Shifts the Layout, Hero Image Loaded Like Any Other Image, Render-Blocking Third-Party Script |
| Page Basics | Web Baseline Checklist |

### antislop-copywriting

Load it when the AI writes or edits text: headlines, buttons, emails, or a page of prose. It removes the excited, empty voice and the made-up numbers.

| What it covers | The patterns it names |
|----------------|-----------------------|
| Tone & Voice | Empty AI Vocabulary, Significance Inflation, Empty Claims and Social Proof with No Evidence, Weasel Attributions, Persuasive Authority Tropes, Chatbot Closers, Fake-Candid Openers, Signposting Announcements, Temporal Runway Clichés, All-Caps Emphasis, Actorless Passive, Inanimate Subject, Human Verb |
| Rhythm & Structure | Rule of Three Overuse, Negative Parallelism and Tailing Negations, Aphorism Formulas, Staccato Drama, Theatrical Takeaways, Synonym Cycling, False Ranges |
| Honesty & Evidence | Fabricated Specifics, Speculative Gap-Filling, Generic Positive Conclusion |
| Hygiene & Markdown | Em Dashes, Boldface Overuse, Excessive Quotation Marks, Inline-Header Lists, Title Case in List Elements, Emojis in Headings, Filler Phrases, Excessive Hedging |

### antislop-human

Load it when real people have to use the result. Readable colors, keyboard use, visible focus, button states, the pointer cursor and other interaction affordances, WCAG 2.2 references, and the contrast checker.

| What it covers | The patterns it names |
|----------------|-----------------------|
| Color & Contrast | Low-Contrast Text, Text Over a Photo or Gradient, The Grey-on-Grey Hallucination, Non-Text Contrast |
| Keyboard | Removed Focus Outline, Mouse-Only Patterns, Broken Tab Order |
| Focus & States | Weak or Invisible Focus Indicator, Color-Only Feedback, Missing UI States |
| Zoom & Mobile Use | Text That Cannot Zoom, Mobile Keyboard Covers the Form |
| Interaction Affordances | Clickable Without a Pointer Cursor, Div or Span Pretending to Be a Control, Icon-Only Control With No Name, No Hover, Active, or Disabled State, Motion That Ignores the User Setting, Form Field Without a Real Label, Missing Page-Level Semantics (whole documents only) |

### antislop-layoutmobile

Load it when the same page has to work on a phone and on a desktop. Reflow, breakpoints, overflow, tap targets, mobile navigation.

| What it covers | The patterns it names |
|----------------|-----------------------|
| Breakpoints | Desktop-Only Layout, Breakpoint Driven by Device List, Mobile Styled Last, Two-State Layout |
| Scale & Sizing | Desktop-Sized Everything, Fixed Pixel Type, 100vh Sections, Huge Empty Padding |
| Grids & Stacking | Columns That Don't Collapse, Fixed-Width Grid, Forced 12-Column |
| Overflow | Horizontal Scroll Leak, Overflow Hidden Clipping, Fixed-Width Children |
| Tap Targets | Under-Sized Targets, Targets Too Close, Hover-Only Interactions |
| Mobile Navigation | Nav That Stays Desktop, The Bare Hamburger, Bottom Nav That Eats Content, Sticky Nav Steals the Screen |

### antislop-code

Load it when the AI writes or reviews code comments. It removes the ones an AI adds out of habit and keeps the ones that carry information.

| What it covers | The patterns it names |
|----------------|-----------------------|
| Comments That Add Nothing | Decorative Separators, Restating the Obvious, Workflow Narration, Empty Labels, Vague Placeholders, Signature Echo, Decorative Emoji, End Markers |
| How It Should Read | The Over-Explained Comment, Line-by-Line Narration, Stiff or Loud Wording |
<!-- antislop:skills:end -->
