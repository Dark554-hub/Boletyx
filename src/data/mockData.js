// ============================================================
// BOLETYX — Mock Data (MVP sin base de datos)
// ============================================================

export const USERS = [
  // Alumnos
  {
    id: 'ALU001',
    role: 'alumno',
    nombre: 'Emilio García Martínez',
    matricula: '2024-ALU-001',
    email: 'emilio.garcia@boletyx.edu',
    password: '1234',
    grupo: '3°A',
    turno: 'Matutino',
    semestre: '5to Semestre',
    avatar: 'EG',
    tutorId: 'TUT001',
  },
  {
    id: 'ALU002',
    role: 'alumno',
    nombre: 'Valeria López Sánchez',
    matricula: '2024-ALU-002',
    email: 'valeria.lopez@boletyx.edu',
    password: '1234',
    grupo: '3°B',
    turno: 'Matutino',
    semestre: '5to Semestre',
    avatar: 'VL',
    tutorId: 'TUT002',
  },
  // Docentes
  {
    id: 'DOC001',
    role: 'docente',
    nombre: 'Prof. Roberto Hernández Luna',
    matricula: '2020-DOC-001',
    email: 'r.hernandez@boletyx.edu',
    password: '1234',
    especialidad: 'Matemáticas',
    avatar: 'RH',
  },
  {
    id: 'DOC002',
    role: 'docente',
    nombre: 'Prof. Ana Ramírez Torres',
    matricula: '2019-DOC-002',
    email: 'a.ramirez@boletyx.edu',
    password: '1234',
    especialidad: 'Química',
    avatar: 'AR',
  },
  
  // Administrador
{
  id: 'ADM001',
  role: 'admin',
  nombre: 'Administrador Boletyx',
  matricula: 'ADM-001',
  email: 'admin@boletyx.edu',
  password: '1234',
  avatar: 'AD',
},
];

export const MATERIAS_ALUMNO = {
  ALU001: [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. Roberto Hernández', calificaciones: [8.5, 9.0, 7.5, 9.5], promedio: 8.6, estado: 'regular' },
    { id: 2, nombre: 'Química', docente: 'Prof. Ana Ramírez', calificaciones: [7.0, 8.5, 9.0, 8.0], promedio: 8.1, estado: 'regular' },
    { id: 3, nombre: 'Historia Universal', docente: 'Prof. Luis Morales', calificaciones: [9.5, 9.0, 10.0, 9.5], promedio: 9.5, estado: 'excelente' },
    { id: 4, nombre: 'Inglés', docente: 'Prof. Diana Clark', calificaciones: [6.5, 7.0, 7.5, 8.0], promedio: 7.25, estado: 'regular' },
    { id: 5, nombre: 'Física', docente: 'Prof. Jorge Castillo', calificaciones: [8.0, 7.5, 8.5, 9.0], promedio: 8.25, estado: 'regular' },
    { id: 6, nombre: 'Español', docente: 'Prof. Carmen Vega', calificaciones: [9.0, 9.5, 9.0, 10.0], promedio: 9.38, estado: 'excelente' },
  ],
  ALU002: [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. Roberto Hernández', calificaciones: [7.5, 8.0, 8.5, 7.0], promedio: 7.75, estado: 'regular' },
    { id: 2, nombre: 'Química', docente: 'Prof. Ana Ramírez', calificaciones: [9.5, 10.0, 9.5, 9.0], promedio: 9.5, estado: 'excelente' },
    { id: 3, nombre: 'Historia Universal', docente: 'Prof. Luis Morales', calificaciones: [8.0, 7.5, 8.0, 8.5], promedio: 8.0, estado: 'regular' },
    { id: 4, nombre: 'Inglés', docente: 'Prof. Diana Clark', calificaciones: [9.0, 9.5, 10.0, 9.0], promedio: 9.38, estado: 'excelente' },
    { id: 5, nombre: 'Física', docente: 'Prof. Jorge Castillo', calificaciones: [7.0, 7.5, 6.5, 8.0], promedio: 7.25, estado: 'regular' },
    { id: 6, nombre: 'Español', docente: 'Prof. Carmen Vega', calificaciones: [8.5, 8.0, 8.5, 9.0], promedio: 8.5, estado: 'regular' },
  ],
};

export const HORARIO_ALUMNO = {
  ALU001: {
    Lunes:    ['Matemáticas', 'Matemáticas', 'Química', 'Inglés', 'Física', 'Español'],
    Martes:   ['Historia', 'Historia', 'Matemáticas', 'Química', 'Inglés', 'Ed. Física'],
    Miércoles:['Física', 'Física', 'Español', 'Historia', 'Matemáticas', 'Química'],
    Jueves:   ['Inglés', 'Inglés', 'Historia', 'Física', 'Español', 'Química'],
    Viernes:  ['Español', 'Química', 'Inglés', 'Matemáticas', 'Historia', 'Física'],
  },
  ALU002: {
    Lunes:    ['Química', 'Química', 'Inglés', 'Física', 'Historia', 'Matemáticas'],
    Martes:   ['Inglés', 'Inglés', 'Física', 'Español', 'Química', 'Historia'],
    Miércoles:['Matemáticas', 'Matemáticas', 'Historia', 'Química', 'Inglés', 'Ed. Física'],
    Jueves:   ['Español', 'Español', 'Química', 'Inglés', 'Matemáticas', 'Física'],
    Viernes:  ['Historia', 'Física', 'Español', 'Química', 'Matemáticas', 'Inglés'],
  },
};

export const HORAS = ['7:00–8:00', '8:00–9:00', '9:00–10:00', '10:00–11:00', '11:00–12:00', '12:00–13:00'];

export const TRAMITES = [
  { id: 1, tipo: 'Constancia de Estudios', estado: 'Listo', fecha: '2026-09-15', descripcion: 'Documento oficial con sello de la institución', icono: '📄' },
  { id: 2, tipo: 'Credencial Escolar', estado: 'En proceso', fecha: '2026-09-28', descripcion: 'Credencial con foto y código de barras', icono: '🪪' },
  { id: 3, tipo: 'Certificado Parcial', estado: 'Pendiente', fecha: '—', descripcion: 'Certificado de materias cursadas', icono: '📜' },
  { id: 4, tipo: 'Carta de Buena Conducta', estado: 'Listo', fecha: '2026-09-10', descripcion: 'Documento para trámites externos', icono: '⭐' },
];

export const EVENTOS_CALENDARIO = [
  { id: 1, titulo: 'Examen Parcial — Matemáticas', fecha: '2026-10-05', tipo: 'examen', color: '#e74c3c' },
  { id: 2, titulo: 'Entrega Proyecto Química', fecha: '2026-10-08', tipo: 'entrega', color: '#f39c12' },
  { id: 3, titulo: 'Semana Cultural', fecha: '2026-10-14', tipo: 'evento', color: '#27ae60' },
  { id: 4, titulo: 'Examen Parcial — Historia', fecha: '2026-10-12', tipo: 'examen', color: '#e74c3c' },
  { id: 5, titulo: 'Cierre de calificaciones', fecha: '2026-10-20', tipo: 'administrativo', color: '#203A50' },
  { id: 6, titulo: 'Día festivo — No hay clases', fecha: '2026-10-16', tipo: 'festivo', color: '#8e44ad' },
  { id: 7, titulo: 'Examen Parcial — Inglés', fecha: '2026-10-18', tipo: 'examen', color: '#e74c3c' },
  { id: 8, titulo: 'Reunión de padres', fecha: '2026-10-22', tipo: 'evento', color: '#27ae60' },
];

// Para docentes
export const GRUPOS_DOCENTE = {
  DOC001: [
    {
      id: 'G1', grupo: '3°A', materia: 'Matemáticas', turno: 'Matutino', alumnos: [
        { id: 'A01', nombre: 'Emilio García', p1: 8.5, p2: 9.0, p3: 7.5, p4: 9.5, promedio: 8.6, asistencias: 42, faltas: 3 },
        { id: 'A02', nombre: 'Sofía Ramos', p1: 7.0, p2: 8.0, p3: 9.5, p4: 8.0, promedio: 8.1, asistencias: 44, faltas: 1 },
        { id: 'A03', nombre: 'Diego Torres', p1: 6.0, p2: 6.5, p3: 7.0, p4: 7.5, promedio: 6.75, asistencias: 38, faltas: 7 },
        { id: 'A04', nombre: 'Laura Vega', p1: 9.5, p2: 10.0, p3: 9.5, p4: 10.0, promedio: 9.75, asistencias: 45, faltas: 0 },
        { id: 'A05', nombre: 'Carlos Núñez', p1: 5.5, p2: 6.0, p3: 6.5, p4: 7.0, promedio: 6.25, asistencias: 35, faltas: 10 },
      ],
    },
    {
      id: 'G2', grupo: '3°B', materia: 'Matemáticas', turno: 'Matutino', alumnos: [
        { id: 'A06', nombre: 'Valeria López', p1: 7.5, p2: 8.0, p3: 8.5, p4: 7.0, promedio: 7.75, asistencias: 43, faltas: 2 },
        { id: 'A07', nombre: 'Rodrigo Solis', p1: 9.0, p2: 9.5, p3: 8.5, p4: 9.0, promedio: 9.0, asistencias: 44, faltas: 1 },
        { id: 'A08', nombre: 'Fernanda Cruz', p1: 6.5, p2: 7.0, p3: 6.0, p4: 7.5, promedio: 6.75, asistencias: 40, faltas: 5 },
      ],
    },
  ],
  DOC002: [
    {
      id: 'G3', grupo: '3°A', materia: 'Química', turno: 'Matutino', alumnos: [
        { id: 'A01', nombre: 'Emilio García', p1: 7.0, p2: 8.5, p3: 9.0, p4: 8.0, promedio: 8.1, asistencias: 41, faltas: 4 },
        { id: 'A02', nombre: 'Sofía Ramos', p1: 8.5, p2: 9.0, p3: 8.0, p4: 9.5, promedio: 8.75, asistencias: 44, faltas: 1 },
        { id: 'A03', nombre: 'Diego Torres', p1: 7.5, p2: 7.0, p3: 8.0, p4: 7.5, promedio: 7.5, asistencias: 39, faltas: 6 },
        { id: 'A04', nombre: 'Laura Vega', p1: 9.0, p2: 9.5, p3: 10.0, p4: 9.5, promedio: 9.5, asistencias: 45, faltas: 0 },
      ],
    },
    {
      id: 'G4', grupo: '3°B', materia: 'Química', turno: 'Matutino', alumnos: [
        { id: 'A06', nombre: 'Valeria López', p1: 9.5, p2: 10.0, p3: 9.5, p4: 9.0, promedio: 9.5, asistencias: 43, faltas: 2 },
        { id: 'A07', nombre: 'Rodrigo Solis', p1: 8.0, p2: 8.5, p3: 7.5, p4: 9.0, promedio: 8.25, asistencias: 44, faltas: 1 },
        { id: 'A08', nombre: 'Fernanda Cruz', p1: 7.0, p2: 6.5, p3: 7.5, p4: 8.0, promedio: 7.25, asistencias: 42, faltas: 3 },
      ],
    },
  ],
};

export const AVISOS = [
  { id: 1, titulo: 'Cierre de calificaciones 1er parcial', cuerpo: 'Se recuerda que el cierre de calificaciones del 1er parcial es el 20 de octubre. Favor de ingresar todas las notas a tiempo.', fecha: '2026-09-29', tipo: 'importante' },
  { id: 2, titulo: 'Semana Cultural 14-18 Oct', cuerpo: 'Los grupos participarán en actividades culturales. Se suspenden clases normales esos días. Favor de coordinar con coordinación.', fecha: '2026-09-27', tipo: 'evento' },
  { id: 3, titulo: 'Reunión de padres — 22 Oct', cuerpo: 'Se cita a tutores a las 9:00am en el auditorio para entrega de calificaciones del primer parcial.', fecha: '2026-09-25', tipo: 'reunion' },
];
