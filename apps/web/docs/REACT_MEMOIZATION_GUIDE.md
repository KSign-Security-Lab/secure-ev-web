# React Memoization Guide

A comprehensive guide to understanding when and how to use memoization in React.

## Table of Contents

1. [What is Memoization?](#what-is-memoization)
2. [React Memoization Hooks](#react-memoization-hooks)
3. [When to Use Each Hook](#when-to-use-each-hook)
4. [Why NOT Always Memoize?](#why-not-always-memoize)
5. [Cost-Benefit Analysis](#cost-benefit-analysis)
6. [Real-World Examples](#real-world-examples)
7. [Best Practices](#best-practices)
8. [Performance Testing](#performance-testing)

---

## What is Memoization?

**Memoization** is a technique to cache the result of an expensive computation and return the cached result when the same inputs occur again.

### Simple Analogy

Think of it like this:

- **Without memoization**: Every time you ask "What's 2+2?", you calculate it again → 4
- **With memoization**: First time you ask "What's 2+2?", you calculate it → 4, and **remember** it
- Next time you ask "What's 2+2?", you just return the **remembered** answer → 4 (no calculation!)

### Key Concept

Memoization trades **memory** (storing results) for **computation time** (avoiding recalculation). It's only beneficial when:

- The computation is expensive
- The same inputs are used multiple times
- The memory cost is acceptable

---

## React Memoization Hooks

React provides three main memoization tools:

### 1. `useMemo` - Memoize Values

Caches the result of an expensive calculation.

```typescript
// ❌ BAD: Recalculates on every render
const expensiveValue = heavyCalculation(data);

// ✅ GOOD: Only recalculates when 'data' changes
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

**Syntax:**

```typescript
const memoizedValue = useMemo(() => {
  // Expensive calculation
  return computeExpensiveValue(a, b);
}, [a, b]); // Dependencies array
```

### 2. `useCallback` - Memoize Functions

Caches a function reference so it doesn't change on every render.

```typescript
// ❌ BAD: New function created on every render
const handleClick = () => {
  doSomething();
};

// ✅ GOOD: Same function reference unless dependencies change
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

**Syntax:**

```typescript
const memoizedCallback = useCallback(() => {
  // Function logic
  doSomething(a, b);
}, [a, b]); // Dependencies array
```

### 3. `React.memo` - Memoize Components

Prevents a component from re-rendering if its props haven't changed.

```typescript
// ❌ BAD: Re-renders even if props are the same
const MyComponent = ({ data }) => {
  return <div>{data}</div>;
};

// ✅ GOOD: Only re-renders if props actually change
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

**Syntax:**

```typescript
const MyComponent = React.memo(
  ({ prop1, prop2 }) => {
    // Component logic
    return (
      <div>
        {prop1} {prop2}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Optional custom comparison function
    return prevProps.prop1 === nextProps.prop1;
  }
);
```

---

## When to Use Each Hook

### `useMemo` - Use When:

✅ **DO use `useMemo` for:**

- Expensive calculations (sorting, filtering large arrays)
- Complex mathematical operations
- Creating derived data from large datasets
- Formatting/transforming data that's used multiple times

```typescript
// ✅ GOOD: Expensive calculation
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// ✅ GOOD: Complex transformation
const chartData = useMemo(() => {
  return rawData.map((item) => ({
    x: item.timestamp,
    y: calculateComplexMetric(item),
  }));
}, [rawData]);
```

❌ **DON'T use `useMemo` for:**

- Simple calculations (`a + b`, `name.toUpperCase()`)
- Creating primitive values
- Operations that are already fast

```typescript
// ❌ BAD: Unnecessary memoization
const sum = useMemo(() => a + b, [a, b]);
const upperName = useMemo(() => name.toUpperCase(), [name]);
```

### `useCallback` - Use When:

✅ **DO use `useCallback` for:**

- Functions passed as props to memoized child components
- Functions used in dependency arrays of other hooks
- Event handlers in lists that are passed to child components

```typescript
// ✅ GOOD: Function passed to memoized child
const handleClick = useCallback((id: string) => {
  setSelectedId(id);
}, []);

<MemoizedChildComponent onClick={handleClick} />;

// ✅ GOOD: Function in dependency array
const fetchData = useCallback(async () => {
  const data = await api.getData();
  setData(data);
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

❌ **DON'T use `useCallback` for:**

- Functions only used in event handlers (not passed as props)
- Functions that change frequently anyway
- Simple inline functions

```typescript
// ❌ BAD: Function only used locally
const handleClick = useCallback(() => {
  console.log("clicked");
}, []);

<button onClick={handleClick}>Click</button>;
// Better: <button onClick={() => console.log('clicked')}>Click</button>
```

### `React.memo` - Use When:

✅ **DO use `React.memo` for:**

- Child components that receive props from parents
- Components that are expensive to render
- Components that re-render frequently due to parent updates
- List items in large lists

```typescript
// ✅ GOOD: Expensive child component
const ExpensiveChart = React.memo(({ data }: { data: ChartData[] }) => {
  // Complex chart rendering
  return <ComplexChart data={data} />;
});

// ✅ GOOD: List item component
const UserCard = React.memo(({ user }: { user: User }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

❌ **DON'T use `React.memo` for:**

- Page/top-level components (no parent to cause re-renders)
- Components that always receive new props
- Simple components that render quickly
- Components without props

```typescript
// ❌ BAD: Page component (no parent)
export default React.memo(function HomePage() {
  return <div>Home</div>;
});

// ❌ BAD: Props always change
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
// If 'data' is a new object every time, memo does nothing!
```

---

## Why NOT Always Memoize?

### The Memoization Overhead Problem

Memoization has a **cost** - it needs to:

1. Store the previous result/function/props
2. Compare current inputs with previous inputs
3. Decide whether to use cached result or recalculate
4. Manage the cache in memory

**If the comparison is more expensive than the calculation, memoization makes things SLOWER!**

### Example: When Memoization Hurts Performance

```typescript
// ❌ BAD: Memoizing a simple calculation
const sum = useMemo(() => {
  return a + b; // This is super fast - no need to memoize!
}, [a, b]);

// The overhead of:
// - Storing previous a, b values
// - Comparing a, b on every render
// - Managing the cache
// ...is MORE expensive than just doing: a + b
```

### Real-World Example

```typescript
// ❌ BAD: Unnecessary memoization
const MyComponent = React.memo(({ name, age }) => {
  return (
    <div>
      {name} is {age} years old
    </div>
  );
});

// Every render, React.memo does:
// 1. Compare previous props: { name: "John", age: 25 }
// 2. Compare current props: { name: "John", age: 25 }
// 3. Deep comparison (if props are objects)
// 4. Decide: props are same, skip render

// But rendering <div>John is 25 years old</div> is SUPER FAST!
// The comparison overhead is MORE expensive than just rendering!
```

### When Memoization Actually Helps

```typescript
// ✅ GOOD: Expensive calculation
const sortedData = useMemo(() => {
  // This is expensive - sorting 10,000 items
  return hugeArray.sort((a, b) => a.value - b.value);
}, [hugeArray]);

// ✅ GOOD: Expensive component
const ExpensiveChart = React.memo(({ data }) => {
  // Complex chart rendering with thousands of data points
  return <ComplexChart data={data} />;
});
```

---

## Cost-Benefit Analysis

| Scenario                    | Memoization Cost       | Calculation Cost   | Should Memoize? | Why?                      |
| --------------------------- | ---------------------- | ------------------ | --------------- | ------------------------- |
| Simple addition (`a + b`)   | High (comparison)      | Very Low           | ❌ NO           | Overhead > benefit        |
| Simple component render     | High (prop comparison) | Very Low           | ❌ NO           | Overhead > benefit        |
| Sorting 10,000 items        | Low (comparison)       | Very High          | ✅ YES          | Benefit > overhead        |
| Complex chart rendering     | Low (prop comparison)  | Very High          | ✅ YES          | Benefit > overhead        |
| API call result             | Low (comparison)       | Very High          | ✅ YES          | Benefit > overhead        |
| Filtering large array       | Medium (comparison)    | High               | ✅ YES          | Benefit > overhead        |
| Simple string concatenation | High (comparison)      | Very Low           | ❌ NO           | Overhead > benefit        |
| Function passed to child    | Low (comparison)       | Medium (re-render) | ✅ YES          | Prevents child re-renders |

---

## Real-World Examples

### Example 1: Page Component (No Memoization Needed)

```typescript
// ✅ GOOD: No memoization needed
export default function AgentsPage() {
  const [data, setData] = useState<AgentsListResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch data on mount
    const fetchData = async () => {
      const response = await trpc.agents.list.query();
      setData(response);
    };
    fetchData();
  }, []);

  return (
    <div>{isLoading ? <Loading /> : <div>{JSON.stringify(data)}</div>}</div>
  );
}

// Why no memoization?
// - It's a page component (no parent)
// - Only re-renders when its own state changes
// - Simple, fast rendering
// - React.memo would add overhead with no benefit
```

### Example 2: Expensive List Item (Memoization Needed)

```typescript
// ✅ GOOD: Memoized list item
const AgentCard = React.memo(({ agent }: { agent: Agent }) => {
  // Expensive rendering with complex calculations
  const formattedDate = useMemo(() => {
    return new Date(agent.last_seen).toLocaleString();
  }, [agent.last_seen]);

  return (
    <div className="agent-card">
      <h3>{agent.display_name}</h3>
      <p>Host: {agent.host}</p>
      <p>Last seen: {formattedDate}</p>
      {/* More complex rendering... */}
    </div>
  );
});

// Parent component
export default function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filter, setFilter] = useState("");

  // AgentCard only re-renders if the specific agent prop changes
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {agents.map((agent) => (
        <AgentCard key={agent.paw} agent={agent} />
      ))}
    </div>
  );
}

// Why memoization helps:
// - When filter changes, parent re-renders
// - But AgentCard components don't re-render (props unchanged)
// - Saves expensive rendering for each card
```

### Example 3: Expensive Calculation (useMemo Needed)

```typescript
// ✅ GOOD: Expensive calculation memoized
export default function AnalyticsDashboard({
  rawData,
}: {
  rawData: DataPoint[];
}) {
  // Expensive: Processing 10,000+ data points
  const processedData = useMemo(() => {
    return rawData
      .filter((point) => point.isValid)
      .map((point) => ({
        ...point,
        normalized: normalizeValue(point.value),
        trend: calculateTrend(point),
      }))
      .sort((a, b) => b.trend - a.trend);
  }, [rawData]);

  // Expensive: Creating chart data
  const chartData = useMemo(() => {
    return processedData.map((point) => ({
      x: point.timestamp,
      y: point.normalized,
    }));
  }, [processedData]);

  return (
    <div>
      <Chart data={chartData} />
      <DataTable data={processedData} />
    </div>
  );
}

// Why useMemo helps:
// - Processing 10,000 items is expensive
// - Only recalculates when rawData changes
// - Prevents recalculation on every render
```

### Example 4: Callback in Dependency Array (useCallback Needed)

```typescript
// ✅ GOOD: useCallback prevents infinite loops
export default function DataFetcher() {
  const [data, setData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Without useCallback, this function is recreated every render
  // Which would cause useEffect to run infinitely
  const fetchData = useCallback(async () => {
    const result = await api.getData();
    setData(result);
  }, []); // No dependencies = stable function reference

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]); // fetchData is stable, won't cause re-runs

  return (
    <div>
      <button onClick={() => setRefreshKey((k) => k + 1)}>Refresh</button>
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

---

## Best Practices

### The Golden Rule

**Only memoize when:**

1. The computation/rendering is **expensive** (measurably slow)
2. The inputs **rarely change** (memoization cache is actually used)
3. You've **measured** that memoization improves performance

**Don't memoize when:**

1. The computation is **cheap** (simple math, simple rendering)
2. The inputs **change frequently** (cache is never used)
3. You're **guessing** it might help (measure first!)

### Checklist Before Memoizing

- [ ] Is the computation/rendering actually slow? (Measure it!)
- [ ] Do the inputs change frequently? (If yes, memoization won't help)
- [ ] Is this a child component that receives props? (For React.memo)
- [ ] Is this function passed to a memoized child? (For useCallback)
- [ ] Have I measured the performance improvement? (Don't guess!)

### Common Mistakes

```typescript
// ❌ MISTAKE 1: Memoizing with changing dependencies
const value = useMemo(() => {
  return compute(data);
}, [data]); // If 'data' changes every render, memoization is useless!

// ❌ MISTAKE 2: Memoizing page components
export default React.memo(function HomePage() {
  // No parent = no benefit
});

// ❌ MISTAKE 3: Memoizing simple calculations
const sum = useMemo(() => a + b, [a, b]); // Overhead > benefit

// ❌ MISTAKE 4: useCallback without memoized child
const handleClick = useCallback(() => {
  // If child isn't memoized, this does nothing
}, []);
<RegularChild onClick={handleClick} />; // No benefit

// ✅ CORRECT: Measure first, then optimize
// 1. Build without memoization
// 2. Measure performance
// 3. Identify bottlenecks
// 4. Add memoization only where needed
```

---

## Performance Testing

### How to Measure Performance

1. **Use React DevTools Profiler**

   ```typescript
   // 1. Open React DevTools
   // 2. Go to Profiler tab
   // 3. Click "Record"
   // 4. Interact with your app
   // 5. Stop recording
   // 6. Analyze which components are slow
   ```

2. **Add Performance Marks**

   ```typescript
   useEffect(() => {
     performance.mark("component-render-start");
     // Component logic
     performance.mark("component-render-end");
     performance.measure(
       "component-render",
       "component-render-start",
       "component-render-end"
     );
   });
   ```

3. **Use `console.time`**
   ```typescript
   const expensiveCalculation = () => {
     console.time("calculation");
     const result = heavyComputation();
     console.timeEnd("calculation");
     return result;
   };
   ```

### When to Optimize

1. **Build first, optimize later**

   - Get it working correctly
   - Then measure performance
   - Then optimize bottlenecks

2. **Measure before and after**

   - Record baseline performance
   - Add memoization
   - Measure again
   - Confirm improvement

3. **Profile in production-like conditions**
   - Test with realistic data sizes
   - Test on slower devices
   - Test with network throttling

---

## Summary

### Key Takeaways

1. **Memoization is a tool, not a magic bullet**

   - It has overhead (comparison, memory)
   - Only use when benefit > cost

2. **Measure, don't guess**

   - Use React DevTools Profiler
   - Identify actual bottlenecks
   - Verify improvements

3. **Follow the golden rule**

   - Expensive computation? ✅ Memoize
   - Cheap computation? ❌ Don't memoize
   - Not sure? Measure first!

4. **Use the right tool**

   - `useMemo` for expensive calculations
   - `useCallback` for stable function references
   - `React.memo` for expensive child components

5. **Avoid premature optimization**
   - Build it first
   - Measure performance
   - Optimize bottlenecks
   - Don't optimize "just in case"

### Quick Reference

| Hook          | Use For                    | When                                         |
| ------------- | -------------------------- | -------------------------------------------- |
| `useMemo`     | Expensive calculations     | Sorting/filtering large arrays, complex math |
| `useCallback` | Stable function references | Functions passed to memoized children        |
| `React.memo`  | Prevent child re-renders   | Expensive child components with stable props |

---

## Additional Resources

- [React Documentation - useMemo](https://react.dev/reference/react/useMemo)
- [React Documentation - useCallback](https://react.dev/reference/react/useCallback)
- [React Documentation - memo](https://react.dev/reference/react/memo)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

---

**Remember**: The best optimization is the one you don't need. Write clean, simple code first. Optimize only when you have measured performance problems! 🚀

