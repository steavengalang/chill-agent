# CSV Sum

**Task:** "Write Python code that reads sales.csv and sums the 'amount' column."

## Without ChillAgent (20 lines, 1 heavy dependency)
```python
import pandas as pd

# Read the CSV file into a DataFrame
df = pd.read_csv('sales.csv')

# Sum the amount column
total_amount = df['amount'].sum()

# Print the result
print(f"Total sales amount: {total_amount}")
```
*Bloat:* Forces 35MB `pandas` dependency for a simple column sum.

## With ChillAgent (4 lines, 0 dependencies)
```python
import csv

with open('sales.csv') as f:
    print(sum(float(row['amount']) for row in csv.DictReader(f)))
```
*Result:* 0 dependencies, instant execution, standard library only.
