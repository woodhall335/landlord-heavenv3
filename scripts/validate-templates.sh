#!/bin/bash
# HBS Template Validation Script

echo "=== Comprehensive HBS Syntax Validation ==="
echo ""

errors=0
total=0

for file in $(find config/jurisdictions -name "*.hbs" -type f); do
  total=$((total + 1))

  # Check for balanced blocks using grep -o (counts all occurrences)
  if_opens=$(grep -o '{{#if ' "$file" 2>/dev/null | wc -l)
  if_closes=$(grep -o '{{/if}}' "$file" 2>/dev/null | wc -l)

  each_opens=$(grep -o '{{#each ' "$file" 2>/dev/null | wc -l)
  each_closes=$(grep -o '{{/each}}' "$file" 2>/dev/null | wc -l)

  unless_opens=$(grep -o '{{#unless ' "$file" 2>/dev/null | wc -l)
  unless_closes=$(grep -o '{{/unless}}' "$file" 2>/dev/null | wc -l)

  with_opens=$(grep -o '{{#with ' "$file" 2>/dev/null | wc -l)
  with_closes=$(grep -o '{{/with}}' "$file" 2>/dev/null | wc -l)

  if_eq_opens=$(grep -o '{{#if_eq ' "$file" 2>/dev/null | wc -l)
  if_eq_closes=$(grep -o '{{/if_eq}}' "$file" 2>/dev/null | wc -l)

  has_error=0

  if [ "$if_opens" != "$if_closes" ]; then
    echo "❌ $file: #if=$if_opens, /if=$if_closes"
    has_error=1
  fi

  if [ "$each_opens" != "$each_closes" ]; then
    echo "❌ $file: #each=$each_opens, /each=$each_closes"
    has_error=1
  fi

  if [ "$unless_opens" != "$unless_closes" ]; then
    echo "❌ $file: #unless=$unless_opens, /unless=$unless_closes"
    has_error=1
  fi

  if [ "$with_opens" != "$with_closes" ]; then
    echo "❌ $file: #with=$with_opens, /with=$with_closes"
    has_error=1
  fi

  if [ "$if_eq_opens" != "$if_eq_closes" ]; then
    echo "❌ $file: #if_eq=$if_eq_opens, /if_eq=$if_eq_closes"
    has_error=1
  fi

  if [ "$has_error" = "1" ]; then
    errors=$((errors + 1))
  fi
done

echo ""
echo "=== Summary ==="
echo "Total templates: $total"
echo "Templates with errors: $errors"

if [ "$errors" = "0" ]; then
  echo ""
  echo "✅ All block helpers balanced!"
  exit 0
else
  exit 1
fi
