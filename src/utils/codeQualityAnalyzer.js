/**
 * Code Quality Analyzer
 * Analyzes React components for code smells, best practices, and optimization opportunities
 */

/**
 * Code quality metrics and analysis
 */
class CodeQualityAnalyzer {
  constructor() {
    this.rules = new Map();
    this.violations = [];
    this.setupDefaultRules();
  }

  /**
   * Setup default code quality rules
   */
  setupDefaultRules() {
    // Component size rules
    this.addRule('component-size', {
      name: 'Component Size',
      description: 'Components should be reasonably sized',
      check: (component) => {
        const lines = component.code?.split('\n').length || 0;
        return {
          passed: lines <= 300,
          severity: lines > 500 ? 'error' : lines > 300 ? 'warning' : 'info',
          message: `Component has ${lines} lines (recommended: ≤300)`,
          suggestion: 'Consider breaking down into smaller components'
        };
      }
    });

    // Function complexity
    this.addRule('function-complexity', {
      name: 'Function Complexity',
      description: 'Functions should have low cyclomatic complexity',
      check: (component) => {
        const complexity = this.calculateCyclomaticComplexity(component.code || '');
        return {
          passed: complexity <= 10,
          severity: complexity > 20 ? 'error' : complexity > 10 ? 'warning' : 'info',
          message: `Cyclomatic complexity: ${complexity} (recommended: ≤10)`,
          suggestion: 'Break down complex functions into smaller ones'
        };
      }
    });

    // Props validation
    this.addRule('props-validation', {
      name: 'Props Validation',
      description: 'Components should validate their props',
      check: (component) => {
        const hasPropTypes = /PropTypes|propTypes/.test(component.code || '');
        const hasTypeScript = component.fileName?.endsWith('.tsx');
        return {
          passed: hasPropTypes || hasTypeScript,
          severity: 'warning',
          message: hasPropTypes || hasTypeScript ? 'Props validation found' : 'No props validation found',
          suggestion: 'Add PropTypes or use TypeScript for type safety'
        };
      }
    });

    // State management
    this.addRule('state-management', {
      name: 'State Management',
      description: 'Components should use appropriate state management',
      check: (component) => {
        const useStateCount = (component.code?.match(/useState/g) || []).length;
        const useReducerCount = (component.code?.match(/useReducer/g) || []).length;
        const hasComplexState = useStateCount > 5;
        
        return {
          passed: !hasComplexState || useReducerCount > 0,
          severity: 'warning',
          message: `Found ${useStateCount} useState calls`,
          suggestion: hasComplexState ? 'Consider using useReducer for complex state' : 'State management looks good'
        };
      }
    });

    // Performance optimizations
    this.addRule('performance-optimizations', {
      name: 'Performance Optimizations',
      description: 'Components should use appropriate performance optimizations',
      check: (component) => {
        const hasMemo = /React\.memo|memo/.test(component.code || '');
        const hasCallback = /useCallback/.test(component.code || '');
        const hasMemoHook = /useMemo/.test(component.code || '');
        const hasOptimizations = hasMemo || hasCallback || hasMemoHook;
        
        return {
          passed: hasOptimizations,
          severity: 'info',
          message: hasOptimizations ? 'Performance optimizations found' : 'No performance optimizations found',
          suggestion: 'Consider using React.memo, useCallback, or useMemo for optimization'
        };
      }
    });

    // Accessibility
    this.addRule('accessibility', {
      name: 'Accessibility',
      description: 'Components should follow accessibility best practices',
      check: (component) => {
        const hasAriaLabels = /aria-label|aria-labelledby|aria-describedby/.test(component.code || '');
        const hasSemanticHTML = /<(button|input|select|textarea|nav|main|section|article|header|footer)/.test(component.code || '');
        const hasKeyboardHandlers = /onKeyDown|onKeyUp|onKeyPress/.test(component.code || '');
        
        const score = [hasAriaLabels, hasSemanticHTML, hasKeyboardHandlers].filter(Boolean).length;
        
        return {
          passed: score >= 2,
          severity: score === 0 ? 'error' : score === 1 ? 'warning' : 'info',
          message: `Accessibility score: ${score}/3`,
          suggestion: 'Add ARIA labels, use semantic HTML, and handle keyboard events'
        };
      }
    });

    // Error handling
    this.addRule('error-handling', {
      name: 'Error Handling',
      description: 'Components should handle errors appropriately',
      check: (component) => {
        const hasTryCatch = /try\s*{[\s\S]*catch/.test(component.code || '');
        const hasErrorBoundary = /ErrorBoundary|componentDidCatch|getDerivedStateFromError/.test(component.code || '');
        const hasErrorHandling = hasTryCatch || hasErrorBoundary;
        
        return {
          passed: hasErrorHandling,
          severity: 'warning',
          message: hasErrorHandling ? 'Error handling found' : 'No error handling found',
          suggestion: 'Add try-catch blocks or error boundaries for better error handling'
        };
      }
    });

    // Code duplication
    this.addRule('code-duplication', {
      name: 'Code Duplication',
      description: 'Avoid code duplication',
      check: (component) => {
        const duplicateLines = this.findDuplicateLines(component.code || '');
        const hasDuplication = duplicateLines.length > 0;
        
        return {
          passed: !hasDuplication,
          severity: 'warning',
          message: hasDuplication ? `Found ${duplicateLines.length} duplicate code blocks` : 'No code duplication found',
          suggestion: 'Extract common code into reusable functions or components',
          details: duplicateLines.slice(0, 3) // Show first 3 duplicates
        };
      }
    });

    // Naming conventions
    this.addRule('naming-conventions', {
      name: 'Naming Conventions',
      description: 'Follow consistent naming conventions',
      check: (component) => {
        const issues = this.checkNamingConventions(component.code || '');
        
        return {
          passed: issues.length === 0,
          severity: 'warning',
          message: issues.length > 0 ? `Found ${issues.length} naming issues` : 'Naming conventions followed',
          suggestion: 'Use camelCase for variables/functions, PascalCase for components',
          details: issues.slice(0, 5) // Show first 5 issues
        };
      }
    });
  }

  /**
   * Add a custom rule
   */
  addRule(id, rule) {
    this.rules.set(id, rule);
  }

  /**
   * Remove a rule
   */
  removeRule(id) {
    this.rules.delete(id);
  }

  /**
   * Analyze a component
   */
  analyzeComponent(component) {
    const results = {
      componentName: component.name || 'Unknown',
      fileName: component.fileName || 'Unknown',
      timestamp: new Date().toISOString(),
      rules: [],
      score: 0,
      grade: 'F',
      violations: [],
      suggestions: []
    };

    let passedRules = 0;
    const totalRules = this.rules.size;

    for (const [ruleId, rule] of this.rules) {
      try {
        const result = rule.check(component);
        
        results.rules.push({
          id: ruleId,
          name: rule.name,
          description: rule.description,
          passed: result.passed,
          severity: result.severity,
          message: result.message,
          suggestion: result.suggestion,
          details: result.details
        });

        if (result.passed) {
          passedRules++;
        } else {
          results.violations.push({
            rule: rule.name,
            severity: result.severity,
            message: result.message
          });
          
          if (result.suggestion) {
            results.suggestions.push(result.suggestion);
          }
        }
      } catch (error) {
        console.error(`Error running rule ${ruleId}:`, error);
      }
    }

    // Calculate score and grade
    results.score = Math.round((passedRules / totalRules) * 100);
    results.grade = this.calculateGrade(results.score);

    return results;
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(code) {
    // Simple approximation of cyclomatic complexity
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g // ternary operator
    ];

    let complexity = 1; // Base complexity
    
    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Find duplicate lines of code
   */
  findDuplicateLines(code) {
    const lines = code.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10 && !line.startsWith('//') && !line.startsWith('/*'));
    
    const lineCount = new Map();
    const duplicates = [];

    lines.forEach((line, index) => {
      if (lineCount.has(line)) {
        lineCount.get(line).push(index + 1);
      } else {
        lineCount.set(line, [index + 1]);
      }
    });

    lineCount.forEach((positions, line) => {
      if (positions.length > 1) {
        duplicates.push({
          line,
          positions,
          count: positions.length
        });
      }
    });

    return duplicates;
  }

  /**
   * Check naming conventions
   */
  checkNamingConventions(code) {
    const issues = [];

    // Check for snake_case variables (should be camelCase)
    const snakeCaseVars = code.match(/\b[a-z]+_[a-z_]+\b/g);
    if (snakeCaseVars) {
      issues.push({
        type: 'snake_case_variable',
        message: `Found snake_case variables: ${snakeCaseVars.slice(0, 3).join(', ')}`,
        suggestion: 'Use camelCase for variables'
      });
    }

    // Check for lowercase component names
    const lowercaseComponents = code.match(/<[a-z][a-zA-Z0-9]*\s*[/>]/g);
    if (lowercaseComponents) {
      issues.push({
        type: 'lowercase_component',
        message: `Found lowercase component names: ${lowercaseComponents.slice(0, 3).join(', ')}`,
        suggestion: 'Use PascalCase for component names'
      });
    }

    // Check for SCREAMING_SNAKE_CASE that aren't constants
    const screamingSnakeCase = code.match(/\b[A-Z]+_[A-Z_]+\b/g);
    if (screamingSnakeCase) {
      const nonConstants = screamingSnakeCase.filter(name => 
        !code.includes(`const ${name}`) && !code.includes(`let ${name}`)
      );
      if (nonConstants.length > 0) {
        issues.push({
          type: 'screaming_snake_case',
          message: `Found SCREAMING_SNAKE_CASE: ${nonConstants.slice(0, 3).join(', ')}`,
          suggestion: 'Use SCREAMING_SNAKE_CASE only for constants'
        });
      }
    }

    return issues;
  }

  /**
   * Calculate grade based on score
   */
  calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Analyze multiple components
   */
  analyzeProject(components) {
    const results = {
      timestamp: new Date().toISOString(),
      totalComponents: components.length,
      components: [],
      summary: {
        averageScore: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        commonViolations: new Map(),
        topSuggestions: []
      }
    };

    let totalScore = 0;
    const allSuggestions = [];

    components.forEach(component => {
      const analysis = this.analyzeComponent(component);
      results.components.push(analysis);
      
      totalScore += analysis.score;
      results.summary.gradeDistribution[analysis.grade]++;
      
      // Collect violations
      analysis.violations.forEach(violation => {
        const count = results.summary.commonViolations.get(violation.rule) || 0;
        results.summary.commonViolations.set(violation.rule, count + 1);
      });
      
      // Collect suggestions
      allSuggestions.push(...analysis.suggestions);
    });

    results.summary.averageScore = Math.round(totalScore / components.length);
    
    // Get top suggestions
    const suggestionCounts = new Map();
    allSuggestions.forEach(suggestion => {
      const count = suggestionCounts.get(suggestion) || 0;
      suggestionCounts.set(suggestion, count + 1);
    });
    
    results.summary.topSuggestions = Array.from(suggestionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([suggestion, count]) => ({ suggestion, count }));

    return results;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(analysisResults) {
    const recommendations = {
      immediate: [], // High priority, easy to fix
      shortTerm: [], // Medium priority, moderate effort
      longTerm: []   // Low priority, significant effort
    };

    analysisResults.components.forEach(component => {
      component.violations.forEach(violation => {
        const recommendation = {
          component: component.componentName,
          rule: violation.rule,
          severity: violation.severity,
          message: violation.message,
          effort: this.estimateEffort(violation.rule),
          impact: this.estimateImpact(violation.rule)
        };

        if (violation.severity === 'error' || recommendation.effort === 'low') {
          recommendations.immediate.push(recommendation);
        } else if (recommendation.effort === 'medium') {
          recommendations.shortTerm.push(recommendation);
        } else {
          recommendations.longTerm.push(recommendation);
        }
      });
    });

    return recommendations;
  }

  /**
   * Estimate effort required to fix a violation
   */
  estimateEffort(ruleName) {
    const effortMap = {
      'Props Validation': 'low',
      'Naming Conventions': 'low',
      'Accessibility': 'medium',
      'Performance Optimizations': 'medium',
      'Error Handling': 'medium',
      'Component Size': 'high',
      'Function Complexity': 'high',
      'State Management': 'high',
      'Code Duplication': 'medium'
    };

    return effortMap[ruleName] || 'medium';
  }

  /**
   * Estimate impact of fixing a violation
   */
  estimateImpact(ruleName) {
    const impactMap = {
      'Component Size': 'high',
      'Function Complexity': 'high',
      'Performance Optimizations': 'high',
      'Accessibility': 'high',
      'Error Handling': 'medium',
      'State Management': 'medium',
      'Code Duplication': 'medium',
      'Props Validation': 'low',
      'Naming Conventions': 'low'
    };

    return impactMap[ruleName] || 'medium';
  }

  /**
   * Export analysis results
   */
  exportResults(results, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      
      case 'csv':
        return this.convertToCSV(results);
      
      case 'html':
        return this.convertToHTML(results);
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Convert results to CSV format
   */
  convertToCSV(results) {
    const headers = ['Component', 'File', 'Score', 'Grade', 'Violations', 'Suggestions'];
    const rows = results.components.map(component => [
      component.componentName,
      component.fileName,
      component.score,
      component.grade,
      component.violations.length,
      component.suggestions.length
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Convert results to HTML format
   */
  convertToHTML(results) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Code Quality Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .component { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
          .grade-A { border-left: 5px solid #4CAF50; }
          .grade-B { border-left: 5px solid #8BC34A; }
          .grade-C { border-left: 5px solid #FFC107; }
          .grade-D { border-left: 5px solid #FF9800; }
          .grade-F { border-left: 5px solid #F44336; }
          .violation { color: #d32f2f; margin: 5px 0; }
          .suggestion { color: #1976d2; margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>Code Quality Report</h1>
        <div class="summary">
          <h2>Summary</h2>
          <p>Average Score: ${results.summary.averageScore}%</p>
          <p>Total Components: ${results.totalComponents}</p>
        </div>
        ${results.components.map(component => `
          <div class="component grade-${component.grade}">
            <h3>${component.componentName} (${component.score}% - Grade ${component.grade})</h3>
            <p><strong>File:</strong> ${component.fileName}</p>
            ${component.violations.map(v => `<div class="violation">❌ ${v.message}</div>`).join('')}
            ${component.suggestions.map(s => `<div class="suggestion">💡 ${s}</div>`).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }
}

// Create singleton instance
const codeQualityAnalyzer = new CodeQualityAnalyzer();

export default codeQualityAnalyzer;
export { CodeQualityAnalyzer };

/**
 * React hook for component quality monitoring
 */
export const useCodeQuality = (componentName, componentCode) => {
  const [analysis, setAnalysis] = React.useState(null);
  
  React.useEffect(() => {
    if (componentCode) {
      const result = codeQualityAnalyzer.analyzeComponent({
        name: componentName,
        code: componentCode
      });
      setAnalysis(result);
    }
  }, [componentName, componentCode]);
  
  return analysis;
};

/**
 * Development-only component quality checker
 */
export const QualityChecker = ({ children, componentName, enabled = process.env.NODE_ENV === 'development' }) => {
  React.useEffect(() => {
    if (enabled && componentName) {
      // In a real implementation, you'd need to get the component's source code
      console.log(`🔍 Quality check for ${componentName}`);
    }
  }, [componentName, enabled]);
  
  return children;
};