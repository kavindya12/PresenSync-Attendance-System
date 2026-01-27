# Security Guidelines

## 🔒 Protecting Sensitive Data

This repository is configured to prevent accidental exposure of sensitive information. Follow these guidelines to keep your credentials safe.

## ⚠️ Never Commit These Files

- `.env` files (any location)
- `.env.local` files
- Files containing API keys, passwords, or secrets
- Database connection strings
- Private keys or certificates

## ✅ Safe to Commit

- `.env.example` files (with placeholder values)
- Configuration files without secrets
- Documentation files
- Source code (without hardcoded secrets)

## 📋 Environment Variables

### Frontend (.env)
Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Backend (backend/.env)
Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase service role key (backend only)

Optional variables:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` - For Microsoft OAuth

## 🛡️ Best Practices

1. **Always use `.env.example`** as a template
2. **Never hardcode secrets** in source code
3. **Use environment variables** for all sensitive data
4. **Review changes** before committing (check for secrets)
5. **Rotate credentials** if accidentally exposed
6. **Use different credentials** for development and production

## 🔍 Pre-Commit Checklist

Before pushing to GitHub:
- [ ] No `.env` files in the commit
- [ ] No hardcoded API keys or passwords
- [ ] `.env.example` files are up to date
- [ ] All sensitive data uses environment variables

## 🚨 If You Accidentally Commit Secrets

1. **Immediately rotate** the exposed credentials
2. **Remove from git history** using `git filter-branch` or BFG Repo-Cleaner
3. **Update `.gitignore`** if needed
4. **Notify your team** if credentials were shared

## 📚 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/security)
