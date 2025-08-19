import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../../context/AuthContext';
import ErrorBoundary from '../../components/error/ErrorBoundary';

/**
 * Utilidades de testing personalizadas
 * Proporciona wrappers y helpers para facilitar el testing
 */

// Wrapper personalizado que incluye todos los providers necesarios
const AllTheProviders = ({ children, initialEntries = ['/'] }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

// Función de render personalizada
const customRender = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <AllTheProviders initialEntries={initialEntries}>
      {children}
    </AllTheProviders>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// Wrapper para testing de hooks
export const createHookWrapper = (providers = {}) => {
  const { 
    authUser = null,
    initialRoute = '/',
    ...otherProviders 
  } = providers;

  return ({ children }) => (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider initialUser={authUser}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Mock de usuario autenticado
export const createMockAuthUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  nombre: 'Test',
  apellido: 'User',
  tipo_usuario: 'estudiante',
  documento: '12345678',
  telefono: '+1234567890',
  fechaNacimiento: '1990-01-01',
  activo: true,
  ...overrides
});

// Mock de contexto de autenticación
export const createMockAuthContext = (overrides = {}) => ({
  user: createMockAuthUser(),
  isAuthenticated: true,
  loading: false,
  userRole: 'estudiante',
  login: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true }),
  updateProfile: vi.fn().mockResolvedValue({ success: true }),
  ...overrides
});

// Helpers para eventos de usuario
export const userEvents = {
  // Simular click en elemento
  click: async (element) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(element);
  },

  // Simular escritura en input
  type: async (element, text) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(element, { target: { value: text } });
  },

  // Simular envío de formulario
  submit: async (form) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.submit(form);
  },

  // Simular selección en dropdown
  select: async (element, value) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(element, { target: { value } });
  },

  // Simular hover
  hover: async (element) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.mouseEnter(element);
  },

  // Simular blur
  blur: async (element) => {
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.blur(element);
  }
};

// Helpers para esperas
export const waitForHelpers = {
  // Esperar por elemento
  element: async (getByTestId, testId, timeout = 1000) => {
    const { waitFor } = await import('@testing-library/react');
    return waitFor(() => getByTestId(testId), { timeout });
  },

  // Esperar por texto
  text: async (getByText, text, timeout = 1000) => {
    const { waitFor } = await import('@testing-library/react');
    return waitFor(() => getByText(text), { timeout });
  },

  // Esperar por desaparición
  disappear: async (queryByTestId, testId, timeout = 1000) => {
    const { waitFor } = await import('@testing-library/react');
    return waitFor(() => expect(queryByTestId(testId)).not.toBeInTheDocument(), { timeout });
  },

  // Esperar por loading
  loading: async (queryByTestId, timeout = 5000) => {
    const { waitFor } = await import('@testing-library/react');
    return waitFor(() => {
      const loader = queryByTestId('loading-spinner') || queryByTestId('loading');
      return expect(loader).not.toBeInTheDocument();
    }, { timeout });
  }
};

// Helpers para formularios
export const formHelpers = {
  // Llenar formulario completo
  fillForm: async (form, data) => {
    for (const [name, value] of Object.entries(data)) {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          await userEvents.type(field, value);
        }
      }
    }
  },

  // Validar errores de formulario
  expectFormErrors: (container, expectedErrors) => {
    expectedErrors.forEach(error => {
      expect(container).toHaveTextContent(error);
    });
  },

  // Validar que no hay errores
  expectNoFormErrors: (container) => {
    const errorElements = container.querySelectorAll('[role="alert"], .error, .text-red-600');
    expect(errorElements).toHaveLength(0);
  }
};

// Helpers para testing de hooks
export const hookHelpers = {
  // Crear resultado de hook mock
  createHookResult: (result, loading = false, error = null) => ({
    data: result,
    loading,
    error,
    refetch: vi.fn(),
    mutate: vi.fn()
  }),

  // Mock de hook de validación
  createValidationHookResult: (isValid = true, errors = {}) => ({
    values: {},
    errors,
    touched: {},
    isValid,
    isDirty: false,
    isSubmitting: false,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    handleSubmit: vi.fn(),
    resetForm: vi.fn(),
    setFormValues: vi.fn(),
    setFormErrors: vi.fn()
  })
};

// Helpers para testing de componentes específicos
export const componentHelpers = {
  // Crear props mock para QuestionnaireForm
  createQuestionnaireFormProps: (overrides = {}) => ({
    questionnaire: {
      id: 'test-questionnaire',
      title: 'Test Questionnaire',
      description: 'Test description',
      duration: 30,
      questions: []
    },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides
  }),

  // Crear props mock para ReportCard
  createReportCardProps: (overrides = {}) => ({
    report: {
      id: 'test-report',
      title: 'Test Report',
      type: 'individual',
      candidateName: 'Test User',
      status: 'completed',
      score: 85,
      createdAt: new Date().toISOString()
    },
    onView: vi.fn(),
    onDownload: vi.fn(),
    onShare: vi.fn(),
    onDelete: vi.fn(),
    ...overrides
  }),

  // Crear props mock para ValidatedInput
  createValidatedInputProps: (overrides = {}) => ({
    name: 'testField',
    label: 'Test Field',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    error: null,
    touched: false,
    ...overrides
  })
};

// Matchers personalizados
export const customMatchers = {
  // Verificar que un elemento tiene clase de error
  toHaveErrorClass: (received) => {
    const hasErrorClass = received.classList.contains('error') || 
                         received.classList.contains('text-red-600') ||
                         received.classList.contains('border-red-300');
    
    return {
      message: () => `expected element to have error class`,
      pass: hasErrorClass
    };
  },

  // Verificar que un formulario es válido
  toBeValidForm: (received) => {
    const hasErrors = received.querySelectorAll('[role="alert"], .error').length > 0;
    
    return {
      message: () => `expected form to be valid`,
      pass: !hasErrors
    };
  }
};

// Re-exportar todo de testing-library
export * from '@testing-library/react';

// Exportar render personalizado como default
export { customRender as render };

// Exportar utilidades adicionales
export {
  AllTheProviders,
  userEvents,
  waitForHelpers,
  formHelpers,
  hookHelpers,
  componentHelpers,
  customMatchers
};
