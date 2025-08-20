# Analytics Services

Este directorio contiene los servicios especializados para analytics avanzados.

## Estructura

```
analytics/
├── AnalyticsService.js           # Servicio principal de analytics
├── PatientProgressService.js     # Servicio de progreso de pacientes
├── StatisticalService.js         # Servicio de cálculos estadísticos
├── ExportService.js              # Servicio de exportación mejorado
├── ReportSchedulerService.js     # Servicio de reportes programados
└── SystemMetricsService.js       # Servicio de métricas del sistema
```

## Integración

Estos servicios extienden el `DashboardService` existente y se integran con el hook `useDashboardData`.

## Funcionalidades

- Agregaciones temporales avanzadas
- Cálculos estadísticos complejos
- Análisis de progreso individual
- Exportación en múltiples formatos
- Programación de reportes automáticos
- Monitoreo de métricas del sistema