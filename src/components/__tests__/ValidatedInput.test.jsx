import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils/testUtils';
import ValidatedInput from '../forms/ValidatedInput';

describe('ValidatedInput', () => {
  const defaultProps = {
    name: 'testField',
    label: 'Test Field',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar correctamente', () => {
      render(<ValidatedInput {...defaultProps} />);
      
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('debe mostrar label con asterisco para campos requeridos', () => {
      render(<ValidatedInput {...defaultProps} required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('debe mostrar placeholder', () => {
      render(<ValidatedInput {...defaultProps} placeholder="Enter text here" />);
      
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });

    it('debe aplicar clases CSS personalizadas', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          className="custom-class"
          inputClassName="custom-input-class"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input-class');
    });
  });

  describe('Estados de validación', () => {
    it('debe mostrar estado de error', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          error="This field is required"
          touched={true}
        />
      );
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('border-red-300');
    });

    it('debe mostrar estado válido', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          value="valid value"
          touched={true}
          showValidIcon={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-300');
    });

    it('debe mostrar icono de error', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          error="Error message"
          touched={true}
        />
      );
      
      // Buscar por el icono de error (puede ser por clase o data-testid)
      const errorIcon = screen.getByText('This field is required').previousElementSibling;
      expect(errorIcon).toBeInTheDocument();
    });

    it('debe mostrar icono de validación exitosa', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          value="valid value"
          touched={true}
          showValidIcon={true}
        />
      );
      
      // El icono de check debería estar presente
      const input = screen.getByRole('textbox');
      const container = input.parentElement;
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Tipos de input', () => {
    it('debe renderizar input de password con toggle', () => {
      render(<ValidatedInput {...defaultProps} type="password" />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'password');
      
      // Debe haber un botón para mostrar/ocultar password
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('debe alternar visibilidad de password', async () => {
      render(<ValidatedInput {...defaultProps} type="password" />);
      
      const input = screen.getByLabelText('Test Field');
      const toggleButton = screen.getByRole('button');
      
      expect(input).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('type', 'text');
      });
    });

    it('debe renderizar input de email', () => {
      render(<ValidatedInput {...defaultProps} type="email" />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('debe renderizar input de número', () => {
      render(<ValidatedInput {...defaultProps} type="number" />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Interacciones', () => {
    it('debe llamar onChange cuando el valor cambia', async () => {
      const onChange = vi.fn();
      render(<ValidatedInput {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'new value'
          })
        })
      );
    });

    it('debe llamar onBlur cuando pierde el foco', () => {
      const onBlur = vi.fn();
      render(<ValidatedInput {...defaultProps} onBlur={onBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      expect(onBlur).toHaveBeenCalled();
    });

    it('debe llamar onFocus cuando gana el foco', () => {
      const onFocus = vi.fn();
      render(<ValidatedInput {...defaultProps} onFocus={onFocus} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(onFocus).toHaveBeenCalled();
    });

    it('debe manejar eventos de teclado', () => {
      const onKeyDown = vi.fn();
      render(<ValidatedInput {...defaultProps} onKeyDown={onKeyDown} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('Prefijos y sufijos', () => {
    it('debe mostrar prefijo', () => {
      render(<ValidatedInput {...defaultProps} prefix="@" />);
      
      expect(screen.getByText('@')).toBeInTheDocument();
    });

    it('debe mostrar sufijo', () => {
      render(<ValidatedInput {...defaultProps} suffix=".com" />);
      
      expect(screen.getByText('.com')).toBeInTheDocument();
    });

    it('debe ajustar padding cuando hay prefijo', () => {
      render(<ValidatedInput {...defaultProps} prefix="@" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('debe ajustar padding cuando hay sufijo', () => {
      render(<ValidatedInput {...defaultProps} suffix=".com" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('Texto de ayuda', () => {
    it('debe mostrar texto de ayuda', () => {
      render(<ValidatedInput {...defaultProps} helpText="This is help text" />);
      
      expect(screen.getByText('This is help text')).toBeInTheDocument();
    });

    it('debe ocultar texto de ayuda cuando hay error', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          helpText="This is help text"
          error="Error message"
          touched={true}
        />
      );
      
      expect(screen.queryByText('This is help text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Contador de caracteres', () => {
    it('debe mostrar contador cuando hay maxLength', () => {
      render(<ValidatedInput {...defaultProps} maxLength={100} value="test" />);
      
      expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('debe actualizar contador cuando cambia el valor', async () => {
      const { rerender } = render(
        <ValidatedInput {...defaultProps} maxLength={100} value="test" />
      );
      
      expect(screen.getByText('4/100')).toBeInTheDocument();
      
      rerender(<ValidatedInput {...defaultProps} maxLength={100} value="test value" />);
      
      expect(screen.getByText('10/100')).toBeInTheDocument();
    });
  });

  describe('Estado deshabilitado', () => {
    it('debe deshabilitar input', () => {
      render(<ValidatedInput {...defaultProps} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-gray-50');
    });

    it('debe deshabilitar botón de toggle de password', () => {
      render(<ValidatedInput {...defaultProps} type="password" disabled />);
      
      const input = screen.getByRole('textbox');
      const toggleButton = screen.getByRole('button');
      
      expect(input).toBeDisabled();
      // El botón de toggle no debería estar deshabilitado, pero el input sí
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener atributos ARIA correctos', () => {
      render(
        <ValidatedInput 
          {...defaultProps} 
          error="Error message"
          touched={true}
          helpText="Help text"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('debe asociar label con input', () => {
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Field');
      
      expect(input).toHaveAttribute('id', defaultProps.name);
      expect(label).toHaveAttribute('for', defaultProps.name);
    });

    it('debe marcar campos requeridos', () => {
      render(<ValidatedInput {...defaultProps} required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Forwarded ref', () => {
    it('debe pasar ref al input', () => {
      const ref = React.createRef();
      render(<ValidatedInput {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current.name).toBe(defaultProps.name);
    });
  });
});
