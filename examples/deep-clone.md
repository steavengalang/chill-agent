# Deep Clone

**Task:** "Deep clone a JavaScript object in Node 18+."

## Without ChillAgent
```javascript
import cloneDeep from 'lodash/cloneDeep';
const copy = cloneDeep(source);
```

## With ChillAgent (1 line native standard library)
```javascript
const copy = structuredClone(source);
```
