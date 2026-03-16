# Development Workflow

This document describes the development workflow and standards for all repositories.

## Branch Strategy

We follow **trunk-based development** with short-lived feature branches.

```
main (protected)
  ├── feature/{ticket}-{description}
  ├── fix/{ticket}-{description}
  └── release/v{version}
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/{ticket}-{description}` | `feature/GIN-15-add-login` |
| Bug fix | `fix/{ticket}-{description}` | `fix/GIN-20-auth-error` |
| Release | `release/v{version}` | `release/v1.2.0` |

### Branch Protection (main)

- Require pull request reviews (1 minimum)
- Require status checks to pass
- Require linear history (squash merge)
- No force pushes
- No direct commits

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Examples

```
feat(auth): add OAuth2 login support

fix(api): handle null response from payment provider

docs: update API reference for v2 endpoints

chore: upgrade dependencies to latest versions
```

## Pull Request Process

1. Create feature branch from `main`
2. Make changes with tests
3. Open PR using the template
4. Automated checks run (lint, test, build, security)
5. Request review from CODEOWNERS
6. Address feedback
7. Squash merge to `main`
8. Delete feature branch

## Code Review Guidelines

### For Authors

- Keep PRs small and focused
- Write clear descriptions
- Self-review before requesting review
- Respond to feedback promptly

### For Reviewers

- Review within 24 hours when possible
- Be constructive and specific
- Approve when satisfied, don't block on nitpicks
- Use suggestions for small fixes

## CI/CD Pipeline

Every PR triggers:

1. **Lint** - Code style and formatting
2. **Test** - Unit and integration tests
3. **Build** - Compilation/bundling
4. **Security** - Dependency audit, secret scanning

### Environments

| Environment | Trigger | Purpose |
|-------------|---------|---------|
| `dev` | Push to `main` | Integration testing |
| `staging` | Manual/scheduled | Pre-production |
| `production` | Release tag | Live deployment |

## Quality Standards

- Test coverage: >80%
- No high/critical security vulnerabilities
- All lint rules passing
- Documentation for public APIs

## Getting Help

- Check existing documentation
- Search closed issues/PRs
- Ask in team chat
- Create an issue for persistent problems
