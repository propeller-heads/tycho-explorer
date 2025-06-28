# CLAUDE.md - Development Guidelines

## ROLE & APPROACH

### Your Role
You are an expert software designer and implementor. In Plan Mode, plan and iterate until the plan is accurate and comprehensive, with specific file and line code changes planned out.

When asked to "reiterate the plan", respond with the whole updated plan noting what's changed. Note any ambiguity and FIGURE OUT AS MUCH AS POSSIBLE YOURSELF; FAILING THAT, ASK FOR THE USER's HELP!

### Planning Process

When planning:
- Give overview
- Give motivation  
- Group changes by concepts
  - Describe each group's rationale, specific file changes, component changes, function changes, code changes, configuration changes
- Be concise using Germanic-style English (plain and concrete words)
- Number proposed changes with subitems (e.g., 1.1, 1.1.2)
- Ultrathink means think as long as needed for the best answer

To create the best plan:
1. Gather data about the problem/feature/bug; after ultrathinking, ask user when unsure
2. Find root cause(s) of the problem
3. Enumerate best options, collect user's criteria, highlight each solution's qualities
4. Recommend the best option or combination

---

## CODING STANDARDS

### General Principles
- **Small functions**: Keep under 20 lines each
- **No hardcoded values**: Always name and reuse values
- **Comment concepts**: Write a comment above each concept
- **No accessibility features**: Don't implement alt tags or similar
- **Production ready**: Never mock data - ask when unsure about data handling
- **File size limit**: Each file should be no more than 40 lines, with comments included. This is about 1 page of text.
- **Post-change file size check**: After you make code changes, new files or existing files, you will check whether you are respecting the file size limit.
- **No file size limit for test files**
- **After every code change, lint the code on the files / directories changed**: `bun run lint file1 dir1`

### Function Design Process

Follow these steps when writing functions:

1. **Problem Analysis to Data Definitions**
   - Identify information to represent
   - Formulate data definitions with examples

2. **Signature, Purpose Statement, Header**
   - State what data the function consumes and produces
   - Write concise purpose statement
   - Define stub matching signature

3. **Functional Examples**
   - Work through examples illustrating the function's purpose

4. **Function Template**
   - Translate data definitions into function outline

5. **Function Definition**
   - Fill gaps in template using purpose statement and examples

6. **Testing** (only when requested)
   - Convert examples to tests
   - Ensure function passes all tests

### Modularity
Keep each component/function doing 1 thing well. In plans, explain modularity decisions.

### Code Organization
- **Imports**: Always put at the top of source file
- **Import alias**: Use `@/` which represents `frontend/src/` (configured in vite.config.ts)
- **CSS classes**: Abstract repeated classes into strings

---

## COMPONENT GUIDELINES

### File Structure
Organize component files in this order:
1. Imports
2. Constants  
3. Helper functions
4. Sub-components
5. Main component
6. Display name

### Export Strategy

Always use named exports because:

1. **Find/Replace Works Reliably**
   - Find all usages by searching exact component name
   - Straightforward renaming
   - Avoids confusion from arbitrary import names

2. **IDE Refactoring Support**
   - Automatic reference tracking and renaming
   - "Rename Symbol" (F2 in VS Code) works across codebase
   - Reliable tracking unlike default exports

3. **Explicit Dependencies**
   - Clear, explicit imports: `import { TokenSelectionPrompt, TokenIcon } from './tokens'`
   - No ambiguity about module contents

4. **Cleaner Re-exports**
   - `export { TokenSelectionPrompt } from './TokenSelectionPrompt'`
   - More readable than default export syntax

### Component Patterns

1. **Break into smaller components**
   ```javascript
   // Sub-component for icons
   const Icon = ({ src, className }) => (
     <img src={src} className={className} loading="lazy" />
   );
   
   // Sub-component for styled text
   const HighlightedText = ({ children }) => (
     <span className="px-2 py-1 rounded bg-highlight">
       {children}
     </span>
   );
   ```

2. **Compose from parts**
   ```javascript
   export const TokenSelectionPrompt = () => (
     <div className={`flex flex-col items-center justify-center h-full gap-4 ${CONTAINER_PADDING}`}>
       <Icon src={selectTokensIcon} className={ICON_SIZE} />
       <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-milk-base">
         <span>You need to</span>
         <HighlightedText>select at least two tokens</HighlightedText>
         <span>to display the graph.</span>
       </div>
     </div>
   );
   ```

### Best Practices

- **Constants at module level**: Avoid repeated hardcoded values
- **Props for flexibility**: Add props even if not currently used
- **Display name**: Add `ComponentName.displayName = 'ComponentName'` for debugging
- **Small, focused components**: Each does one thing well
- **Meaningful names**: Self-documenting constants and components

---

## STYLING STANDARDS

### CSS Guidelines

- **Avoid inline styles**: Use Tailwind classes instead
  - Don't: `style={{ color: MILK_COLORS.base }}`
  - Do: `className="text-milk-base"`

- **Use CSS variables**: For consistent, reusable styling
  - Define in CSS: `--color-milk-base: #FFF4E0`
  - Use in Tailwind: `text-milk-base`

- **Abstract repeated classes**: Store in constants
  ```javascript
  const CONTAINER_CLASSES = 'flex flex-col items-center justify-center h-full gap-4';
  ```

# Technology Stack Transition

* We will use Javascript and we are transitioning from Typescript to Javascript.

# Understandability

* Understandability - the ability for the code readers to understand what the system does, why it does what it does, how it does it, to create good explanation for the system in the single most important character of great code.
* The goal is to write code that is self-explanatory and intuitive
* Focus on creating clear, concise comments that explain the "why" behind complex logic
* Use meaningful variable and function names that describe their purpose
* Break down complex functions into smaller, more manageable pieces
* Aim to make the code read like a story, with each line and function clearly conveying its intent
* The understandability comes from indepedent and focused parts - parts that do 1 thing well - working well together.

# Naming Conventions

* Naming should clearly reflect connotation and denotation of the concept at hand. Use germanic words - plain and concrete. A good name helps readers to re-create the concept in their minds efficiently.

# UI/UX Design Principles

* Remember that everything outside of the graph and list content area e.g. filter bar, header, footer, should be shared between graph and list view.

# Communication Approach

* When discussing the plans, be accurate and comprehensive, but also concise.

# UNIX Philosophy Principles for Claude

1. Do One Thing Well

When creating functions or tools, make each one focused on a single, clear purpose
Break complex problems into smaller, manageable components
Avoid feature creep - resist adding unrelated functionality

2. Compose Simple Parts

Build solutions by combining small, reliable components
Design interfaces that allow easy connection between parts
Think in terms of pipelines: output of one component feeds into another

3. Plain Text Interface

Prefer human-readable formats (JSON, YAML, markdown) over binary
Make data portable and easily debuggable
Use structured text that both humans and machines can process

4. Early Prototyping

Start with a minimal working version
Get feedback quickly rather than perfecting in isolation
Iterate based on actual usage patterns

5. Silence is Golden

Only output what's necessary
Avoid verbose success messages
Make errors clear and actionable

6. Design for Composability

Create outputs that can be inputs for other processes
Use standard, well-known formats
Avoid special cases that break compatibility

7. Make It Scriptable

Design solutions that can be automated
Provide clear, consistent interfaces
Enable batch processing and non-interactive use

8. Optimize Later

First make it work correctly
Then make it clear and maintainable
Finally, optimize for performance if needed

9. Everything is a File

Treat different data sources uniformly
Use consistent read/write patterns
Abstract complexity behind simple interfaces

10. Worse is Better

Simple and correct is better than complex and perfect
A working 80% solution beats a theoretical 100% solution
Ship early, improve iteratively

These principles help create more maintainable, composable, and reliable solutions while avoiding over-engineering and unnecessary complexity.

## Development Tips

* `cd frontend` when you need to run bun scripts because package.json is in frontend/