# Greptile Configuration Guide

This document explains the Greptile configuration file (`greptile.json`) used for AI-powered code reviews in pull requests.

## Table of Contents
- [What is Greptile?](#what-is-greptile)
- [PR Labels](#pr-labels)
- [Configuration Options](#configuration-options)
- [Custom Context](#custom-context)
- [Best Practices](#best-practices)

---

## What is Greptile?

Greptile is an AI-powered code review tool that automatically reviews pull requests based on your repository's context and coding standards. It integrates with GitHub/GitLab and provides intelligent feedback on code changes.

---

## Current Configuration Summary

**Tenant-Easy Project Configuration:**

| Setting | Value | Description |
|---------|-------|-------------|
| **Labels** | 14 labels | feature, bug, bugfix, hotfix, enhancement, optimization, performance, refactor, security, test, chore, breaking-change, dependency, ci-cd |
| **Strictness** | 2 (Medium) | Balanced review depth |
| **Comment Types** | logic, syntax, style | Types of feedback provided |
| **Trigger on Updates** | ✅ Enabled | Re-reviews when PR is updated |
| **Status Check** | ✅ Enabled | Blocks merge until review complete |
| **Pattern Repository** | Saleos-Sam/easy-tenant-backend | References backend for consistency |
| **Include Authors** | Sampath-04 | Reviews PRs from this author |
| **Target Branches** | main, develop | Only reviews PRs to these branches |
| **Custom Rules** | 10 rules | Project-specific coding standards |
| **Ignore Keywords** | 5 keywords | Skips linter, prettier, rename, doc updates |

---

## PR Labels

Labels that trigger Greptile reviews when added to a pull request. Add any of these labels to activate AI review:

### 🎯 **feature**
- **Use for:** New features or functionality being added to the application
- **Example:** Adding a new payment gateway, creating a new dashboard component
- **Review focus:** Architecture, integration, user experience

### 🐛 **bug** / **bugfix**
- **Use for:** Fixing existing issues or defects in the code
- **Example:** Fixing broken authentication, resolving calculation errors
- **Review focus:** Root cause analysis, edge cases, regression prevention

### 🚨 **hotfix**
- **Use for:** Urgent production fixes that need immediate deployment
- **Example:** Critical security patch, production outage fix
- **Review focus:** Minimal changes, quick verification, side effects

### ✨ **enhancement**
- **Use for:** Improvements or additions to existing features
- **Example:** Adding filters to a table, improving error messages
- **Review focus:** UX improvements, backward compatibility

### ⚡ **optimization** / **performance**
- **Use for:** Performance improvements, code optimization, efficiency gains
- **Example:** Database query optimization, reducing bundle size, caching strategies
- **Review focus:** Benchmarks, algorithm efficiency, resource usage

### 🔨 **refactor**
- **Use for:** Code restructuring without changing external behavior
- **Example:** Extracting reusable functions, cleaning up duplicated code
- **Review focus:** Code quality, maintainability, testing coverage

### 🔒 **security**
- **Use for:** Security-related changes, vulnerability fixes, auth improvements
- **Example:** Input sanitization, authentication hardening, dependency updates
- **Review focus:** Security best practices, potential vulnerabilities, compliance

### 🧪 **test**
- **Use for:** Adding or modifying tests (unit, integration, e2e)
- **Example:** Adding test coverage, fixing flaky tests
- **Review focus:** Test coverage, edge cases, assertion quality

### 🔧 **chore**
- **Use for:** Maintenance tasks, tooling updates, configuration changes
- **Example:** Updating package.json, modifying build scripts
- **Review focus:** Build integrity, dependency compatibility

### 💥 **breaking-change**
- **Use for:** Changes that break backward compatibility or require migration
- **Example:** API contract changes, removing deprecated features
- **Review focus:** Migration path, documentation, version strategy

### 📦 **dependency**
- **Use for:** Adding, updating, or removing dependencies
- **Example:** npm package updates, security patches
- **Review focus:** Version compatibility, security advisories, bundle size

### 🔄 **ci-cd**
- **Use for:** CI/CD pipeline changes, workflow modifications, deployment configs
- **Example:** GitHub Actions updates, Docker configuration changes
- **Review focus:** Pipeline reliability, deployment safety

---

## Configuration Options

### Basic Settings

#### `comment`
```json
"comment": "Disclaimer: This is AI-generated."
```
- **Type:** String
- **Purpose:** Disclaimer message added to all Greptile review comments
- **Usage:** Inform users that feedback is AI-generated

#### `commentTypes`
```json
"commentTypes": ["logic", "syntax", "style"]
```
- **Type:** Array of strings
- **Options:** `logic`, `syntax`, `style`, `security`, `performance`
- **Purpose:** Types of comments Greptile will provide
  - **logic:** Business logic issues, algorithm problems
  - **syntax:** Code syntax errors or warnings
  - **style:** Code style and formatting issues

---

### Filtering & Triggers

#### `labels`
```json
"labels": ["feature", "bug", ...]
```
- **Type:** Array of strings
- **Purpose:** PR labels that **trigger** Greptile reviews
- **Usage:** Only PRs with these labels will be reviewed

#### `disabledLabels`
```json
"disabledLabels": ["docs"]
```
- **Type:** Array of strings
- **Purpose:** PR labels that **prevent** Greptile reviews
- **Usage:** Skip reviews for documentation-only changes, minor updates

#### `ignoreKeywords`
```json
"ignoreKeywords": "rename\nlinter\nprettier\ngreptile-ignor\ndoc update"
```
- **Type:** Newline-separated string
- **Purpose:** Skip reviews if PR title/description contains these keywords
- **Usage:** Avoid unnecessary reviews for automated changes, formatting, documentation updates
- **Current keywords:**
  - `rename` - Variable/function renaming
  - `linter` - Linter configuration changes
  - `prettier` - Code formatting changes
  - `greptile-ignor` - Explicit skip instruction
  - `doc update` - Documentation updates

#### `includeKeywords`
```json
"includeKeywords": "bug\nfeature"
```
- **Type:** Newline-separated string
- **Purpose:** Only review PRs with these keywords in title/description
- **Usage:** Further filter which PRs get reviewed

#### `ignorePatterns`
```json
"ignorePatterns": "greptile.json\ntesting/**/*.py\n*.md\n*.txt\n*.json"
```
- **Type:** Newline-separated glob patterns
- **Purpose:** File patterns to exclude from review
- **Usage:** Skip config files, documentation, test data

---

### Author Control

#### `includeAuthors`
```json
"includeAuthors": ["Sampath-04"]
```
- **Type:** Array of GitHub/GitLab usernames
- **Purpose:** Only review PRs from these specific authors
- **Usage:** Focus reviews on specific team members. In this project, reviews are configured for user **Sampath-04**
- **Note:** Leave empty array `[]` to review PRs from all authors

#### `excludeAuthors`
```json
"excludeAuthors": []
```
- **Type:** Array of GitHub/GitLab usernames
- **Purpose:** Skip reviews from these authors
- **Usage:** Exclude bot accounts or specific users. Currently **no authors are excluded** in this project

---

### Branch Control

#### `includeBranches`
```json
"includeBranches": ["main", "develop"]
```
- **Type:** Array of branch names
- **Purpose:** Only review PRs targeting these branches
- **Usage:** Focus on production/staging branches

#### `excludeBranches`
```json
"excludeBranches": ["draft", "wip"]
```
- **Type:** Array of branch names
- **Purpose:** Skip reviews for PRs from these branches
- **Usage:** Avoid reviewing work-in-progress branches

---

### Review Behavior

#### `triggerOnUpdates`
```json
"triggerOnUpdates": true
```
- **Type:** Boolean
- **Purpose:** Re-trigger review when PR is updated with new commits
- **Default:** `false`

#### `shouldUpdateDescription`
```json
"shouldUpdateDescription": false
```
- **Type:** Boolean
- **Purpose:** Allow Greptile to update PR description with review summary
- **Default:** `false`

#### `strictness`
```json
"strictness": 2
```
- **Type:** Number (0-3)
- **Purpose:** Control review thoroughness
  - **0:** Minimal - Only critical issues
  - **1:** Low - Important issues
  - **2:** Medium - Standard review (recommended)
  - **3:** High - Very thorough, may flag minor issues

#### `fixWithAI`
```json
"fixWithAI": false
```
- **Type:** Boolean
- **Purpose:** Allow Greptile to suggest code fixes
- **Warning:** Experimental feature

#### `statusCheck`
```json
"statusCheck": true
```
- **Type:** Boolean
- **Purpose:** Create a GitHub status check for the review
- **Usage:** Block PR merge until review is complete

---

### Pattern Repositories

#### `patternRepositories`
```json
"patternRepositories": ["Saleos-Sam/easy-tenant-backend"]
```
- **Type:** Array of repository names (format: `organization/repo-name`)
- **Purpose:** Reference other repositories for coding patterns and standards
- **Usage:** Maintain consistency across multiple repos
- **Current setup:** References the backend repository **Saleos-Sam/easy-tenant-backend** to understand API contracts, validation logic, and ensure frontend-backend consistency

---

### Review Sections

Control which sections appear in Greptile's review comments:

#### `summarySection`
```json
"summarySection": {
  "included": true,
  "collapsible": false,
  "defaultOpen": false
}
```
- **included:** Show/hide the summary section
- **collapsible:** Make section collapsible
- **defaultOpen:** Default collapsed state

#### `issuesTableSection`
```json
"issuesTableSection": {
  "included": true,
  "collapsible": false,
  "defaultOpen": false
}
```
- **Purpose:** Table of all issues found in the review

#### `confidenceScoreSection`
```json
"confidenceScoreSection": {
  "included": true,
  "collapsible": false,
  "defaultOpen": false
}
```
- **Purpose:** Shows AI confidence scores for each comment

#### `sequenceDiagramSection`
```json
"sequenceDiagramSection": {
  "included": false,
  "collapsible": false,
  "defaultOpen": false
}
```
- **Purpose:** Visual sequence diagrams for complex logic flows
- **Current setup:** **Disabled** to keep reviews focused on code analysis without visual diagrams

---

## Custom Context

Define custom rules and context for specific file patterns. This project has **10 custom rules** tailored for the Tenant-Easy application.

### Rule Format

Each rule follows the **What/Why/Good/Bad** format:
- **What:** Description of the rule
- **Why:** Reasoning behind the rule
- **Good:** Example of correct implementation
- **Bad:** Example of incorrect implementation

### Current Custom Rules

#### 1. React Query Hook Pattern
- **Scope:** `hooks/**/*.ts`
- **Focus:** Centralized query key factories with TanStack Query
- Ensures consistent caching, invalidation, and data synchronization

#### 2. Error Logging with Context
- **Scope:** `**/*.ts`, `**/*.tsx`
- **Focus:** Use `console.error` with descriptive context for errors
- Makes debugging easier with proper severity levels

#### 3. API Client Usage
- **Scope:** `lib/api/**/*.ts`
- **Focus:** Use centralized `apiClient` from `lib/api/client.ts`
- Ensures consistent auth headers, error handling, and request formatting

#### 4. TypeScript Interface Exports
- **Scope:** `lib/api/**/*.ts`
- **Focus:** Export all interfaces and types used in API responses
- Enables type reuse and ensures type safety throughout the app

#### 5. Auth Guard for Protected Routes
- **Scope:** `app/**/page.tsx`
- **Focus:** Wrap pages with `AuthGuard` and specify `allowedRoles`
- Prevents unauthorized access with role-based access control

#### 6. FormData Handling for File Uploads
- **Scope:** `lib/api/**/*.ts`
- **Focus:** Use `FormData` for API requests with file uploads
- Proper multipart/form-data content type handling

#### 7. Query Client Invalidation on Mutations
- **Scope:** `hooks/**/*.ts`
- **Focus:** Invalidate queries in mutation `onSuccess` handlers
- Ensures UI reflects latest data after mutations

#### 8. Client-Side Component Directive
- **Scope:** `app/**/*.tsx`, `components/**/*.tsx`, `contexts/**/*.tsx`
- **Focus:** Add `'use client'` directive for components using React hooks
- Required by Next.js App Router for client-side features

#### 9. Consistent API Response Types
- **Scope:** `lib/api/**/*.ts`
- **Focus:** Define consistent response wrapper types (success, data, message)
- Standardizes error handling and response parsing

#### 10. Environment Variable Access
- **Scope:** `**/*.ts`, `**/*.tsx`
- **Focus:** Access env vars through `config.ts` with `NEXT_PUBLIC_` prefix
- Centralized configuration management and proper variable exposure

### Rule Structure Example

```json
{
  "scope": ["hooks/**/*.ts"],
  "rule": "What: Use TanStack Query hooks with proper query keys structure\n\nWhy: Ensures consistent caching\n\nGood:\nexport const keys = { all: ['items'] as const };\n\nBad:\nqueryKey: ['items'] // No centralized structure"
}
```

---