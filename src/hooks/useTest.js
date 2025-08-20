import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentTest,
  startTest,
  updateTimeRemaining,
  answerQuestion,
  completeTest,
  setTestResults,
  resetTestState,
  selectCurrentTest,
  selectTestStarted,
  selectTimeRemaining,
  selectAnsweredQuestions,
  selectTestCompleted,
  selectTestResults,
  selectLoading,
  selectError
} from '../store/slices/testSlice';

export const useTest = () => {
  const dispatch = useDispatch();
  
  // Selectores
  const currentTest = useSelector(selectCurrentTest);
  const testStarted = useSelector(selectTestStarted);
  const timeRemaining = useSelector(selectTimeRemaining);
  const answeredQuestions = useSelector(selectAnsweredQuestions);
  const testCompleted = useSelector(selectTestCompleted);
  const testResults = useSelector(selectTestResults);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  // Acciones
  const setTest = (test) => dispatch(setCurrentTest(test));
  const beginTest = () => dispatch(startTest());
  const updateTime = (time) => dispatch(updateTimeRemaining(time));
  const submitAnswer = (questionId, answerId) => dispatch(answerQuestion({ questionId, answerId }));
  const finishTest = () => dispatch(completeTest());
  const setResults = (results) => dispatch(setTestResults(results));
  const resetTest = () => dispatch(resetTestState());
  
  // Utilidades
  const isQuestionAnswered = (questionId) => {
    return answeredQuestions[questionId] !== undefined;
  };
  
  const getAnswer = (questionId) => {
    return answeredQuestions[questionId];
  };
  
  const getTotalAnswered = () => {
    return Object.keys(answeredQuestions).length;
  };
  
  const calculateProgress = () => {
    if (!currentTest || !currentTest.questions) return 0;
    return (getTotalAnswered() / currentTest.questions.length) * 100;
  };
  
  return {
    // Estado
    currentTest,
    testStarted,
    timeRemaining,
    answeredQuestions,
    testCompleted,
    testResults,
    loading,
    error,
    
    // Acciones
    setTest,
    beginTest,
    updateTime,
    submitAnswer,
    finishTest,
    setResults,
    resetTest,
    
    // Utilidades
    isQuestionAnswered,
    getAnswer,
    getTotalAnswered,
    calculateProgress,
  };
};