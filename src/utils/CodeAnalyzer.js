/**
 * @file CodeAnalyzer.js
 * @description Utilidad para analizar código y detectar code smells, patrones y oportunidades de mejora
 * Proporciona análisis estático del código React para optimización
 */

/**
 * Analizador de código para detectar problemas y mejoras
 */
class CodeAnalyzer {
  constructor() {
    this.rules = {
      // Reglas de componentes React
      reactComponent: {
        maxLines: 300,
        maxProps: 10,
        maxHooks: 8,
        maxNestedLevels: 4
      },
      
      // Reglas de funciones
      functions: {
        maxLines: 50,
        maxParameters: 5,
        maxComplexity: 10
      },
      
      // Reglas de archivos
      files: {
        maxLines: 500,
        maxImports: 20
      }
    };
    
    this.codeSmells = [];
    this.suggestions = [];
    this.metrics = {};
  }

  /**
   * Analiza un componente React
   * @param {string} componentCode - Código del componente
   * @param {string} fileName - Nombre del archivo
   * @returns {Object} Resultado del análisis
   */
  analyzeReactComponent(componentCode, fileName) {
    this.reset();
    
    const analysis = {
      fileName,
      codeSmells: [],
      suggestions: [],
      metrics: {},
      score: 0
    };

    // Análisis básico
    analysis.metrics = this.calculateMetrics(componentCode);
    
    // Detectar code smells
    analysis.codeSmells = this.detectCodeSmells(componentCode, analysis.metrics);
    
    // Generar sugerencias
    analysis.suggestions = this.generateSuggestions(componentCode, analysis.metrics, analysis.codeSmells);
    
    // Calcular puntuación
    analysis.score = this.calculateScore(analysis.metrics, analysis.codeSmells);
    
    return analysis;
  }

  /**
   * Calcula métricas del código
   * @param {string} code - Código a analizar
   * @returns {Object} Métricas calculadas
   */
  calculateMetrics(code) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length,
      commentLines: this.countCommentLines(lines),
      imports: this.countImports(code),
      exports: this.countExports(code),
      functions: this.countFunctions(code),
      hooks: this.countHooks(code),
      props: this.countProps(code),
      jsx: this.countJSXElements(code),
      complexity: this.calculateCyclomaticComplexity(code),
      nestedLevels: this.calculateMaxNestedLevels(code)
    };
  }

  /**
   * Detecta code smells en el código
   * @param {string} code - Código a analizar
   * @param {Object} metrics - Métricas del código
   * @returns {Array} Lista de code smells detectados
   */
  detectCodeSmells(code, metrics) {
    const smells = [];

    // Componente muy largo
    if (metrics.codeLines > this.rules.reactComponent.maxLines) {
      smells.push({
        type: 'LARGE_COMPONENT',
        severity: 'high',
        message: `Componente muy largo (${metrics.codeLines} líneas). Considerar dividir en componentes más pequeños.`,
        line: null,
        suggestion: 'Extraer lógica a hooks personalizados o dividir en subcomponentes'
      });
    }

    // Demasiados props
    if (metrics.props > this.rules.reactComponent.maxProps) {
      smells.push({
        type: 'TOO_MANY_PROPS',
        severity: 'medium',
        message: `Demasiados props (${metrics.props}). Considerar agrupar en objetos.`,
        line: null,
        suggestion: 'Agrupar props relacionados en objetos o usar Context API'
      });
    }

    // Demasiados hooks
    if (metrics.hooks > this.rules.reactComponent.maxHooks) {
      smells.push({
        type: 'TOO_MANY_HOOKS',
        severity: 'medium',
        message: `Demasiados hooks (${metrics.hooks}). Considerar extraer lógica.`,
        line: null,
        suggestion: 'Crear hooks personalizados para agrupar lógica relacionada'
      });
    }

    // Complejidad ciclomática alta
    if (metrics.complexity > this.rules.functions.maxComplexity) {
      smells.push({
        type: 'HIGH_COMPLEXITY',
        severity: 'high',
        message: `Alta complejidad ciclomática (${metrics.complexity}). Simplificar lógica.`,
        line: null,
        suggestion: 'Dividir en funciones más pequeñas o usar patrones como Strategy'
      });
    }

    // Anidamiento excesivo
    if (metrics.nestedLevels > this.rules.reactComponent.maxNestedLevels) {
      smells.push({
        type: 'DEEP_NESTING',
        severity: 'medium',
        message: `Anidamiento muy profundo (${metrics.nestedLevels} niveles).`,
        line: null,
        suggestion: 'Extraer componentes o usar early returns'
      });
    }

    // Detectar patrones específicos
    smells.push(...this.detectSpecificPatterns(code));

    return smells;
  }

  /**
   * Detecta patrones específicos problemáticos
   * @param {string} code - Código a analizar
   * @returns {Array} Patrones problemáticos encontrados
   */
  detectSpecificPatterns(code) {
    const patterns = [];

    // Inline styles excesivos
    const inlineStyleMatches = code.match(/style={{[^}]+}}/g) || [];
    if (inlineStyleMatches.length > 5) {
      patterns.push({
        type: 'EXCESSIVE_INLINE_STYLES',
        severity: 'low',
        message: `Demasiados estilos inline (${inlineStyleMatches.length}).`,
        suggestion: 'Mover estilos a CSS modules o styled-components'
      });
    }

    // Console.log en producción
    if (code.includes('console.log') || code.includes('console.error')) {
      patterns.push({
        type: 'CONSOLE_STATEMENTS',
        severity: 'low',
        message: 'Declaraciones console encontradas.',
        suggestion: 'Remover console.log o usar un logger apropiado'
      });
    }

    // Funciones anónimas en JSX
    const anonymousFunctionMatches = code.match(/onClick={\([^)]*\)\s*=>|onChange={\([^)]*\)\s*=>/g) || [];
    if (anonymousFunctionMatches.length > 3) {
      patterns.push({
        type: 'ANONYMOUS_FUNCTIONS_IN_JSX',
        severity: 'medium',
        message: `Muchas funciones anónimas en JSX (${anonymousFunctionMatches.length}).`,
        suggestion: 'Usar useCallback para optimizar re-renders'
      });
    }

    // Imports no utilizados (simplificado)
    const importLines = code.match(/^import.*from.*$/gm) || [];
    const unusedImports = this.detectUnusedImports(code, importLines);
    if (unusedImports.length > 0) {
      patterns.push({
        type: 'UNUSED_IMPORTS',
        severity: 'low',
        message: `Imports no utilizados: ${unusedImports.join(', ')}`,
        suggestion: 'Remover imports no utilizados'
      });
    }

    return patterns;
  }

  /**
   * Genera sugerencias de mejora
   * @param {string} code - Código a analizar
   * @param {Object} metrics - Métricas del código
   * @param {Array} codeSmells - Code smells detectados
   * @returns {Array} Sugerencias de mejora
   */
  generateSuggestions(code, metrics, codeSmells) {
    const suggestions = [];

    // Sugerencias basadas en métricas
    if (metrics.hooks > 5) {
      suggestions.push({
        type: 'OPTIMIZATION',
        priority: 'medium',
        title: 'Crear hooks personalizados',
        description: 'Agrupar hooks relacionados en hooks personalizados para mejor organización',
        example: `
// Antes
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// Después
const { loading, error, data, fetchData } = useApiData();
        `
      });
    }

    if (metrics.props > 7) {
      suggestions.push({
        type: 'REFACTORING',
        priority: 'high',
        title: 'Agrupar props relacionados',
        description: 'Considerar agrupar props en objetos o usar Context API',
        example: `
// Antes
<Component name={name} email={email} phone={phone} address={address} />

// Después
<Component user={{ name, email, phone, address }} />
        `
      });
    }

    // Sugerencias basadas en code smells
    const hasLargeComponent = codeSmells.some(smell => smell.type === 'LARGE_COMPONENT');
    if (hasLargeComponent) {
      suggestions.push({
        type: 'ARCHITECTURE',
        priority: 'high',
        title: 'Dividir componente grande',
        description: 'Extraer funcionalidad a componentes más pequeños y especializados',
        example: `
// Extraer secciones a componentes separados
const UserProfile = () => (
  <div>
    <UserHeader user={user} />
    <UserDetails user={user} />
    <UserActions user={user} />
  </div>
);
        `
      });
    }

    // Sugerencias de performance
    if (!code.includes('React.memo') && metrics.codeLines > 100) {
      suggestions.push({
        type: 'PERFORMANCE',
        priority: 'medium',
        title: 'Considerar React.memo',
        description: 'Usar React.memo para evitar re-renders innecesarios',
        example: 'export default React.memo(ComponentName);'
      });
    }

    if (!code.includes('useCallback') && code.includes('onClick=')) {
      suggestions.push({
        type: 'PERFORMANCE',
        priority: 'medium',
        title: 'Usar useCallback para event handlers',
        description: 'Memoizar funciones que se pasan como props',
        example: `
const handleClick = useCallback(() => {
  // lógica del click
}, [dependencies]);
        `
      });
    }

    return suggestions;
  }

  /**
   * Calcula puntuación de calidad del código
   * @param {Object} metrics - Métricas del código
   * @param {Array} codeSmells - Code smells detectados
   * @returns {number} Puntuación de 0 a 100
   */
  calculateScore(metrics, codeSmells) {
    let score = 100;

    // Penalizar por code smells
    codeSmells.forEach(smell => {
      switch (smell.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Penalizar por métricas altas
    if (metrics.complexity > 10) score -= 10;
    if (metrics.codeLines > 300) score -= 15;
    if (metrics.nestedLevels > 4) score -= 10;

    // Bonificar por buenas prácticas
    if (metrics.commentLines / metrics.codeLines > 0.1) score += 5;
    if (metrics.functions > 0 && metrics.codeLines / metrics.functions < 20) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // Métodos auxiliares para contar elementos
  countCommentLines(lines) {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    }).length;
  }

  countImports(code) {
    return (code.match(/^import.*from/gm) || []).length;
  }

  countExports(code) {
    return (code.match(/^export/gm) || []).length;
  }

  countFunctions(code) {
    const functionDeclarations = (code.match(/function\s+\w+/g) || []).length;
    const arrowFunctions = (code.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length;
    const methodDefinitions = (code.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
    return functionDeclarations + arrowFunctions + methodDefinitions;
  }

  countHooks(code) {
    return (code.match(/use[A-Z]\w*/g) || []).length;
  }

  countProps(code) {
    const propsMatch = code.match(/\(\s*{([^}]+)}\s*\)\s*=>/)
    if (!propsMatch) return 0;
    return propsMatch[1].split(',').filter(prop => prop.trim()).length;
  }

  countJSXElements(code) {
    return (code.match(/<[A-Z]\w*/g) || []).length;
  }

  calculateCyclomaticComplexity(code) {
    const complexityKeywords = ['if', 'else', 'while', 'for', 'case', 'catch', '&&', '||', '?'];
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g')) || [];
      complexity += matches.length;
    });
    
    return complexity;
  }

  calculateMaxNestedLevels(code) {
    let maxLevel = 0;
    let currentLevel = 0;
    
    for (const char of code) {
      if (char === '{') {
        currentLevel++;
        maxLevel = Math.max(maxLevel, currentLevel);
      } else if (char === '}') {
        currentLevel--;
      }
    }
    
    return maxLevel;
  }

  detectUnusedImports(code, importLines) {
    const unused = [];
    
    importLines.forEach(importLine => {
      const matches = importLine.match(/import\s+{([^}]+)}\s+from/);
      if (matches) {
        const imports = matches[1].split(',').map(imp => imp.trim());
        imports.forEach(imp => {
          if (!code.includes(imp) || code.indexOf(imp) === code.indexOf(importLine)) {
            unused.push(imp);
          }
        });
      }
    });
    
    return unused;
  }

  reset() {
    this.codeSmells = [];
    this.suggestions = [];
    this.metrics = {};
  }
}

// Función utilitaria para analizar múltiples archivos
export const analyzeProject = async (filePaths) => {
  const analyzer = new CodeAnalyzer();
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      // En un entorno real, aquí se leería el archivo
      // const code = await fs.readFile(filePath, 'utf8');
      // const analysis = analyzer.analyzeReactComponent(code, filePath);
      // results.push(analysis);
    } catch (error) {
      console.error(`Error analizando ${filePath}:`, error);
    }
  }
  
  return results;
};

// Función para generar reporte de análisis
export const generateAnalysisReport = (analyses) => {
  const totalFiles = analyses.length;
  const averageScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0) / totalFiles;
  
  const codeSmellsByType = {};
  const suggestionsByType = {};
  
  analyses.forEach(analysis => {
    analysis.codeSmells.forEach(smell => {
      codeSmellsByType[smell.type] = (codeSmellsByType[smell.type] || 0) + 1;
    });
    
    analysis.suggestions.forEach(suggestion => {
      suggestionsByType[suggestion.type] = (suggestionsByType[suggestion.type] || 0) + 1;
    });
  });
  
  return {
    summary: {
      totalFiles,
      averageScore: Math.round(averageScore),
      totalCodeSmells: Object.values(codeSmellsByType).reduce((sum, count) => sum + count, 0),
      totalSuggestions: Object.values(suggestionsByType).reduce((sum, count) => sum + count, 0)
    },
    codeSmellsByType,
    suggestionsByType,
    fileAnalyses: analyses
  };
};

export default CodeAnalyzer;