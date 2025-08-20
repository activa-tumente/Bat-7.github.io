import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleError } from '../../services/improvedErrorHandler';

/**
 * Test Slice - Manages test-related state
 * 
 * Features:
 * - Test session management
 * - Question navigation
 * - Answer tracking
 * - Progress monitoring
 * - Results calculation
 * - Test history
 */

// Test status constants
export const TEST_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  EXPIRED: 'expired'
};

// Question types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SCALE: 'scale',
  TEXT: 'text',
  RANKING: 'ranking'
};

// Test types
export const TEST_TYPES = {
  BAT7: 'bat7',
  PERSONALITY: 'personality',
  COGNITIVE: 'cognitive',
  APTITUDE: 'aptitude'
};

// Async thunks
export const startTestSession = createAsyncThunk(
  'test/startTestSession',
  async ({ testId, userId }, { rejectWithValue }) => {
    try {
      // This would typically call an API
      const response = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start test');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      improvedErrorHandler.handleError(error, {
        context: 'startTestSession',
        userId,
        testId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'test/submitAnswer',
  async ({ sessionId, questionId, answer, timeSpent }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/test-sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
          timeSpent,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'submitAnswer',
        sessionId,
        questionId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const completeTestSession = createAsyncThunk(
  'test/completeTestSession',
  async ({ sessionId }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { answers, startTime } = state.test.currentSession;
      
      const response = await fetch(`/api/test-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          completedAt: Date.now(),
          totalTime: Date.now() - startTime
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete test');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'completeTestSession',
        sessionId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTestHistory = createAsyncThunk(
  'test/fetchTestHistory',
  async ({ userId, limit = 10, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/test-history?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch test history');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'fetchTestHistory',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTestResults = createAsyncThunk(
  'test/fetchTestResults',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/test-sessions/${sessionId}/results`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'fetchTestResults',
        sessionId
      });
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Current test session
  currentSession: {
    id: null,
    testId: null,
    userId: null,
    status: TEST_STATUS.NOT_STARTED,
    startTime: null,
    endTime: null,
    currentQuestionIndex: 0,
    totalQuestions: 0,
    answers: {},
    timeSpent: {},
    progress: 0,
    allowedTime: null,
    timeRemaining: null,
    isPaused: false,
    pauseStartTime: null,
    totalPauseTime: 0
  },
  
  // Test configuration
  testConfig: {
    id: null,
    name: '',
    description: '',
    type: null,
    version: '1.0',
    timeLimit: null,
    questionsPerPage: 1,
    allowBackNavigation: false,
    allowPause: true,
    randomizeQuestions: false,
    randomizeAnswers: false,
    showProgress: true,
    showTimeRemaining: true,
    autoSubmit: true,
    passingScore: null
  },
  
  // Questions
  questions: [],
  currentQuestion: null,
  
  // Results
  results: {
    sessionId: null,
    scores: {},
    percentile: null,
    interpretation: '',
    recommendations: [],
    detailedAnalysis: {},
    comparisonData: null,
    generatedAt: null
  },
  
  // Test history
  history: {
    tests: [],
    totalCount: 0,
    currentPage: 1,
    hasMore: false
  },
  
  // Available tests
  availableTests: [],
  
  // Loading states
  loading: {
    starting: false,
    submitting: false,
    completing: false,
    fetchingHistory: false,
    fetchingResults: false,
    fetchingTests: false
  },
  
  // Error states
  errors: {
    start: null,
    submit: null,
    complete: null,
    history: null,
    results: null,
    general: null
  },
  
  // UI state
  ui: {
    showInstructions: true,
    showConfirmation: false,
    showResults: false,
    highlightedAnswers: [],
    flaggedQuestions: [],
    reviewMode: false,
    fullscreen: false
  },
  
  // Statistics
  statistics: {
    totalTestsTaken: 0,
    averageScore: 0,
    bestScore: 0,
    lastTestDate: null,
    testsByType: {},
    monthlyProgress: []
  },
  
  // Legacy compatibility
  currentTest: null,
  testResults: null,
  answeredQuestions: {},
  timeRemaining: 0,
  testStarted: false,
  testCompleted: false,
  error: null
};

// Test slice
export const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Session management
    initializeSession: (state, action) => {
      const { sessionId, testConfig, questions } = action.payload;
      state.currentSession = {
        ...initialState.currentSession,
        id: sessionId,
        testId: testConfig.id,
        status: TEST_STATUS.NOT_STARTED,
        totalQuestions: questions.length,
        allowedTime: testConfig.timeLimit,
        timeRemaining: testConfig.timeLimit
      };
      state.testConfig = testConfig;
      state.questions = questions;
      state.currentQuestion = questions[0] || null;
      
      // Legacy compatibility
      state.currentTest = testConfig;
      state.timeRemaining = testConfig.timeLimit || 0;
    },
    
    startSession: (state) => {
      state.currentSession.status = TEST_STATUS.IN_PROGRESS;
      state.currentSession.startTime = Date.now();
      state.ui.showInstructions = false;
      
      // Legacy compatibility
      state.testStarted = true;
    },
    
    pauseSession: (state) => {
      if (state.testConfig.allowPause && state.currentSession.status === TEST_STATUS.IN_PROGRESS) {
        state.currentSession.status = TEST_STATUS.PAUSED;
        state.currentSession.isPaused = true;
        state.currentSession.pauseStartTime = Date.now();
      }
    },
    
    resumeSession: (state) => {
      if (state.currentSession.isPaused) {
        state.currentSession.status = TEST_STATUS.IN_PROGRESS;
        state.currentSession.isPaused = false;
        
        if (state.currentSession.pauseStartTime) {
          state.currentSession.totalPauseTime += Date.now() - state.currentSession.pauseStartTime;
          state.currentSession.pauseStartTime = null;
        }
      }
    },
    
    // Navigation
    goToQuestion: (state, action) => {
      const questionIndex = action.payload;
      if (questionIndex >= 0 && questionIndex < state.questions.length) {
        state.currentSession.currentQuestionIndex = questionIndex;
        state.currentQuestion = state.questions[questionIndex];
        state.currentSession.progress = ((questionIndex + 1) / state.questions.length) * 100;
      }
    },
    
    nextQuestion: (state) => {
      const nextIndex = state.currentSession.currentQuestionIndex + 1;
      if (nextIndex < state.questions.length) {
        state.currentSession.currentQuestionIndex = nextIndex;
        state.currentQuestion = state.questions[nextIndex];
        state.currentSession.progress = ((nextIndex + 1) / state.questions.length) * 100;
      }
    },
    
    previousQuestion: (state) => {
      if (state.testConfig.allowBackNavigation) {
        const prevIndex = state.currentSession.currentQuestionIndex - 1;
        if (prevIndex >= 0) {
          state.currentSession.currentQuestionIndex = prevIndex;
          state.currentQuestion = state.questions[prevIndex];
          state.currentSession.progress = ((prevIndex + 1) / state.questions.length) * 100;
        }
      }
    },
    
    // Answer management
    setAnswer: (state, action) => {
      const { questionId, answer, timeSpent } = action.payload;
      state.currentSession.answers[questionId] = {
        value: answer,
        timestamp: Date.now(),
        timeSpent: timeSpent || 0
      };
      
      if (timeSpent) {
        state.currentSession.timeSpent[questionId] = timeSpent;
      }
      
      // Legacy compatibility
      state.answeredQuestions[questionId] = answer;
    },
    
    clearAnswer: (state, action) => {
      const questionId = action.payload;
      delete state.currentSession.answers[questionId];
      delete state.currentSession.timeSpent[questionId];
      
      // Legacy compatibility
      delete state.answeredQuestions[questionId];
    },
    
    // Question flagging
    flagQuestion: (state, action) => {
      const questionId = action.payload;
      if (!state.ui.flaggedQuestions.includes(questionId)) {
        state.ui.flaggedQuestions.push(questionId);
      }
    },
    
    unflagQuestion: (state, action) => {
      const questionId = action.payload;
      state.ui.flaggedQuestions = state.ui.flaggedQuestions.filter(id => id !== questionId);
    },
    
    // Time management
    updateTimeRemaining: (state, action) => {
      const timeRemaining = action.payload;
      state.currentSession.timeRemaining = Math.max(0, timeRemaining);
      
      // Legacy compatibility
      state.timeRemaining = timeRemaining;
      
      if (timeRemaining <= 0 && state.testConfig.autoSubmit) {
        state.currentSession.status = TEST_STATUS.EXPIRED;
      }
    },
    
    // UI actions
    toggleInstructions: (state) => {
      state.ui.showInstructions = !state.ui.showInstructions;
    },
    
    setShowConfirmation: (state, action) => {
      state.ui.showConfirmation = action.payload;
    },
    
    setReviewMode: (state, action) => {
      state.ui.reviewMode = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.ui.fullscreen = !state.ui.fullscreen;
    },
    
    highlightAnswers: (state, action) => {
      state.ui.highlightedAnswers = action.payload;
    },
    
    // Results
    setResults: (state, action) => {
      state.results = {
        ...state.results,
        ...action.payload,
        generatedAt: Date.now()
      };
      state.ui.showResults = true;
      
      // Legacy compatibility
      state.testResults = action.payload;
    },
    
    clearResults: (state) => {
      state.results = initialState.results;
      state.ui.showResults = false;
      
      // Legacy compatibility
      state.testResults = null;
    },
    
    // Statistics
    updateStatistics: (state, action) => {
      state.statistics = {
        ...state.statistics,
        ...action.payload
      };
    },
    
    // Error handling
    setError: (state, action) => {
      const { type, error } = action.payload;
      if (state.errors[type] !== undefined) {
        state.errors[type] = error;
      }
      
      // Legacy compatibility
      state.error = error;
    },
    
    clearError: (state, action) => {
      const type = action.payload;
      if (state.errors[type] !== undefined) {
        state.errors[type] = null;
      }
      
      // Legacy compatibility
      if (type === 'general') {
        state.error = null;
      }
    },
    
    clearAllErrors: (state) => {
      state.errors = initialState.errors;
      state.error = null;
    },
    
    // Legacy actions for backward compatibility
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
      state.answeredQuestions = {};
      state.testStarted = false;
      state.testCompleted = false;
      state.timeRemaining = action.payload?.duration ? action.payload.duration * 60 : 0;
      
      // Update new structure
      if (action.payload) {
        state.testConfig = {
          ...state.testConfig,
          ...action.payload,
          timeLimit: action.payload.duration ? action.payload.duration * 60 : null
        };
        state.currentSession.timeRemaining = state.timeRemaining;
      }
    },
    
    startTest: (state) => {
      state.testStarted = true;
      
      // Update new structure
      state.currentSession.status = TEST_STATUS.IN_PROGRESS;
      state.currentSession.startTime = Date.now();
    },
    
    answerQuestion: (state, action) => {
      const { questionId, answerId } = action.payload;
      state.answeredQuestions[questionId] = answerId;
      
      // Update new structure
      state.currentSession.answers[questionId] = {
        value: answerId,
        timestamp: Date.now(),
        timeSpent: 0
      };
    },
    
    completeTest: (state) => {
      state.testCompleted = true;
      
      // Update new structure
      state.currentSession.status = TEST_STATUS.COMPLETED;
      state.currentSession.endTime = Date.now();
    },
    
    setTestResults: (state, action) => {
      state.testResults = action.payload;
      
      // Update new structure
      state.results = {
        ...state.results,
        ...action.payload,
        generatedAt: Date.now()
      };
      state.ui.showResults = true;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
      
      // Update new structure
      Object.keys(state.loading).forEach(key => {
        state.loading[key] = action.payload;
      });
    },
    
    // Reset actions
    resetSession: (state) => {
      state.currentSession = initialState.currentSession;
      state.currentQuestion = null;
      state.questions = [];
      state.testConfig = initialState.testConfig;
      state.ui = initialState.ui;
      state.errors = initialState.errors;
    },
    
    resetTestState: () => initialState,
    
    resetTest: () => initialState
  },
  
  extraReducers: (builder) => {
    // Start test session
    builder
      .addCase(startTestSession.pending, (state) => {
        state.loading.starting = true;
        state.errors.start = null;
        state.loading = true; // Legacy
      })
      .addCase(startTestSession.fulfilled, (state, action) => {
        state.loading.starting = false;
        state.loading = false; // Legacy
        const { session, config, questions } = action.payload;
        
        state.currentSession = {
          ...state.currentSession,
          ...session,
          status: TEST_STATUS.IN_PROGRESS,
          startTime: Date.now()
        };
        state.testConfig = config;
        state.questions = questions;
        state.currentQuestion = questions[0] || null;
        
        // Legacy compatibility
        state.currentTest = config;
        state.testStarted = true;
      })
      .addCase(startTestSession.rejected, (state, action) => {
        state.loading.starting = false;
        state.loading = false; // Legacy
        state.errors.start = action.payload;
        state.error = action.payload; // Legacy
      })
      
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.loading.submitting = true;
        state.errors.submit = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading.submitting = false;
        // Answer is already stored locally, this confirms server sync
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading.submitting = false;
        state.errors.submit = action.payload;
      })
      
      // Complete test session
      .addCase(completeTestSession.pending, (state) => {
        state.loading.completing = true;
        state.errors.complete = null;
        state.loading = true; // Legacy
      })
      .addCase(completeTestSession.fulfilled, (state, action) => {
        state.loading.completing = false;
        state.loading = false; // Legacy
        state.currentSession.status = TEST_STATUS.COMPLETED;
        state.currentSession.endTime = Date.now();
        
        // Legacy compatibility
        state.testCompleted = true;
        
        if (action.payload.results) {
          state.results = {
            ...state.results,
            ...action.payload.results,
            sessionId: state.currentSession.id,
            generatedAt: Date.now()
          };
          state.ui.showResults = true;
          
          // Legacy compatibility
          state.testResults = action.payload.results;
        }
      })
      .addCase(completeTestSession.rejected, (state, action) => {
        state.loading.completing = false;
        state.loading = false; // Legacy
        state.errors.complete = action.payload;
        state.error = action.payload; // Legacy
      })
      
      // Fetch test history
      .addCase(fetchTestHistory.pending, (state) => {
        state.loading.fetchingHistory = true;
        state.errors.history = null;
      })
      .addCase(fetchTestHistory.fulfilled, (state, action) => {
        state.loading.fetchingHistory = false;
        const { tests, totalCount, page, hasMore } = action.payload;
        
        if (page === 1) {
          state.history.tests = tests;
        } else {
          state.history.tests.push(...tests);
        }
        
        state.history.totalCount = totalCount;
        state.history.currentPage = page;
        state.history.hasMore = hasMore;
      })
      .addCase(fetchTestHistory.rejected, (state, action) => {
        state.loading.fetchingHistory = false;
        state.errors.history = action.payload;
      })
      
      // Fetch test results
      .addCase(fetchTestResults.pending, (state) => {
        state.loading.fetchingResults = true;
        state.errors.results = null;
      })
      .addCase(fetchTestResults.fulfilled, (state, action) => {
        state.loading.fetchingResults = false;
        state.results = {
          ...state.results,
          ...action.payload,
          generatedAt: Date.now()
        };
        state.ui.showResults = true;
        
        // Legacy compatibility
        state.testResults = action.payload;
      })
      .addCase(fetchTestResults.rejected, (state, action) => {
        state.loading.fetchingResults = false;
        state.errors.results = action.payload;
      });
  }
});

// Export actions
export const {
  // New actions
  initializeSession,
  startSession,
  pauseSession,
  resumeSession,
  goToQuestion,
  nextQuestion,
  previousQuestion,
  setAnswer,
  clearAnswer,
  flagQuestion,
  unflagQuestion,
  toggleInstructions,
  setShowConfirmation,
  setReviewMode,
  toggleFullscreen,
  highlightAnswers,
  setResults,
  clearResults,
  updateStatistics,
  clearError,
  clearAllErrors,
  resetSession,
  resetTest,
  
  // Legacy actions (maintained for backward compatibility)
  setCurrentTest,
  startTest,
  updateTimeRemaining,
  answerQuestion,
  completeTest,
  setTestResults,
  setLoading,
  setError,
  resetTestState
} = testSlice.actions;

// New selectors
export const selectTest = (state) => state.test;
export const selectCurrentSession = (state) => state.test.currentSession;
export const selectTestConfig = (state) => state.test.testConfig;
export const selectQuestions = (state) => state.test.questions;
export const selectCurrentQuestion = (state) => state.test.currentQuestion;
export const selectCurrentQuestionIndex = (state) => state.test.currentSession.currentQuestionIndex;
export const selectAnswers = (state) => state.test.currentSession.answers;
export const selectResults = (state) => state.test.results;
export const selectTestHistory = (state) => state.test.history;
export const selectTestLoading = (state) => state.test.loading;
export const selectTestErrors = (state) => state.test.errors;
export const selectTestUI = (state) => state.test.ui;
export const selectTestStatistics = (state) => state.test.statistics;

// Legacy selectors (maintained for backward compatibility)
export const selectCurrentTest = (state) => state.test.currentTest;
export const selectTestStarted = (state) => state.test.testStarted;
export const selectTimeRemaining = (state) => state.test.timeRemaining;
export const selectAnsweredQuestions = (state) => state.test.answeredQuestions;
export const selectTestCompleted = (state) => state.test.testCompleted;
export const selectTestResults = (state) => state.test.testResults;
export const selectLoading = (state) => state.test.loading;
export const selectError = (state) => state.test.error;

// Computed selectors
export const selectIsTestInProgress = (state) => 
  state.test.currentSession.status === TEST_STATUS.IN_PROGRESS;

export const selectIsTestCompleted = (state) => 
  state.test.currentSession.status === TEST_STATUS.COMPLETED;

export const selectCanGoBack = (state) => 
  state.test.testConfig.allowBackNavigation && 
  state.test.currentSession.currentQuestionIndex > 0;

export const selectCanGoForward = (state) => 
  state.test.currentSession.currentQuestionIndex < state.test.questions.length - 1;

export const selectProgress = (state) => {
  const { currentQuestionIndex, totalQuestions } = state.test.currentSession;
  return totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
};

export const selectAnsweredQuestionsCount = (state) => 
  Object.keys(state.test.currentSession.answers).length;

export const selectUnansweredQuestions = (state) => {
  const { totalQuestions } = state.test.currentSession;
  const answeredCount = Object.keys(state.test.currentSession.answers).length;
  return totalQuestions - answeredCount;
};

export const selectCurrentQuestionAnswer = (state) => {
  const currentQuestion = state.test.currentQuestion;
  if (!currentQuestion) return null;
  return state.test.currentSession.answers[currentQuestion.id] || null;
};

export const selectTimeElapsed = (state) => {
  const { startTime, totalPauseTime, isPaused, pauseStartTime } = state.test.currentSession;
  if (!startTime) return 0;
  
  const now = Date.now();
  const currentPauseTime = isPaused && pauseStartTime ? now - pauseStartTime : 0;
  return now - startTime - totalPauseTime - currentPauseTime;
};

export const selectIsTimeExpired = (state) => {
  const { timeRemaining } = state.test.currentSession;
  return timeRemaining !== null && timeRemaining <= 0;
};

export const selectFlaggedQuestionsCount = (state) => 
  state.test.ui.flaggedQuestions.length;

// Export reducer
export default testSlice.reducer;
