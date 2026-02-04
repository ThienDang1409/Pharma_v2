/**
 * README for configuration files
 * 
 * Structure:
 * - colors.ts: Color definitions as TypeScript constants
 * - tailwind-colors.js: Tailwind CSS color palette extension
 */

# Color Configuration

## Usage

### 1. Using TypeScript constants:
```typescript
import { colors } from '@/config/colors';

const bgColor = colors.primary; // "#dc2626"
```

### 2. Using Tailwind CSS classes:
```jsx
<div className="bg-primary-600 text-secondary-500">
  Content
</div>
```

To enable Tailwind colors, add to your `tailwind.config.ts`:

```typescript
import tailwindColors from './config/tailwind-colors';

export default {
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
};
```

## Color Categories

- **Primary**: Red (brand color) - Used for main actions and highlights
- **Secondary**: Amber (accent) - Used for secondary elements
- **Neutral**: Gray scale - For text, borders, backgrounds
- **Semantic**: Success, warning, error, info - For status indicators
