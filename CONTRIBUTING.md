# 🤝 Contributing to TECHNO-ETL

Thank you for your interest in contributing to TECHNO-ETL! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior

- **Be respectful** and considerate in all interactions
- **Be collaborative** and help others learn and grow
- **Be constructive** when providing feedback
- **Be patient** with newcomers and those learning

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Spam or irrelevant content
- Sharing private information without consent

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **SQL Server** (for backend development)
- **Firebase** account (for bug bounty features)

### Development Setup

1. **Fork the repository**
```bash
git clone https://github.com/YOUR_USERNAME/techno-etl.git
cd techno-etl
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

3. **Set up environment**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
# Configure your environment variables
```

4. **Start development servers**
```bash
npm run dev:full
```

## 🔄 Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New features (`feature/bug-bounty-system`)
- **fix/**: Bug fixes (`fix/login-validation`)
- **docs/**: Documentation updates (`docs/api-guide`)

### Workflow Steps

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Write clean, documented code
- Follow coding standards
- Add tests for new functionality

3. **Commit your changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

4. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### JavaScript/React Standards

#### Code Style
- Use **ES6+** features and modern JavaScript
- Use **functional components** with hooks
- Follow **camelCase** for variables and functions
- Use **PascalCase** for components and classes
- Use **UPPER_SNAKE_CASE** for constants

#### Component Structure
```jsx
/**
 * Component description
 * @param {Object} props - Component props
 * @returns {JSX.Element} Component JSX
 */
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState(initialValue);
  const { data, loading } = useCustomHook();

  // Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Early returns
  if (loading) return <LoadingSpinner />;
  if (!data) return <EmptyState />;

  // Main render
  return (
    <Box>
      {/* Component content */}
    </Box>
  );
};

export default MyComponent;
```

#### File Organization
```
src/components/MyFeature/
├── index.js              # Export barrel
├── MyFeature.jsx         # Main component
├── MyFeature.test.jsx    # Tests
├── MyFeature.styles.js   # Styled components
├── hooks/                # Feature-specific hooks
├── utils/                # Feature utilities
└── components/           # Sub-components
```

### Backend Standards

#### API Design
- Use **RESTful** conventions
- Follow **HTTP status codes** properly
- Use **consistent** response formats
- Implement **proper error handling**

#### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2025-07-29T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { /* error details */ }
  },
  "timestamp": "2025-07-29T10:30:00Z"
}
```

### Documentation Standards

#### JSDoc Comments
```javascript
/**
 * Calculates the total price with tax
 * @param {number} basePrice - The base price before tax
 * @param {number} taxRate - The tax rate (0.1 for 10%)
 * @param {Object} options - Additional options
 * @param {boolean} options.includeShipping - Include shipping costs
 * @returns {number} The total price including tax
 * @throws {Error} When basePrice is negative
 * @example
 * const total = calculateTotalPrice(100, 0.1, { includeShipping: true });
 * // Returns: 110
 */
const calculateTotalPrice = (basePrice, taxRate, options = {}) => {
  // Implementation
};
```

## 🧪 Testing Guidelines

### Frontend Testing

#### Unit Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Integration Tests
```javascript
import { renderWithProviders } from '../test-utils';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('should navigate between pages', async () => {
    const { user } = renderWithProviders(<App />);
    
    await user.click(screen.getByText('Bug Bounty'));
    expect(screen.getByText('Bug Bounty Dashboard')).toBeInTheDocument();
  });
});
```

### Backend Testing

#### API Tests
```javascript
import request from 'supertest';
import app from '../app';

describe('API Endpoints', () => {
  describe('GET /api/bugs', () => {
    it('should return bug list', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

### Test Coverage Requirements

- **Minimum 80%** overall coverage
- **90%** for critical business logic
- **100%** for utility functions
- All **public APIs** must be tested

## 📤 Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date**
```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main
```

2. **Run tests and linting**
```bash
npm run test
npm run lint
npm run build
```

3. **Create a detailed PR**
- Use the PR template
- Include screenshots for UI changes
- Reference related issues
- Add reviewers

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Commit Message Format

Use **Conventional Commits** format:

```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **test**: Test changes
- **chore**: Build/tooling changes

#### Examples
```bash
feat(bug-bounty): add reward calculation system
fix(auth): resolve login validation issue
docs(api): update endpoint documentation
style(components): improve button styling
refactor(utils): optimize error handling
test(services): add unit tests for bug service
chore(deps): update dependencies
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with latest version** to ensure bug still exists
3. **Gather relevant information** (browser, OS, steps to reproduce)

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 91]
- Version: [e.g., v2.1.0]

**Screenshots**
(If applicable)

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing requests** to avoid duplicates
2. **Consider the scope** and alignment with project goals
3. **Think about implementation** complexity

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Mockups, examples, or references
```

## 🏆 Recognition

### Contributors

We recognize contributors in several ways:

- **README acknowledgments** for significant contributions
- **Release notes** mentions for features/fixes
- **Bug bounty rewards** for quality bug reports
- **Community highlights** in project updates

### Becoming a Maintainer

Regular contributors may be invited to become maintainers based on:

- **Consistent quality** contributions
- **Community involvement** and helpfulness
- **Technical expertise** in relevant areas
- **Alignment** with project values

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: mounir.webdev.tms@gmail.com for direct contact

### Development Questions

- **Code reviews**: Ask questions in PR comments
- **Architecture decisions**: Open a discussion issue
- **Best practices**: Check existing code examples

## 📚 Resources

### Documentation
- [API Documentation](http://localhost:5000/api-docs)
- [Bug Bounty Guide](BUG_BOUNTY_README.md)
- [Deployment Guide](docs/deployment.md)

### Learning Resources
- [React Documentation](https://reactjs.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Material-UI Components](https://mui.com/components/)

---

**Thank you for contributing to TECHNO-ETL! 🚀**

*Built with ❤️ by the community*
