import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  Pill,
} from '../UI'

// =====================================================
// COMPONENTE RECURSIVO
// =====================================================
//
// Este componente se llama a sí mismo para recorrer:
//
// Ciclo
//   → Área
//      → Grupo
//         → Materia
//
// El caso base ocurre cuando nodo.hijos está vacío.
// =====================================================

function NodoAcademico({
  nodo,
  nivel = 0,
}) {
  const [abierto, setAbierto] =
    useState(true)

  const tieneHijos =
    Array.isArray(nodo.hijos) &&
    nodo.hijos.length > 0

  const obtenerEstilo = () => {
    switch (nodo.tipo) {
      case 'ciclo':
        return {
          background: '#203A50',
          color: '#FFFFFF',
          border: '1px solid #203A50',
        }

      case 'area':
        return {
          background: '#EAF1F7',
          color: '#203A50',
          border: '1px solid #D7E2EC',
        }

      case 'grupo':
        return {
          background: '#F4F7FA',
          color: '#0F1E2B',
          border: '1px solid #DDE4ED',
        }

      case 'materia':
        return {
          background: '#FFFFFF',
          color: '#506070',
          border: '1px solid #E5EAF0',
        }

      default:
        return {
          background: '#FFFFFF',
          color: '#0F1E2B',
          border: '1px solid #DDE4ED',
        }
    }
  }

  const estilo = obtenerEstilo()

  return (
    <div>
      <div
        onClick={() => {
          if (tieneHijos) {
            setAbierto(prev => !prev)
          }
        }}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all"
        style={{
          ...estilo,

          marginLeft:
            nivel * 24,

          cursor:
            tieneHijos
              ? 'pointer'
              : 'default',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* FLECHA */}
          <div
            className="w-5 text-center font-black shrink-0"
            style={{
              fontSize: 12,
            }}
          >
            {tieneHijos
              ? abierto
                ? '▼'
                : '▶'
              : '•'}
          </div>

          {/* CONTENIDO */}
          <div className="min-w-0">
            <div className="font-bold truncate">
              {nodo.nombre}
            </div>

            {nodo.descripcion && (
              <div
                className="text-xs mt-0.5"
                style={{
                  opacity: 0.72,
                }}
              >
                {nodo.descripcion}
              </div>
            )}
          </div>
        </div>

        {/* TIPO */}
        {nodo.etiqueta && (
          <span
            className="text-[10px] font-black uppercase tracking-wider shrink-0"
            style={{
              opacity: 0.7,
            }}
          >
            {nodo.etiqueta}
          </span>
        )}
      </div>

      {/* ===============================================
          LLAMADA RECURSIVA
      =============================================== */}

      {tieneHijos &&
        abierto &&
        nodo.hijos.map(hijo => (
          <div
            key={hijo.id}
            className="mt-2"
          >
            <NodoAcademico
              nodo={hijo}
              nivel={nivel + 1}
            />
          </div>
        ))}
    </div>
  )
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function ArbolAcademico() {
  const [grupos, setGrupos] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    cargarEstructura()
  }, [])

  // ==================================================
  // CARGAR DATOS
  // ==================================================

  const cargarEstructura =
    async () => {
      setLoading(true)
      setError('')

      try {
        const {
          data,
          error: queryError,
        } = await supabase
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
            ),

            grupo_materias (
              id,

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
            )
          `)
          .order('nombre')

        if (queryError) {
          throw queryError
        }

        setGrupos(data || [])
      } catch (err) {
        console.error(
          'Error cargando árbol académico:',
          err
        )

        setError(
          err?.message ||
            'No se pudo cargar la estructura académica.'
        )
      } finally {
        setLoading(false)
      }
    }

  // ==================================================
  // HELPERS
  // ==================================================

  const obtenerRelacion =
    relacion => {
      if (!relacion) {
        return null
      }

      return Array.isArray(
        relacion
      )
        ? relacion[0]
        : relacion
    }

  const capitalizar =
    texto => {
      if (!texto) return '—'

      return (
        texto.charAt(0)
          .toUpperCase() +
        texto.slice(1)
      )
    }

  // ==================================================
  // CONSTRUIR ÁRBOL
  // ==================================================
  //
  // Aquí convertimos los datos planos de Supabase:
  //
  // grupos[]
  //
  // en una estructura jerárquica:
  //
  // ciclos[]
  //   └── areas[]
  //       └── grupos[]
  //           └── materias[]
  //
  // Después NodoAcademico recorre esta estructura
  // mediante recursividad.
  // ==================================================

  const arbol =
    useMemo(() => {
      const ciclosMap =
        new Map()

      grupos.forEach(grupo => {
        const ciclo =
          obtenerRelacion(
            grupo.ciclos_escolares
          )

        const area =
          obtenerRelacion(
            grupo.areas
          )

        const cicloId =
          ciclo?.id ??
          `texto-${grupo.ciclo_escolar}`

        const cicloNombre =
          ciclo?.nombre ||
          grupo.ciclo_escolar ||
          'Sin ciclo escolar'

        // ==========================================
        // CICLO
        // ==========================================

        if (
          !ciclosMap.has(
            String(cicloId)
          )
        ) {
          ciclosMap.set(
            String(cicloId),
            {
              id: `ciclo-${cicloId}`,
              tipo: 'ciclo',
              nombre:
                cicloNombre,

              descripcion:
                ciclo?.activo
                  ? 'Ciclo escolar activo'
                  : 'Ciclo escolar',

              etiqueta:
                ciclo?.activo
                  ? 'Activo'
                  : 'Ciclo',

              hijos: [],
              areasMap:
                new Map(),
            }
          )
        }

        const nodoCiclo =
          ciclosMap.get(
            String(cicloId)
          )

        // ==========================================
        // ÁREA
        // ==========================================

        const areaId =
          area?.id ??
          grupo.area_id ??
          'sin-area'

        const areaNombre =
          area?.nombre ||
          'Sin área académica'

        if (
          !nodoCiclo.areasMap.has(
            String(areaId)
          )
        ) {
          const nodoArea = {
            id:
              `area-${cicloId}-${areaId}`,

            tipo: 'area',

            nombre:
              areaNombre,

            descripcion:
              'Área académica',

            etiqueta:
              'Área',

            hijos: [],
          }

          nodoCiclo.areasMap.set(
            String(areaId),
            nodoArea
          )

          nodoCiclo.hijos.push(
            nodoArea
          )
        }

        const nodoArea =
          nodoCiclo.areasMap.get(
            String(areaId)
          )

        // ==========================================
        // GRUPO
        // ==========================================

        const nodoGrupo = {
          id:
            `grupo-${grupo.id}`,

          tipo:
            'grupo',

          nombre:
            grupo.nombre,

          descripcion:
            `${grupo.semestre ?? '—'}° semestre · ${capitalizar(
              grupo.turno
            )}`,

          etiqueta:
            'Grupo',

          hijos: [],
        }

        // ==========================================
        // MATERIAS
        // ==========================================

        const asignaciones =
          grupo.grupo_materias ||
          []

        asignaciones.forEach(
          asignacion => {
            const materia =
              obtenerRelacion(
                asignacion.materias
              )

            const docente =
              obtenerRelacion(
                asignacion.docentes
              )

            const perfilDocente =
              obtenerRelacion(
                docente?.perfiles
              )

            const nombreDocente =
              perfilDocente
                ? `${perfilDocente.nombre} ${perfilDocente.apellido}`
                : 'Sin docente asignado'

            nodoGrupo.hijos.push({
              id:
                `materia-${asignacion.id}`,

              tipo:
                'materia',

              nombre:
                materia?.nombre ||
                'Materia sin nombre',

              descripcion:
                `Docente: ${nombreDocente}`,

              etiqueta:
                'Materia',

              hijos: [],
            })
          }
        )

        nodoArea.hijos.push(
          nodoGrupo
        )
      })

      // ==========================================
      // LIMPIAR MAPS INTERNOS
      // ==========================================

      return Array.from(
        ciclosMap.values()
      ).map(ciclo => ({
        id:
          ciclo.id,

        tipo:
          ciclo.tipo,

        nombre:
          ciclo.nombre,

        descripcion:
          ciclo.descripcion,

        etiqueta:
          ciclo.etiqueta,

        hijos:
          ciclo.hijos,
      }))
    }, [grupos])

  // ==================================================
  // ESTADÍSTICAS
  // ==================================================

  const estadisticas =
    useMemo(() => {
      let materias = 0

      grupos.forEach(
        grupo => {
          materias +=
            grupo
              .grupo_materias
              ?.length || 0
        }
      )

      const ciclos =
        new Set(
          grupos.map(
            grupo =>
              grupo.ciclo_id ||
              grupo.ciclo_escolar
          )
        ).size

      const areas =
        new Set(
          grupos.map(
            grupo =>
              grupo.area_id
          )
        ).size

      return {
        ciclos,
        areas,
        grupos:
          grupos.length,
        materias,
      }
    }, [grupos])

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <Card>
        <div
          className="p-6 text-sm"
          style={{
            color: '#506070',
          }}
        >
          Cargando estructura académica...
        </div>
      </Card>
    )
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <Card>
        <div
          className="p-6"
        >
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
        </div>
      </Card>
    )
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            Estructura académica
          </CardTitle>

          <CardSubtitle>
            Árbol jerárquico generado mediante recursividad
          </CardSubtitle>
        </div>

        <Pill variant="blue">
          Recursividad
        </Pill>
      </CardHeader>

      {/* ===============================================
          RESUMEN
      =============================================== */}

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pt-6"
      >
        <div
          className="p-4 rounded-xl"
          style={{
            background:
              '#F4F7FA',

            border:
              '1px solid #DDE4ED',
          }}
        >
          <div
            className="text-xs font-bold"
            style={{
              color:
                '#8FA0AF',
            }}
          >
            Ciclos
          </div>

          <div
            className="text-xl font-black mt-1"
            style={{
              color:
                '#203A50',
            }}
          >
            {
              estadisticas.ciclos
            }
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            background:
              '#F4F7FA',

            border:
              '1px solid #DDE4ED',
          }}
        >
          <div
            className="text-xs font-bold"
            style={{
              color:
                '#8FA0AF',
            }}
          >
            Áreas
          </div>

          <div
            className="text-xl font-black mt-1"
            style={{
              color:
                '#203A50',
            }}
          >
            {
              estadisticas.areas
            }
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            background:
              '#F4F7FA',

            border:
              '1px solid #DDE4ED',
          }}
        >
          <div
            className="text-xs font-bold"
            style={{
              color:
                '#8FA0AF',
            }}
          >
            Grupos
          </div>

          <div
            className="text-xl font-black mt-1"
            style={{
              color:
                '#203A50',
            }}
          >
            {
              estadisticas.grupos
            }
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            background:
              '#F4F7FA',

            border:
              '1px solid #DDE4ED',
          }}
        >
          <div
            className="text-xs font-bold"
            style={{
              color:
                '#8FA0AF',
            }}
          >
            Asignaciones
          </div>

          <div
            className="text-xl font-black mt-1"
            style={{
              color:
                '#203A50',
            }}
          >
            {
              estadisticas.materias
            }
          </div>
        </div>
      </div>

      {/* ===============================================
          EXPLICACIÓN
      =============================================== */}

      <div
        className="mx-6 mt-5 px-4 py-3 rounded-xl text-xs"
        style={{
          background:
            '#EFF6FF',

          border:
            '1px solid #BFDBFE',

          color:
            '#1E40AF',
        }}
      >
        La estructura se recorre de forma
        recursiva: cada nodo muestra sus hijos
        utilizando nuevamente el mismo componente
        hasta llegar a una materia, que representa
        el caso base.
      </div>

      {/* ===============================================
          ÁRBOL
      =============================================== */}

      <div className="p-6 space-y-3">
        {arbol.map(
          ciclo => (
            <NodoAcademico
              key={ciclo.id}
              nodo={ciclo}
            />
          )
        )}

        {arbol.length ===
          0 && (
          <div
            className="py-10 text-center text-sm"
            style={{
              color:
                '#8FA0AF',
            }}
          >
            No hay información académica para mostrar.
          </div>
        )}
      </div>
    </Card>
  )
}