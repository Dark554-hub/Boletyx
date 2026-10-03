import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  StatCard,
  PageHeader,
  Pill,
  DataTable,
  TR,
  TD,
} from '../UI'

import {
  IconUsers,
  IconSchool,
  IconGrade,
  IconUser,
} from '../Icons'

export default function DatosAdmin({ user }) {
  const [alumnos, setAlumnos] = useState([])
  const [docentes, setDocentes] = useState([])
  const [grupos, setGrupos] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        alumnosResponse,
        docentesResponse,
        gruposResponse,
      ] = await Promise.all([
        supabase
          .from('alumnos')
          .select(`
            id,
            matricula,
            semestre,
            grupo,
            turno,

            perfiles (
              nombre,
              apellido
            ),

            inscripciones (
              id,

              grupos (
                id,
                nombre,
                semestre,
                turno,
                ciclo_escolar
              )
            )
          `)
          .order('id'),

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
          `)
          .order('id'),

        supabase
          .from('grupos')
          .select(`
            id,
            nombre,
            semestre,
            turno,
            ciclo_escolar,

            grupo_materias (
              id,

              materias (
                nombre
              ),

              docentes (
                numero_empleado,

                perfiles (
                  nombre,
                  apellido
                )
              )
            )
          `)
          .order('nombre'),
      ])

      if (alumnosResponse.error) {
        throw alumnosResponse.error
      }

      if (docentesResponse.error) {
        throw docentesResponse.error
      }

      if (gruposResponse.error) {
        throw gruposResponse.error
      }

      setAlumnos(alumnosResponse.data || [])
      setDocentes(docentesResponse.data || [])
      setGrupos(gruposResponse.data || [])
    } catch (err) {
      console.error(
        'Error cargando panel admin:',
        err
      )

      setError(
        'No se pudieron cargar los datos administrativos.'
      )
    } finally {
      setLoading(false)
    }
  }

  const obtenerPerfil = registro => {
    if (!registro?.perfiles) return null

    return Array.isArray(registro.perfiles)
      ? registro.perfiles[0]
      : registro.perfiles
  }

  const obtenerGrupoActual = alumno => {
    const inscripciones =
      alumno?.inscripciones || []

    if (inscripciones.length === 0) {
      return null
    }

    const inscripcion = inscripciones[0]

    return Array.isArray(inscripcion.grupos)
      ? inscripcion.grupos[0]
      : inscripcion.grupos
  }

  const formatearTurno = turno => {
    if (!turno) return '—'

    return (
      turno.charAt(0).toUpperCase() +
      turno.slice(1)
    )
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#506070' }}
      >
        Cargando panel administrativo...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Administración"
        subtitle={`Bienvenido, ${
          user?.nombre || 'Administrador'
        }`}
        action={
          <Pill variant="blue">
            Control escolar
          </Pill>
        }
      />

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={
            <IconUsers
              size={22}
              style={{ color: '#203A50' }}
            />
          }
          label="Alumnos"
          value={alumnos.length}
        />

        <StatCard
          icon={
            <IconUser
              size={22}
              style={{ color: '#203A50' }}
            />
          }
          label="Docentes"
          value={docentes.length}
        />

        <StatCard
          icon={
            <IconSchool
              size={22}
              style={{ color: '#203A50' }}
            />
          }
          label="Grupos"
          value={grupos.length}
        />

        <StatCard
          icon={
            <IconGrade
              size={22}
              style={{ color: '#203A50' }}
            />
          }
          label="Asignaciones"
          value={grupos.reduce(
            (total, grupo) =>
              total +
              (grupo.grupo_materias?.length || 0),
            0
          )}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Alumnos registrados
            </CardTitle>

            <CardSubtitle>
              Grupo actual e información académica
            </CardSubtitle>
          </div>

          <Pill variant="mint">
            {alumnos.length} alumnos
          </Pill>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Alumno',
            'Matrícula',
            'Semestre',
            'Grupo',
            'Turno',
          ]}
          rows={
            <>
              {alumnos.map((alumno, index) => {
                const perfil =
                  obtenerPerfil(alumno)

                const grupo =
                  obtenerGrupoActual(alumno)

                const nombreCompleto = perfil
                  ? `${perfil.nombre} ${perfil.apellido}`
                  : 'Sin nombre'

                return (
                  <TR key={alumno.id}>
                    <TD>{index + 1}</TD>

                    <TD className="font-semibold">
                      {nombreCompleto}
                    </TD>

                    <TD>
                      {alumno.matricula || '—'}
                    </TD>

                    <TD>
                      {grupo?.semestre ??
                        alumno.semestre ??
                        '—'}
                    </TD>

                    <TD>
                      {grupo?.nombre ||
                        alumno.grupo ||
                        '—'}
                    </TD>

                    <TD>
                      <Pill variant="default">
                        {formatearTurno(
                          grupo?.turno ||
                            alumno.turno
                        )}
                      </Pill>
                    </TD>
                  </TR>
                )
              })}

              {alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: '#8FA0AF' }}
                  >
                    No hay alumnos registrados.
                  </td>
                </tr>
              )}
            </>
          }
        />
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Docentes registrados
            </CardTitle>

            <CardSubtitle>
              Personal docente del sistema
            </CardSubtitle>
          </div>

          <Pill variant="blue">
            {docentes.length} docentes
          </Pill>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Docente',
            'N.º empleado',
            'Especialidad',
          ]}
          rows={
            <>
              {docentes.map(
                (docente, index) => {
                  const perfil =
                    obtenerPerfil(docente)

                  const nombre = perfil
                    ? `${perfil.nombre} ${perfil.apellido}`
                    : 'Sin nombre'

                  return (
                    <TR key={docente.id}>
                      <TD>{index + 1}</TD>

                      <TD className="font-semibold">
                        {nombre}
                      </TD>

                      <TD>
                        {docente.numero_empleado ||
                          '—'}
                      </TD>

                      <TD>
                        {docente.especialidad ||
                          '—'}
                      </TD>
                    </TR>
                  )
                }
              )}
            </>
          }
        />
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Grupos
            </CardTitle>

            <CardSubtitle>
              Grupos y materias asignadas
            </CardSubtitle>
          </div>

          <Pill variant="default">
            {grupos.length} grupos
          </Pill>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Grupo',
            'Semestre',
            'Turno',
            'Materias',
            'Ciclo',
          ]}
          rows={
            <>
              {grupos.map((grupo, index) => (
                <TR key={grupo.id}>
                  <TD>{index + 1}</TD>

                  <TD className="font-semibold">
                    {grupo.nombre}
                  </TD>

                  <TD>
                    {grupo.semestre ?? '—'}
                  </TD>

                  <TD>
                    {formatearTurno(
                      grupo.turno
                    )}
                  </TD>

                  <TD>
                    {grupo.grupo_materias
                      ?.length || 0}
                  </TD>

                  <TD>
                    {grupo.ciclo_escolar ||
                      '—'}
                  </TD>
                </TR>
              ))}
            </>
          }
        />
      </Card>
    </div>
  )
}