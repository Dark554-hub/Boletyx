import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  InfoGrid,
  StatCard,
  BtnPrimary,
  Pill,
} from '../UI'

import {
  IconChart,
  IconUser,
  IconAlert,
  IconSchool,
  IconDownload,
} from '../Icons'

export default function DatosCoordinador({ user }) {
  const [docentes, setDocentes] = useState([])
  const [grupos, setGrupos] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [calificaciones, setCalificaciones] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  // ==================================================
  // CARGAR DATOS REALES
  // ==================================================

  const cargarDatos = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        docentesResponse,
        gruposResponse,
        alumnosResponse,
        calificacionesResponse,
      ] = await Promise.all([
        supabase
          .from('docentes')
          .select(`
            id,
            numero_empleado,
            especialidad,

            perfiles (
              nombre,
              apellido
            )
          `),

        supabase
          .from('grupos')
          .select(`
            id,
            nombre,
            semestre,
            turno,
            ciclo_escolar,

            grupo_materias (
              id
            )
          `),

        supabase
          .from('alumnos')
          .select(`
            id,
            matricula,

            perfiles (
              nombre,
              apellido
            )
          `),

        supabase
          .from('calificaciones')
          .select(`
            id,
            promedio,
            inscripcion_id,

            inscripciones (
              alumno_id
            )
          `),
      ])

      if (docentesResponse.error) {
        throw docentesResponse.error
      }

      if (gruposResponse.error) {
        throw gruposResponse.error
      }

      if (alumnosResponse.error) {
        throw alumnosResponse.error
      }

      if (calificacionesResponse.error) {
        throw calificacionesResponse.error
      }

      setDocentes(docentesResponse.data || [])
      setGrupos(gruposResponse.data || [])
      setAlumnos(alumnosResponse.data || [])
      setCalificaciones(
        calificacionesResponse.data || []
      )
    } catch (err) {
      console.error(
        'Error cargando coordinación:',
        err
      )

      setError(
        err?.message ||
          'No se pudo cargar la información de coordinación.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==================================================
  // HELPERS
  // ==================================================

  const obtenerRelacion = relacion => {
    if (!relacion) return null

    return Array.isArray(relacion)
      ? relacion[0]
      : relacion
  }

  // ==================================================
  // PROMEDIO GENERAL
  // ==================================================

  const promedioGeneral = useMemo(() => {
    const promedios = calificaciones
      .map(calificacion =>
        Number(calificacion.promedio)
      )
      .filter(
        promedio =>
          Number.isFinite(promedio)
      )

    if (promedios.length === 0) {
      return 0
    }

    const total = promedios.reduce(
      (acumulado, promedio) =>
        acumulado + promedio,
      0
    )

    return total / promedios.length
  }, [calificaciones])

  // ==================================================
  // ALUMNOS EN RIESGO
  // ==================================================
  //
  // Consideramos alumno en riesgo si tiene al menos
  // una materia con promedio menor a 7.
  // ==================================================

  const alumnosEnRiesgo = useMemo(() => {
    const ids = new Set()

    calificaciones.forEach(calificacion => {
      const promedio =
        Number(calificacion.promedio)

      if (
        Number.isFinite(promedio) &&
        promedio < 7
      ) {
        const inscripcion =
          obtenerRelacion(
            calificacion.inscripciones
          )

        if (inscripcion?.alumno_id) {
          ids.add(inscripcion.alumno_id)
        }
      }
    })

    return ids.size
  }, [calificaciones])

  // ==================================================
  // ASIGNACIONES
  // ==================================================

  const totalAsignaciones = useMemo(() => {
    return grupos.reduce(
      (total, grupo) =>
        total +
        (grupo.grupo_materias?.length || 0),
      0
    )
  }, [grupos])

  // ==================================================
  // GENERAR REPORTE PDF
  // ==================================================

  const generarReporte = () => {
    const pdf = new jsPDF()

    pdf.setFontSize(18)

    pdf.text(
      'Boletyx - Reporte Global',
      14,
      18
    )

    pdf.setFontSize(11)

    pdf.text(
      `Coordinador: ${
        user?.nombre || 'Coordinador'
      }`,
      14,
      28
    )

    pdf.text(
      `Fecha: ${new Date().toLocaleDateString(
        'es-MX'
      )}`,
      14,
      35
    )

    autoTable(pdf, {
      startY: 45,

      head: [
        [
          'Indicador',
          'Valor',
        ],
      ],

      body: [
        [
          'Docentes registrados',
          String(docentes.length),
        ],

        [
          'Alumnos registrados',
          String(alumnos.length),
        ],

        [
          'Grupos',
          String(grupos.length),
        ],

        [
          'Asignaciones académicas',
          String(totalAsignaciones),
        ],

        [
          'Promedio general',
          promedioGeneral.toFixed(2),
        ],

        [
          'Alumnos en riesgo',
          String(alumnosEnRiesgo),
        ],
      ],
    })

    pdf.save(
      'reporte-global-boletyx.pdf'
    )
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando coordinación académica...
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Coordinación Académica"
        subtitle="Supervisión global y analítica escolar"
        action={
          <BtnPrimary
            onClick={generarReporte}
          >
            <IconDownload size={15} />
            Generar Reporte Global
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#fee2e2',
            border:
              '1px solid #fecaca',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* KPIs */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <IconUser
              size={22}
              style={{
                color: '#3b82f6',
              }}
            />
          }
          label="Docentes registrados"
          value={docentes.length}
        />

        <StatCard
          icon={
            <IconChart
              size={22}
              style={{
                color: '#16a34a',
              }}
            />
          }
          label="Promedio General"
          value={
            promedioGeneral > 0
              ? promedioGeneral.toFixed(2)
              : '—'
          }
          valueColor="#16a34a"
        />

        <StatCard
          icon={
            <IconAlert
              size={22}
              style={{
                color: '#dc2626',
              }}
            />
          }
          label="Alumnos en Riesgo"
          value={alumnosEnRiesgo}
          valueColor="#dc2626"
        />

        <StatCard
          icon={
            <IconSchool
              size={22}
              style={{
                color: '#8b5cf6',
              }}
            />
          }
          label="Grupos"
          value={grupos.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PERFIL */}

        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                Perfil del coordinador
              </CardTitle>

              <CardSubtitle>
                Información de la cuenta actual
              </CardSubtitle>
            </div>

            <Pill variant="blue">
              Coordinador
            </Pill>
          </CardHeader>

          <CardBody>
            <InfoGrid
              fields={[
                {
                  label: 'Nombre',
                  value:
                    user?.nombre ||
                    '—',
                },
                {
                  label: 'Correo',
                  value:
                    user?.email ||
                    '—',
                },
                {
                  label: 'Rol',
                  value:
                    'Coordinador',
                },
                {
                  label: 'Sistema',
                  value:
                    'Control Escolar',
                },
              ]}
            />
          </CardBody>
        </Card>

        {/* RESUMEN */}

        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                Resumen académico
              </CardTitle>

              <CardSubtitle>
                Información calculada desde Supabase
              </CardSubtitle>
            </div>
          </CardHeader>

          <CardBody>
            <InfoGrid
              fields={[
                {
                  label: 'Alumnos',
                  value:
                    alumnos.length,
                },
                {
                  label: 'Grupos',
                  value:
                    grupos.length,
                },
                {
                  label: 'Asignaciones',
                  value:
                    totalAsignaciones,
                },
                {
                  label: 'Calificaciones',
                  value:
                    calificaciones.length,
                },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}