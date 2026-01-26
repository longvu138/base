# @repo/i18n

Package đa ngôn ngữ (i18n) đơn giản và dễ sử dụng cho Web và Mobile.

## Tính năng

- ✅ Hỗ trợ Tiếng Việt và English (dễ dàng mở rộng)
- ✅ Tự động phát hiện ngôn ngữ (Web)
- ✅ Lưu preferences vào localStorage (Web)
- ✅ Hooks React đơn giản
- ✅ TypeScript support đầy đủ

## Cài đặt

Package này đã được cài sẵn trong monorepo.

## Sử dụng

### Web (React + Vite)

**1. Khởi tạo i18n trong `main.tsx`:**

```tsx
import { initI18nForWeb } from '@repo/i18n';

// Khởi tạo i18n trước khi render app
initI18nForWeb({
  debug: import.meta.env.MODE === 'development'
});

// Render app
```

**2. Sử dụng trong components:**

```tsx
import { useTranslation } from '@repo/i18n';

export const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <p>{t('auth.login.subtitle')}</p>
    </div>
  );
};
```

**3. Language Switcher:**

```tsx
import { useLanguage } from '@repo/i18n';

export const LanguageSwitcher = () => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  
  return (
    <div>
      {availableLanguages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={currentLanguage.code === lang.code ? 'active' : ''}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  );
};
```

### Mobile (React Native)

**1. Khởi tạo i18n trong `App.tsx`:**

```tsx
import { initI18nForMobile } from '@repo/i18n';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    initI18nForMobile({ lng: 'vi' });
  }, []);

  return <YourApp />;
}
```

**2. Sử dụng trong components:**

```tsx
import { useTranslation, useLanguage } from '@repo/i18n';
import { View, Text, TouchableOpacity } from 'react-native';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  
  return (
    <View>
      <Text>{t('auth.login.title')}</Text>
      
      {/* Language switcher */}
      {availableLanguages.map(lang => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => changeLanguage(lang.code)}
        >
          <Text>{lang.flag} {lang.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

## API

### Hooks

#### `useTranslation()`

```tsx
const { t, i18n } = useTranslation();
```

#### `useLanguage()`

```tsx
const { 
  currentLanguage,    // Ngôn ngữ hiện tại
  changeLanguage,     // Function để đổi ngôn ngữ
  availableLanguages, // Danh sách ngôn ngữ
  language           // Code ngôn ngữ
} = useLanguage();
```

### Functions

#### `initI18nForWeb(config?)`

Khởi tạo i18n cho Web.

```tsx
initI18nForWeb({
  debug: true,
  lng: 'en'
});
```

#### `initI18nForMobile(config?)`

Khởi tạo i18n cho Mobile.

```tsx
initI18nForMobile({
  lng: 'vi'
});
```

## Thêm ngôn ngữ mới

### 1. Tạo file translation

Tạo file `/packages/i18n/src/locales/ja/translation.json`:

```json
{
  "auth": {
    "login": {
      "title": "おかえりなさい",
      ...
    }
  }
}
```

### 2. Cập nhật config.ts

```tsx
import jaTranslation from './locales/ja/translation.json';

export const resources = {
  vi: { translation: viTranslation },
  en: { translation: enTranslation },
  ja: { translation: jaTranslation }
};

export const supportedLanguages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' }
];
```

### 3. Export trong index.ts

```tsx
export { default as jaTranslation } from './locales/ja/translation.json';
```

Done!

## Translation Keys

Xem file `src/locales/vi/translation.json` để biết tất cả keys.

Cấu trúc:
- `common.*` - Từ ngữ chung
- `auth.login.*` - Màn hình đăng nhập  
- `ui.*` - UI elements
- `language.*` - Liên quan ngôn ngữ

## Best Practices

1. Luôn sử dụng `t()` function thay vì hardcode text
2. Đặt tên keys rõ ràng theo cấu trúc `module.screen.element`
3. Fallback language là tiếng Việt
4. Mobile: Lưu language preference vào AsyncStorage
