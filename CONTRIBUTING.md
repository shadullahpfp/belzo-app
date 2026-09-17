# Contributing to Belzo

Thank you for contributing to Belzo! We maintain a high standard of code quality, performance, and security across both the mobile and web portals.

---

## 🛠️ Development Workflow

1. **Fork or Branch**: Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Coding Standards**:
   - Write strict TypeScript with zero `any` workarounds.
   - Use Apple Human Interface Guidelines (HIG) for styling (dark glassmorphism, high-contrast badges, tabular numbers).
   - Use haptic feedback where appropriate in mobile screens.
3. **Validation**: Run typechecking across workspaces before committing:
   ```bash
   cd apps/mobile && npx tsc --noEmit
   cd ../admin && npx tsc --noEmit
   ```

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for users or riders
- `fix:` A bug fix
- `docs:` Documentation changes only
- `style:` Formatting, missing semicolons, visual refinements
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency bumps

**Example:**
```bash
git commit -m "feat(rider): implement turn-by-turn apple maps deep navigation"
```

---

## 🚀 Pull Request Checklist

Before submitting your PR, ensure:
- [ ] TypeScript compiles cleanly (`npx tsc --noEmit` exits 0).
- [ ] No secrets, keys, or sensitive `.env` files are committed.
- [ ] Code follows existing styling conventions.
- [ ] PR description explains the problem and the proposed solution.
