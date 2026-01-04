# OpenNext.js CLI - Feature Roadmap & Improvements

## Current Features ✅
- `init` - Create new Next.js project with OpenNext.js
- `add` - Add OpenNext.js to existing project
- `config` - Update configuration
- Package manager auto-detection
- Interactive prompts with @clack/prompts
- Comprehensive help documentation

---

## High-Priority Features to Add

### 1. **Status/Info Command** (`opennextjs-cli status`)
**Purpose:** Show current project status and configuration

**Features:**
- Display detected Next.js version
- Show OpenNext.js configuration status
- List installed dependencies
- Show Cloudflare Worker name
- Display caching strategy
- Show environment configurations
- Check for updates

**Example:**
```bash
opennextjs-cli status
# Shows:
# ✓ Next.js 15.1.0 detected
# ✓ OpenNext.js Cloudflare configured
# ✓ Worker: my-app
# ✓ Caching: R2 Incremental Cache
# ✓ Environments: development, production
```

### 2. **Validate Command** (`opennextjs-cli validate`)
**Purpose:** Validate configuration and check for issues

**Features:**
- Validate wrangler.toml syntax
- Check open-next.config.ts configuration
- Verify package.json scripts
- Check for missing dependencies
- Validate Cloudflare account connection
- Check for common misconfigurations
- Suggest fixes for issues

**Example:**
```bash
opennextjs-cli validate
# Checks all configs and reports issues
```

### 3. **Deploy Command** (`opennextjs-cli deploy`)
**Purpose:** Deploy to Cloudflare Workers

**Features:**
- Build the project
- Deploy to Cloudflare
- Environment selection (dev/prod)
- Progress indicators
- Deployment URL output
- Rollback support

**Example:**
```bash
opennextjs-cli deploy
opennextjs-cli deploy --env production
opennextjs-cli deploy --preview
```

### 4. **Preview Command** (`opennextjs-cli preview`)
**Purpose:** Preview locally with Cloudflare Workers

**Features:**
- Start local preview server
- Show preview URL
- Hot reload support
- Environment variable loading

**Example:**
```bash
opennextjs-cli preview
opennextjs-cli preview --port 8787
```

### 5. **Package Manager Selection**
**Purpose:** Let users choose package manager during init

**Features:**
- Prompt for package manager (pnpm/npm/yarn/bun)
- Auto-detect if already in use
- Use selected manager throughout setup

**Enhancement:**
```bash
opennextjs-cli init
# Prompt: "Which package manager? [pnpm] npm yarn bun"
```

### 6. **Git Initialization**
**Purpose:** Optionally initialize git repo

**Features:**
- Prompt to initialize git
- Create .gitignore if needed
- Initial commit option
- GitHub repo creation (optional)

**Enhancement:**
```bash
opennextjs-cli init
# Prompt: "Initialize git repository? [Yes]"
```

### 7. **Update/Upgrade Command** (`opennextjs-cli update`)
**Purpose:** Update OpenNext.js configuration and dependencies

**Features:**
- Check for updates
- Update @opennextjs/cloudflare
- Update wrangler
- Migrate configuration if needed
- Show changelog

**Example:**
```bash
opennextjs-cli update
opennextjs-cli update --check
opennextjs-cli update --force
```

### 8. **Environment Variables Setup**
**Purpose:** Help set up environment variables

**Features:**
- Generate .env.example
- Prompt for Cloudflare account ID
- Set up wrangler secrets
- Validate environment variables

**Example:**
```bash
opennextjs-cli env
opennextjs-cli env --setup
opennextjs-cli env --validate
```

### 9. **Cloudflare Account Linking**
**Purpose:** Connect and verify Cloudflare account

**Features:**
- Check authentication status
- Link Cloudflare account
- Verify account ID
- Test connection

**Example:**
```bash
opennextjs-cli cloudflare login
opennextjs-cli cloudflare verify
opennextjs-cli cloudflare account
```

### 10. **Health Check Command** (`opennextjs-cli doctor`)
**Purpose:** Diagnose and fix common issues

**Features:**
- Check Node.js version
- Verify package manager installation
- Check Cloudflare CLI (wrangler)
- Validate project structure
- Check for common errors
- Auto-fix suggestions

**Example:**
```bash
opennextjs-cli doctor
# Runs all checks and suggests fixes
```

---

## Medium-Priority Features

### 11. **Template Selection**
**Purpose:** Choose from different starter templates

**Features:**
- Basic template (current)
- With authentication
- With database
- With analytics
- Custom template support

**Example:**
```bash
opennextjs-cli init --template basic
opennextjs-cli init --template with-auth
```

### 12. **Migration Helpers**
**Purpose:** Help migrate from other platforms

**Features:**
- Migrate from Vercel
- Migrate from Netlify
- Migrate from other adapters
- Configuration converter

**Example:**
```bash
opennextjs-cli migrate --from vercel
opennextjs-cli migrate --from netlify
```

### 13. **Dry-Run Mode**
**Purpose:** Preview changes without applying

**Features:**
- Show what would be created
- Preview configuration
- Validate without installing
- Show file diffs

**Example:**
```bash
opennextjs-cli add --dry-run
opennextjs-cli config --dry-run
```

### 14. **Verbose/Debug Mode**
**Purpose:** Detailed output for debugging

**Features:**
- Verbose logging
- Debug mode
- Show all commands executed
- Detailed error messages

**Example:**
```bash
opennextjs-cli add --verbose
opennextjs-cli init --debug
```

### 15. **Configuration Export/Import**
**Purpose:** Share and backup configurations

**Features:**
- Export configuration to JSON
- Import from JSON
- Share configs between projects
- Version control friendly

**Example:**
```bash
opennextjs-cli config export
opennextjs-cli config import config.json
```

### 16. **Telemetry (Optional)**
**Purpose:** Anonymous usage analytics

**Features:**
- Opt-in telemetry
- Track feature usage
- Error reporting
- Help improve the tool

**Example:**
```bash
opennextjs-cli telemetry enable
opennextjs-cli telemetry disable
```

---

## Advanced Features

### 17. **Plugin System**
**Purpose:** Extend CLI with plugins

**Features:**
- Plugin registry
- Custom commands
- Hook system
- Community plugins

### 18. **CI/CD Integration**
**Purpose:** Generate CI/CD workflows

**Features:**
- GitHub Actions generation
- GitLab CI config
- Cloudflare Pages setup
- Deployment workflows

**Example:**
```bash
opennextjs-cli ci --github
opennextjs-cli ci --gitlab
```

### 19. **Testing Setup**
**Purpose:** Set up testing infrastructure

**Features:**
- Jest/Vitest setup
- Playwright configuration
- Test templates
- CI test integration

**Example:**
```bash
opennextjs-cli test setup
opennextjs-cli test --framework vitest
```

### 20. **Monitoring & Observability**
**Purpose:** Set up monitoring tools

**Features:**
- Cloudflare Analytics setup
- Error tracking (Sentry)
- Performance monitoring
- Log aggregation

**Example:**
```bash
opennextjs-cli monitoring setup
opennextjs-cli monitoring --sentry
```

---

## UX Improvements

### 21. **Progress Bars**
- Show progress for long operations
- File generation progress
- Installation progress

### 22. **Better Error Messages**
- Actionable error messages
- Links to documentation
- Common solutions
- Error recovery suggestions

### 23. **Interactive Tutorial Mode**
- First-time user guide
- Step-by-step walkthrough
- Tips and best practices

### 24. **Configuration Wizard**
- Guided setup for complex configs
- Step-by-step configuration
- Validation at each step

### 25. **Auto-completion**
- Shell completion (bash/zsh/fish)
- Command suggestions
- Tab completion for options

---

## Comparison with next-forge

### What next-forge has that we don't:
1. **Monorepo support** - Turborepo integration
2. **Multiple app templates** - Web, app, docs, email, storybook
3. **Pre-configured integrations** - Auth, payments, email, analytics
4. **Design system** - shadcn/ui components
5. **Database setup** - Prisma with migrations
6. **Feature flags** - Vercel Flags integration
7. **Documentation site** - Mintlify integration

### What we have that's unique:
1. **Cloudflare-specific** - Focused on Cloudflare Workers
2. **OpenNext.js integration** - Specialized for OpenNext.js
3. **Simpler scope** - Single-purpose tool

---

## Recommended Priority Order

### Phase 1 (Essential):
1. ✅ Status/Info command
2. ✅ Validate command
3. ✅ Deploy command
4. ✅ Preview command
5. ✅ Package manager selection

### Phase 2 (Important):
6. ✅ Git initialization
7. ✅ Update/upgrade command
8. ✅ Environment variables setup
9. ✅ Cloudflare account linking
10. ✅ Health check (doctor)

### Phase 3 (Nice to Have):
11. Template selection
12. Migration helpers
13. Dry-run mode
14. Verbose/debug mode
15. Configuration export/import

### Phase 4 (Advanced):
16. Plugin system
17. CI/CD integration
18. Testing setup
19. Monitoring setup
20. Auto-completion

---

## Implementation Notes

- All new commands should follow the same patterns:
  - Use @clack/prompts for UI
  - Comprehensive help text
  - Error handling
  - Progress indicators
  - Success messages with next steps

- Maintain backward compatibility
- Keep commands focused and single-purpose
- Provide both interactive and non-interactive modes
- Always validate before making changes
