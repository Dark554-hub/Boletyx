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
              ciclo_escolar,
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
            `)
            .order('id'),
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
        console.error('Error cargando panel admin:', err)
        setError('No se pudieron cargar los datos administrativos.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

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
        subtitle={`Bienvenido, ${user?.nombre || 'Administrador'}`}
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

      {/* Estadísticas */}
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
          label="Registros académicos"
          value={alumnos.length + docentes.length}
        />
      </div>

      {/* Tabla de alumnos */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Alumnos registrados
            </CardTitle>

            <CardSubtitle>
              Información obtenida directamente desde Supabase
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
                const perfil = Array.isArray(alumno.perfiles)
                  ? alumno.perfiles[0]
                  : alumno.perfiles

                const nombreCompleto = perfil
                  ? `${perfil.nombre} ${perfil.apellido}`
                  : 'Sin nombre'

                return (
                  <TR key={alumno.id}>
                    <TD
                      style={{
                        color: '#8FA0AF',
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </TD>

                    <TD className="font-semibold">
                      {nombreCompleto}
                    </TD>

                    <TD>
                      {alumno.matricula || 'Sin matrícula'}
                    </TD>

                    <TD>
                      {alumno.semestre ?? '—'}
                    </TD>

                    <TD>
                      {alumno.grupo || '—'}
                    </TD>

                    <TD>
                      <Pill variant="default">
                        {alumno.turno || 'Sin turno'}
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

      {/* Tabla de docentes */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Docentes registrados
            </CardTitle>

            <CardSubtitle>
              Personal docente registrado en el sistema
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
              {docentes.map((docente, index) => {
                const perfil = Array.isArray(docente.perfiles)
                  ? docente.perfiles[0]
                  : docente.perfiles

                const nombreCompleto = perfil
                  ? `${perfil.nombre} ${perfil.apellido}`
                  : 'Sin nombre'

                return (
                  <TR key={docente.id}>
                    <TD
                      style={{
                        color: '#8FA0AF',
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </TD>

                    <TD className="font-semibold">
                      {nombreCompleto}
                    </TD>

                    <TD>
                      {docente.numero_empleado || '—'}
                    </TD>

                    <TD>
                      {docente.especialidad || '—'}
                    </TD>
                  </TR>
                )
              })}

              {docentes.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: '#8FA0AF' }}
                  >
                    No hay docentes registrados.
                  </td>
                </tr>
              )}
            </>
          }
        />
      </Card>

      {/* Resumen de grupos */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Grupos registrados
            </CardTitle>

            <CardSubtitle>
              Materias y docentes asignados actualmente
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
            'Materia',
            'Docente',
            'Ciclo escolar',
          ]}
          rows={
            <>
              {grupos.map((grupo, index) => {
                const materia = Array.isArray(grupo.materias)
                  ? grupo.materias[0]
                  : grupo.materias

                const docente = Array.isArray(grupo.docentes)
                  ? grupo.docentes[0]
                  : grupo.docentes

                const perfilDocente = Array.isArray(docente?.perfiles)
                  ? docente.perfiles[0]
                  : docente?.perfiles

                const nombreDocente = perfilDocente
                  ? `${perfilDocente.nombre} ${perfilDocente.apellido}`
                  : 'Sin docente'

                return (
                  <TR key={grupo.id}>
                    <TD
                      style={{
                        color: '#8FA0AF',
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </TD>

                    <TD className="font-semibold">
                      {grupo.nombre}
                    </TD>

                    <TD>
                      {materia?.nombre || 'Sin materia'}
                    </TD>

                    <TD>
                      {nombreDocente}
                    </TD>

                    <TD>
                      <Pill variant="blue">
                        {grupo.ciclo_escolar || 'Sin ciclo'}
                      </Pill>
                    </TD>
                  </TR>
                )
              })}

              {grupos.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: '#8FA0AF' }}
                  >
                    No hay grupos registrados.
                  </td>
                </tr>
              )}
            </>
          }
        />
      </Card>
    </div>
  )
}