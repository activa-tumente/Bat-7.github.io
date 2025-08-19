/**
 * @file UsageControlPanelEnhanced.test.jsx
 * @description Unit tests for UsageControlPanelEnhanced component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UsageControlPanelEnhanced from '../UsageControlPanelEnhanced';

// Mock the custom hook
vi.mock('../../hooks/useUsageControl', () => ({
  useUsageControl: () => ({
    usageData: {
      usosRestantes: 10,
      usosUtilizados: 5,
      totalComprados: 15,
      paqueteActual: null
    },
    estadisticas: {
      usosHoy: 2,
      usosSemana: 8,
      pacientesEvaluados: 25,
      informesGenerados: 12
    },
    loading: false,
    error: null,
    purchasePackage: vi.fn(),
    verifyPIN: vi.fn(),
    refreshData: vi.fn()
  })
}));

describe('UsageControlPanelEnhanced', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('renders usage statistics correctly', () => {
    render(<UsageControlPanelEnhanced />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // usosRestantes
    expect(screen.getByText('5')).toBeInTheDocument(); // usosUtilizados
    expect(screen.getByText('25')).toBeInTheDocument(); // pacientesEvaluados
    expect(screen.getByText('12')).toBeInTheDocument(); // informesGenerados
  });

  test('shows PIN verification form when not verified', () => {
    render(<UsageControlPanelEnhanced />);
    
    expect(screen.getByPlaceholderText('PIN (1234)')).toBeInTheDocument();
    expect(screen.getByText('Verificar')).toBeInTheDocument();
  });

  test('handles PIN verification', async () => {
    render(<UsageControlPanelEnhanced />);
    
    const pinInput = screen.getByPlaceholderText('PIN (1234)');
    const verifyButton = screen.getByText('Verificar');
    
    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(verifyButton);
    
    // Should show verified state
    await waitFor(() => {
      expect(screen.getByText('PIN Verificado')).toBeInTheDocument();
    });
  });

  test('shows packages when PIN is verified', async () => {
    // Mock verified state
    render(<UsageControlPanelEnhanced />);
    
    // Simulate PIN verification
    const pinInput = screen.getByPlaceholderText('PIN (1234)');
    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Verificar'));
    
    await waitFor(() => {
      expect(screen.getByText('Paquetes de Usos Disponibles')).toBeInTheDocument();
    });
  });

  test('shows low usage alert when usage is low', () => {
    // Mock low usage data
    vi.mocked(useUsageControl).mockReturnValue({
      usageData: { usosRestantes: 3 },
      // ... other props
    });
    
    render(<UsageControlPanelEnhanced />);
    
    expect(screen.getByText('⚠️ Pocos usos restantes')).toBeInTheDocument();
  });

  test('shows no usage alert when usage is zero', () => {
    // Mock zero usage data
    vi.mocked(useUsageControl).mockReturnValue({
      usageData: { usosRestantes: 0 },
      // ... other props
    });
    
    render(<UsageControlPanelEnhanced />);
    
    expect(screen.getByText('🚫 Sin usos disponibles')).toBeInTheDocument();
  });
});