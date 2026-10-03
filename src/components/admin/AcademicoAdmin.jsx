import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ArbolAcademico from './ArbolAcademico'
import CiclosAdmin from './CiclosAdmin'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  PageHeader,
  Pill,
  DataTable,
  TR,
  TD,
  BtnPrimary,
} from '../UI'

export default function AcademicoAdmin() {
  // ==================================================
  // DATOS
  // ==================================================

  const [materias, setMaterias] = useState([])
  const [grupos, setGrupos] = useState([])
  const [docentes, setDocentes] = useState([])
  const [areas, setAreas] = useState([])
  const [ciclos, setCiclos] = useState([])
  const [asignaciones, setAsignaciones] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // ==================================================
  // FORMULARIO MATERIA
  // ==================================================

  const [materiaNombre, setMateriaNombre] = useState('')
  const [materiaSemestre, setMateriaSemestre] = useState('')
  const [materiaAreaId, setMateriaAreaId] = useState('')

  // ==================================================
  // FORMULARIO GRUPO
  // ==================================================

  const [grupoNombre, setGrupoNombre] = useState('')
  const [grupoSemestre, setGrupoSemestre] = useState('')
  const [grupoTurno, setGrupoTurno] = useState('')
  const [grupoAreaId, setGrupoAreaId] = useState('')
  const [grupoCicloId, setGrupoCicloId] = useState('')

  // ==================================================
  // FORMULARIO ASIGNACIÓN
  // ==================================================

  const [asignacionGrupoId, setAsignacionGrupoId] =
    useState('')

  const [asignacionMateriaId, setAsignacionMateriaId] =
    useState('')

  const [asignacionDocenteId, setAsignacionDocenteId] =
    useState('')

  // ==================================================
  // CARGAR
  // ==================================================

  useEffect(() => {
    cargarDatos()
  }, [])

  // ==================================================
  // CARGAR DATOS
  // ==================================================

  const cargarDatos = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        materiasResponse,
        gruposResponse,
        docentesResponse,
        areasResponse,
        ciclosResponse,
        asignacionesResponse,
      ] = await Promise.all([
        // ==========================================
        // MATERIAS
        // ==========================================

        supabase
          .from('materias')
          .select(`
            id,
            nombre,
            semestre,
            area_id,

            areas (
              id,
              nombre
            )
          `)
          .order('nombre'),

        // ==========================================
        // GRUPOS
        // ==========================================

        supabase
          .from('grupos')
          .select(`
            id,
            nombre,
            semestre,
            turno,
            ciclo_id,
            ciclo_escolar,
            area_id,

            areas (
              id,
              nombre
            ),

            ciclos_escolares (
              id,
              nombre,
              activo
            )
          `)
          .order('nombre'),

        // ==========================================
        // DOCENTES
        // ==========================================

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

        // ==========================================
        // ÁREAS
        // ==========================================

        supabase
          .from('areas')
          .select(`
            id,
            nombre
          `)
          .order('id'),

        // ==========================================
        // CICLOS
        // ==========================================

        supabase
          .from('ciclos_escolares')
          .select(`
            id,
            nombre,
            fecha_inicio,
            fecha_fin,
            activo
          `)
          .order('nombre', {
            ascending: false,
          }),

        // ==========================================
        // ASIGNACIONES
        // ==========================================

        supabase
          .from('grupo_materias')
          .select(`
            id,
            grupo_id,
            materia_id,
            docente_id,

            grupos (
              id,
              nombre,
              semestre,
              turno,
              ciclo_id,
              ciclo_escolar,
              area_id
            ),

            materias (
              id,
              nombre,
              semestre,
              area_id
            ),

            docentes (
              id,
              numero_empleado,

              perfiles (
                nombre,
                apellido
              )
            )
          `)
          .order('id'),
      ])

      // ==================================================
      // ERRORES
      // ==================================================

      if (materiasResponse.error) {
        throw materiasResponse.error
      }

      if (gruposResponse.error) {
        throw gruposResponse.error
      }

      if (docentesResponse.error) {
        throw docentesResponse.error
      }

      if (areasResponse.error) {
        throw areasResponse.error
      }

      if (ciclosResponse.error) {
        throw ciclosResponse.error
      }

      if (asignacionesResponse.error) {
        throw asignacionesResponse.error
      }

      // ==================================================
      // GUARDAR DATOS
      // ==================================================

      setMaterias(materiasResponse.data || [])
      setGrupos(gruposResponse.data || [])
      setDocentes(docentesResponse.data || [])
      setAreas(areasResponse.data || [])
      setCiclos(ciclosResponse.data || [])
      setAsignaciones(asignacionesResponse.data || [])

      // ==================================================
      // CICLO ACTIVO AUTOMÁTICO
      // ==================================================

      const cicloActivo =
        (ciclosResponse.data || []).find(
          ciclo => ciclo.activo
        )

      if (cicloActivo) {
        setGrupoCicloId(actual =>
          actual || String(cicloActivo.id)
        )
      }
    } catch (err) {
      console.error(
        'Error cargando gestión académica:',
        err
      )

      setError(
        err?.message ||
          'No se pudo cargar la información académica.'
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

  const obtenerPerfilDocente = docente => {
    if (!docente) return null

    return obtenerRelacion(
      docente.perfiles
    )
  }

  const formatearTurno = turno => {
    if (!turno) return '—'

    return (
      turno.charAt(0).toUpperCase() +
      turno.slice(1)
    )
  }

  // ==================================================
  // GRUPO SELECCIONADO
  // ==================================================

  const grupoSeleccionado = useMemo(() => {
    if (!asignacionGrupoId) {
      return null
    }

    return grupos.find(
      grupo =>
        String(grupo.id) ===
        String(asignacionGrupoId)
    )
  }, [
    asignacionGrupoId,
    grupos,
  ])

  // ==================================================
  // MATERIAS COMPATIBLES
  // ==================================================
  //
  // Deben coincidir:
  //
  // - semestre
  // - área
  //
  // ==================================================

  const materiasDisponibles = useMemo(() => {
    if (!grupoSeleccionado) {
      return materias
    }

    return materias.filter(materia => {
      const mismoSemestre =
        Number(materia.semestre) ===
        Number(
          grupoSeleccionado.semestre
        )

      const mismaArea =
        String(materia.area_id) ===
        String(
          grupoSeleccionado.area_id
        )

      return (
        mismoSemestre &&
        mismaArea
      )
    })
  }, [
    materias,
    grupoSeleccionado,
  ])

  // ==================================================
  // CREAR MATERIA
  // ==================================================

  const crearMateria = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')

    if (
      !materiaNombre.trim() ||
      !materiaSemestre ||
      !materiaAreaId
    ) {
      setError(
        'Completa el nombre, semestre y área de la materia.'
      )

      return
    }

    const semestre =
      Number(materiaSemestre)

    if (
      ![1, 3, 5].includes(
        semestre
      )
    ) {
      setError(
        'El semestre debe ser 1, 3 o 5.'
      )

      return
    }

    setSaving(true)

    try {
      const {
        error: insertError,
      } = await supabase
        .from('materias')
        .insert({
          nombre:
            materiaNombre.trim(),

          semestre,

          area_id:
            Number(
              materiaAreaId
            ),
        })

      if (insertError) {
        throw insertError
      }

      setMateriaNombre('')
      setMateriaSemestre('')
      setMateriaAreaId('')

      setMensaje(
        'Materia creada correctamente.'
      )

      await cargarDatos()
    } catch (err) {
      console.error(
        'Error creando materia:',
        err
      )

      setError(
        err?.message ||
          'No se pudo crear la materia.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==================================================
  // CREAR GRUPO
  // ==================================================

  const crearGrupo = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')

    if (
      !grupoNombre.trim() ||
      !grupoSemestre ||
      !grupoTurno ||
      !grupoAreaId ||
      !grupoCicloId
    ) {
      setError(
        'Completa todos los datos del grupo.'
      )

      return
    }

    const semestre =
      Number(grupoSemestre)

    if (
      ![1, 3, 5].includes(
        semestre
      )
    ) {
      setError(
        'El semestre debe ser 1, 3 o 5.'
      )

      return
    }

    setSaving(true)

    try {
      const {
        error: insertError,
      } = await supabase
        .from('grupos')
        .insert({
          nombre:
            grupoNombre
              .trim()
              .toUpperCase(),

          semestre,

          turno:
            grupoTurno,

          area_id:
            Number(
              grupoAreaId
            ),

          ciclo_id:
            Number(
              grupoCicloId
            ),
        })

      if (insertError) {
        throw insertError
      }

      setGrupoNombre('')
      setGrupoSemestre('')
      setGrupoTurno('')
      setGrupoAreaId('')

      // El ciclo NO se limpia.
      // Conservamos el ciclo activo seleccionado.

      setMensaje(
        'Grupo creado correctamente.'
      )

      await cargarDatos()
    } catch (err) {
      console.error(
        'Error creando grupo:',
        err
      )

      if (
        err?.code === '23505'
      ) {
        setError(
          'Ya existe un grupo con ese nombre en el mismo ciclo escolar.'
        )
      } else {
        setError(
          err?.message ||
            'No se pudo crear el grupo.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // ==================================================
  // CREAR ASIGNACIÓN
  // ==================================================

  const crearAsignacion = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')

    if (
      !asignacionGrupoId ||
      !asignacionMateriaId ||
      !asignacionDocenteId
    ) {
      setError(
        'Selecciona grupo, materia y docente.'
      )

      return
    }

    const yaExiste =
      asignaciones.some(
        asignacion =>
          String(
            asignacion.grupo_id
          ) ===
            String(
              asignacionGrupoId
            ) &&
          String(
            asignacion.materia_id
          ) ===
            String(
              asignacionMateriaId
            )
      )

    if (yaExiste) {
      setError(
        'Esta materia ya está asignada a ese grupo.'
      )

      return
    }

    setSaving(true)

    try {
      const {
        error: insertError,
      } = await supabase
        .from('grupo_materias')
        .insert({
          grupo_id:
            Number(
              asignacionGrupoId
            ),

          materia_id:
            Number(
              asignacionMateriaId
            ),

          docente_id:
            Number(
              asignacionDocenteId
            ),
        })

      if (insertError) {
        throw insertError
      }

      setAsignacionMateriaId('')
      setAsignacionDocenteId('')

      setMensaje(
        'Materia y docente asignados correctamente.'
      )

      await cargarDatos()
    } catch (err) {
      console.error(
        'Error creando asignación:',
        err
      )

      if (
        err?.code === '23505'
      ) {
        setError(
          'Esta materia ya está asignada al grupo.'
        )
      } else {
        setError(
          err?.message ||
            'No se pudo crear la asignación.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // ==================================================
  // ELIMINAR ASIGNACIÓN
  // ==================================================

  const eliminarAsignacion = async id => {
    const confirmar =
      window.confirm(
        '¿Deseas eliminar esta asignación académica?'
      )

    if (!confirmar) {
      return
    }

    setError('')
    setMensaje('')

    try {
      const {
        error: deleteError,
      } = await supabase
        .from('grupo_materias')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setMensaje(
        'Asignación eliminada correctamente.'
      )

      await cargarDatos()
    } catch (err) {
      console.error(
        'Error eliminando asignación:',
        err
      )

      setError(
        err?.message ||
          'No se pudo eliminar la asignación.'
      )
    }
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
        Cargando gestión académica...
      </div>
    )
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión académica"
        subtitle="Administra materias, grupos y asignaciones docentes"
        action={
          <Pill variant="blue">
            {asignaciones.length}{' '}
            asignaciones
          </Pill>
        }
      />

      {/* ===============================================
          MENSAJE
      =============================================== */}

      {mensaje && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background:
              '#dcfce7',

            border:
              '1px solid #86efac',

            color:
              '#166534',
          }}
        >
          {mensaje}
        </div>
      )}

      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background:
              '#fee2e2',

            border:
              '1px solid #fca5a5',

            color:
              '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* ===============================================
          NUEVA MATERIA
      =============================================== */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Nueva materia
            </CardTitle>

            <CardSubtitle>
              Registra una materia por semestre y área académica
            </CardSubtitle>
          </div>

          <Pill variant="mint">
            {materias.length}{' '}
            materias
          </Pill>
        </CardHeader>

        <form
          onSubmit={crearMateria}
          className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* NOMBRE */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Nombre
            </label>

            <input
              value={
                materiaNombre
              }
              onChange={e =>
                setMateriaNombre(
                  e.target.value
                )
              }
              placeholder="Ej. Matemáticas I"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            />
          </div>

          {/* SEMESTRE */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Semestre
            </label>

            <select
              value={
                materiaSemestre
              }
              onChange={e =>
                setMateriaSemestre(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona
              </option>

              <option value="1">
                1°
              </option>

              <option value="3">
                3°
              </option>

              <option value="5">
                5°
              </option>
            </select>
          </div>

          {/* ÁREA */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Área
            </label>

            <select
              value={
                materiaAreaId
              }
              onChange={e =>
                setMateriaAreaId(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona un área
              </option>

              {areas.map(
                area => (
                  <option
                    key={area.id}
                    value={area.id}
                  >
                    {area.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {/* BOTÓN */}

          <div className="flex items-end">
            <BtnPrimary
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Crear materia'}
            </BtnPrimary>
          </div>
        </form>
      </Card>

      {/* ===============================================
          NUEVO GRUPO
      =============================================== */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Nuevo grupo
            </CardTitle>

            <CardSubtitle>
              Crea un grupo por semestre, turno, área y ciclo escolar
            </CardSubtitle>
          </div>

          <Pill variant="blue">
            {grupos.length}{' '}
            grupos
          </Pill>
        </CardHeader>

        <form
          onSubmit={crearGrupo}
          className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* GRUPO */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Grupo
            </label>

            <input
              value={
                grupoNombre
              }
              onChange={e =>
                setGrupoNombre(
                  e.target.value
                )
              }
              placeholder="Ej. 3A"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            />
          </div>

          {/* SEMESTRE */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Semestre
            </label>

            <select
              value={
                grupoSemestre
              }
              onChange={e =>
                setGrupoSemestre(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona
              </option>

              <option value="1">
                1°
              </option>

              <option value="3">
                3°
              </option>

              <option value="5">
                5°
              </option>
            </select>
          </div>

          {/* TURNO */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Turno
            </label>

            <select
              value={
                grupoTurno
              }
              onChange={e =>
                setGrupoTurno(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona
              </option>

              <option value="matutino">
                Matutino
              </option>

              <option value="vespertino">
                Vespertino
              </option>
            </select>
          </div>

          {/* ÁREA */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Área
            </label>

            <select
              value={
                grupoAreaId
              }
              onChange={e =>
                setGrupoAreaId(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona
              </option>

              {areas.map(
                area => (
                  <option
                    key={area.id}
                    value={area.id}
                  >
                    {area.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {/* CICLO */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Ciclo escolar
            </label>

            <select
              value={
                grupoCicloId
              }
              onChange={e =>
                setGrupoCicloId(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona
              </option>

              {ciclos.map(
                ciclo => (
                  <option
                    key={ciclo.id}
                    value={ciclo.id}
                  >
                    {ciclo.nombre}
                    {ciclo.activo
                      ? ' · Activo'
                      : ''}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <BtnPrimary
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Crear grupo'}
            </BtnPrimary>
          </div>
        </form>
      </Card>

      {/* ===============================================
          ASIGNAR MATERIA
      =============================================== */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Asignar materia
            </CardTitle>

            <CardSubtitle>
              Relaciona grupo, materia y docente
            </CardSubtitle>
          </div>
        </CardHeader>

        <form
          onSubmit={crearAsignacion}
          className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* GRUPO */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Grupo
            </label>

            <select
              value={
                asignacionGrupoId
              }
              onChange={e => {
                setAsignacionGrupoId(
                  e.target.value
                )

                setAsignacionMateriaId(
                  ''
                )
              }}
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona un grupo
              </option>

              {grupos.map(
                grupo => (
                  <option
                    key={grupo.id}
                    value={grupo.id}
                  >
                    {grupo.nombre}
                    {' · '}
                    {grupo.semestre}°
                    {' · '}
                    {formatearTurno(
                      grupo.turno
                    )}
                    {' · '}
                    {grupo.ciclo_escolar}
                  </option>
                )
              )}
            </select>
          </div>

          {/* MATERIA */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Materia
            </label>

            <select
              value={
                asignacionMateriaId
              }
              onChange={e =>
                setAsignacionMateriaId(
                  e.target.value
                )
              }
              disabled={
                !asignacionGrupoId
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none disabled:opacity-50"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                {asignacionGrupoId
                  ? 'Selecciona una materia'
                  : 'Primero selecciona un grupo'}
              </option>

              {materiasDisponibles.map(
                materia => (
                  <option
                    key={
                      materia.id
                    }
                    value={
                      materia.id
                    }
                  >
                    {materia.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {/* DOCENTE */}

          <div>
            <label className="block text-xs font-bold mb-2">
              Docente
            </label>

            <select
              value={
                asignacionDocenteId
              }
              onChange={e =>
                setAsignacionDocenteId(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            >
              <option value="">
                Selecciona un docente
              </option>

              {docentes.map(
                docente => {
                  const perfil =
                    obtenerPerfilDocente(
                      docente
                    )

                  return (
                    <option
                      key={
                        docente.id
                      }
                      value={
                        docente.id
                      }
                    >
                      {perfil
                        ? `${perfil.nombre} ${perfil.apellido}`
                        : docente.numero_empleado}
                    </option>
                  )
                }
              )}
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <BtnPrimary
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Crear asignación'}
            </BtnPrimary>
          </div>
        </form>
      </Card>

      {/* ===============================================
          ASIGNACIONES ACTUALES
      =============================================== */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Asignaciones actuales
            </CardTitle>

            <CardSubtitle>
              Materias y docentes por grupo
            </CardSubtitle>

            <CiclosAdmin />

            <ArbolAcademico />

          </div>

          <Pill variant="default">
            {asignaciones.length}
          </Pill>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Grupo',
            'Materia',
            'Semestre',
            'Docente',
            'Ciclo',
            'Acción',
          ]}
          rows={
            <>
              {asignaciones.map(
                (
                  asignacion,
                  index
                ) => {
                  const grupo =
                    obtenerRelacion(
                      asignacion.grupos
                    )

                  const materia =
                    obtenerRelacion(
                      asignacion.materias
                    )

                  const docente =
                    obtenerRelacion(
                      asignacion.docentes
                    )

                  const perfil =
                    obtenerPerfilDocente(
                      docente
                    )

                  return (
                    <TR
                      key={
                        asignacion.id
                      }
                    >
                      <TD>
                        {index + 1}
                      </TD>

                      <TD>
                        <Pill variant="blue">
                          {grupo?.nombre ||
                            '—'}
                        </Pill>
                      </TD>

                      <TD className="font-semibold">
                        {materia?.nombre ||
                          '—'}
                      </TD>

                      <TD>
                        {materia?.semestre ??
                          grupo?.semestre ??
                          '—'}
                      </TD>

                      <TD>
                        {perfil
                          ? `${perfil.nombre} ${perfil.apellido}`
                          : 'Sin docente'}
                      </TD>

                      <TD>
                        {grupo?.ciclo_escolar ||
                          '—'}
                      </TD>

                      <TD>
                        <button
                          type="button"
                          onClick={() =>
                            eliminarAsignacion(
                              asignacion.id
                            )
                          }
                          className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                          style={{
                            background:
                              '#fee2e2',

                            border:
                              '1px solid #fecaca',

                            color:
                              '#991b1b',
                          }}
                        >
                          Eliminar
                        </button>
                      </TD>
                    </TR>
                  )
                }
              )}

              {asignaciones.length ===
                0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    No hay asignaciones registradas.
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