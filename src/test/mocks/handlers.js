import { http, HttpResponse } from 'msw';

/**
 * Handlers de MSW para interceptar llamadas HTTP en tests
 * Simula las respuestas de la API de Supabase y otros servicios
 */

// Datos de prueba
const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@bat7.test',
    nombre: 'Admin',
    apellido: 'Test',
    tipo_usuario: 'administrador',
    rol: 'administrador',
    documento: '12345678',
    telefono: '+1234567890',
    fechaNacimiento: '1990-01-01',
    activo: true
  },
  {
    id: 'user-2',
    email: 'psicologo@bat7.test',
    nombre: 'Psicólogo',
    apellido: 'Test',
    tipo_usuario: 'psicologo',
    rol: 'psicologo',
    documento: '87654321',
    telefono: '+0987654321',
    fechaNacimiento: '1985-05-15',
    activo: true
  },
  {
    id: 'user-3',
    email: 'candidato@bat7.test',
    nombre: 'Candidato',
    apellido: 'Test',
    tipo_usuario: 'estudiante',
    rol: 'estudiante',
    documento: '11223344',
    telefono: '+1122334455',
    fechaNacimiento: '2000-12-25',
    activo: true
  }
];

const mockQuestionnaires = [
  {
    id: 'questionnaire-1',
    title: 'BAT-7 Evaluación Verbal',
    description: 'Evaluación de aptitudes verbales y comprensión lectora',
    duration: 45,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: '¿Cuál es el sinónimo más apropiado para la palabra "perspicaz"?',
        options: [
          { id: 'a', text: 'Confuso' },
          { id: 'b', text: 'Astuto' },
          { id: 'c', text: 'Lento' },
          { id: 'd', text: 'Descuidado' }
        ],
        correctAnswer: 'b',
        difficulty: 'medium'
      }
    ],
    category: 'Aptitud Verbal',
    difficulty: 'medium',
    active: true
  }
];

const mockReports = [
  {
    id: 'report-1',
    title: 'Evaluación BAT-7 - Test User',
    type: 'individual',
    candidateName: 'Test User',
    candidateId: 'user-3',
    psychologistName: 'Psicólogo Test',
    psychologistId: 'user-2',
    questionnaireName: 'BAT-7 Evaluación Verbal',
    questionnaireId: 'questionnaire-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'completed',
    score: 78,
    grade: 'B+',
    tags: ['verbal', 'aptitud', 'individual'],
    fileSize: '2.4 MB',
    format: 'PDF',
    shared: false
  }
];

export const handlers = [
  // Auth endpoints
  http.post('*/auth/v1/token', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;
    
    // Simular autenticación
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'Test123!') {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }
    });
  }),

  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString()
    });
  }),

  // Usuarios endpoints
  http.get('*/rest/v1/usuarios', ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const documento = url.searchParams.get('documento');
    
    let users = mockUsers;
    
    if (email) {
      users = users.filter(u => u.email === email);
    }
    
    if (documento) {
      users = users.filter(u => u.documento === documento);
    }
    
    return HttpResponse.json(users);
  }),

  http.post('*/rest/v1/usuarios', async ({ request }) => {
    const body = await request.json();
    const newUser = {
      id: `user-${Date.now()}`,
      ...body,
      activo: true,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.patch('*/rest/v1/usuarios', async ({ request }) => {
    const body = await request.json();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...body };
    
    return HttpResponse.json(mockUsers[userIndex]);
  }),

  // Cuestionarios endpoints
  http.get('*/rest/v1/cuestionarios', () => {
    return HttpResponse.json(mockQuestionnaires);
  }),

  http.get('*/rest/v1/cuestionarios/:id', ({ params }) => {
    const questionnaire = mockQuestionnaires.find(q => q.id === params.id);
    
    if (!questionnaire) {
      return HttpResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(questionnaire);
  }),

  http.post('*/rest/v1/cuestionarios', async ({ request }) => {
    const body = await request.json();
    const newQuestionnaire = {
      id: `questionnaire-${Date.now()}`,
      ...body,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    mockQuestionnaires.push(newQuestionnaire);
    
    return HttpResponse.json(newQuestionnaire, { status: 201 });
  }),

  // Respuestas endpoints
  http.post('*/rest/v1/respuestas', async ({ request }) => {
    const body = await request.json();
    const newResponse = {
      id: `response-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    return HttpResponse.json(newResponse, { status: 201 });
  }),

  http.get('*/rest/v1/respuestas', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const questionnaireId = url.searchParams.get('questionnaireId');
    
    // Simular respuestas
    const responses = [
      {
        id: 'response-1',
        userId: userId || 'user-3',
        questionnaireId: questionnaireId || 'questionnaire-1',
        answers: { '1': 'b' },
        score: 78,
        completedAt: new Date().toISOString()
      }
    ];
    
    return HttpResponse.json(responses);
  }),

  // Informes endpoints
  http.get('*/rest/v1/informes', () => {
    return HttpResponse.json(mockReports);
  }),

  http.get('*/rest/v1/informes/:id', ({ params }) => {
    const report = mockReports.find(r => r.id === params.id);
    
    if (!report) {
      return HttpResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(report);
  }),

  http.post('*/rest/v1/informes', async ({ request }) => {
    const body = await request.json();
    const newReport = {
      id: `report-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    mockReports.push(newReport);
    
    return HttpResponse.json(newReport, { status: 201 });
  }),

  // Instituciones endpoints
  http.get('*/rest/v1/instituciones', () => {
    return HttpResponse.json([
      {
        id: 'inst-1',
        nombre: 'Universidad Test',
        tipo: 'universidad',
        activa: true
      }
    ]);
  }),

  // Endpoints de archivos/storage
  http.post('*/storage/v1/object/*', () => {
    return HttpResponse.json({
      Key: 'test-file.pdf',
      ETag: 'test-etag'
    });
  }),

  http.get('*/storage/v1/object/sign/*', () => {
    return HttpResponse.json({
      signedURL: 'https://example.com/signed-url'
    });
  }),

  // Fallback para requests no manejados
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { error: 'Not implemented in mock' },
      { status: 501 }
    );
  })
];
