# Debounce Utility

**Task:** "Write a debounce function in TypeScript."

## Without ChillAgent (25 lines + lodash dependency)
```typescript
import debounce from 'lodash/debounce';
export const debouncedSearch = debounce((query: string) => {
  api.search(query);
}, 300);
```

## With ChillAgent (6 lines, standard native timer)
```typescript
export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```
