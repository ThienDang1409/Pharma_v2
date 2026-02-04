/**
 * README for localization files
 * 
 * Structure:
 * - en.json: English translations
 * - vi.json: Vietnamese translations
 */

# Internationalization (i18n)

## File Structure

Locale files are organized by language:
- `en.json` - English translations
- `vi.json` - Vietnamese translations

Each file contains nested objects organized by feature/section:
```json
{
  "common": { },
  "header": { },
  "navigation": { },
  "footer": { },
  "errors": { }
}
```

## Usage

### Using the useI18n hook:
```typescript
import { useI18n } from '@/lib/hooks/useI18n';

export default function Component() {
  const locale = useI18n('vi'); // or 'en'
  
  return <h1>{locale.header.company}</h1>;
}
```

### Using the getTranslation utility:
```typescript
import { getTranslation } from '@/lib/hooks/useI18n';
import viLocale from '@/locales/vi.json';

const text = getTranslation(viLocale, 'header.company');
```

## Adding New Translations

1. Add the key to both `en.json` and `vi.json`
2. Follow the nested structure (e.g., `"section.key": "value"`)
3. Keep keys consistent across languages

Example:
```json
// en.json
{
  "newSection": {
    "message": "Hello World"
  }
}

// vi.json
{
  "newSection": {
    "message": "Xin chào thế giới"
  }
}
```

## Language Constants

Use constants from `lib/constants/locales.ts`:
```typescript
import { LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/constants/locales';

const lang = LANGUAGES.VI; // 'vi'
```
