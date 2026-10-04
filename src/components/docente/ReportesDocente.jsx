import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../../lib/supabase'



import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'



import {

  IconChart,

  IconCheck,

  IconAlert,

  IconStar,

  IconDownload,

} from '../Icons'





const REPORT_TYPES = [

  {

    id: 'rendimiento',

    Icon: IconChart,

    title: 'Reporte de Rendimiento',

    desc: 'Promedio por alumno, grupo y materia',

  },

  {

    id: 'asistencia',

    Icon: IconCheck,

    title: 'Reporte de Asistencia',

    desc: 'Porcentaje de asistencia por alumno',

  },

  {

    id: 'riesgo',

    Icon: IconAlert,

    title: 'Alumnos en Riesgo',

    desc: 'Alumnos con promedio menor a 7.0',

  },

  {

    id: 'excelencia',

    Icon: IconStar,

    title: 'Alumnos en Excelencia',

    desc: 'Alumnos con promedio igual o mayor a 9.0',

  },

]





function gradeColor(promedio) {

  if (promedio >= 9) return '#16a34a'

  if (promedio >= 7) return '#ca8a04'

  return '#dc2626'

}





const ESTILOS = `

.reportes-page {

  --rep-blue: #203A50;

  --rep-text: #172B3A;

  --rep-text-2: #647889;

  --rep-text-3: #8FA0AF;

  --rep-border: #DCE5EA;



  max-width: 1400px;

  margin: 0 auto;

  padding: 28px 24px 50px;

}





/* HEADER */



.rep-header {

  margin-bottom: 22px;

}



.rep-header h1 {

  margin: 0 0 5px;

  color: var(--rep-text);

  font-size: 24px;

  font-weight: 700;

}



.rep-header p {

  margin: 0;

  color: var(--rep-text-2);

  font-size: 14px;

}





/* ERROR */



.rep-alert {

  display: flex;

  align-items: center;

  gap: 8px;



  margin-bottom: 18px;

  padding: 12px 16px;



  color: #991b1b;

  background: #fee2e2;



  border: 1px solid #fecaca;

  border-radius: 10px;



  font-size: 13px;

  font-weight: 600;

}





/* LOADING */



.rep-loading,

.rep-empty {

  padding: 35px 20px;



  color: var(--rep-text-2);



  text-align: center;

  font-size: 14px;

}





/* RESUMEN */



.rep-summary {

  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));



  gap: 12px;



  margin-bottom: 20px;

}



.rep-summary-card {

  padding: 15px 17px;



  background: #fff;



  border: 1px solid var(--rep-border);

  border-radius: 12px;

}



.rep-summary-value {

  color: var(--rep-text);



  font-size: 22px;

  font-weight: 800;

}



.rep-summary-label {

  margin-top: 4px;



  color: var(--rep-text-3);



  font-size: 11px;

}





/* TIPOS DE REPORTE */



.rep-types {

  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));



  gap: 14px;



  margin-bottom: 28px;

}



.rep-type-card {

  display: flex;

  align-items: center;



  gap: 13px;



  min-height: 100px;



  padding: 16px;



  background: #fff;



  border: 1px solid var(--rep-border);

  border-radius: 13px;



  cursor: pointer;



  transition:

    transform .15s,

    box-shadow .15s,

    border-color .15s;

}



.rep-type-card:hover {

  transform: translateY(-1px);



  border-color: #96BBCF;



  box-shadow: 0 5px 14px rgba(32,58,80,.06);

}



.rep-type-card.active {

  border: 2px solid var(--rep-blue);

  padding: 15px;

}



.rep-type-icon {

  width: 46px;

  height: 46px;



  flex-shrink: 0;



  display: flex;

  align-items: center;

  justify-content: center;



  color: var(--rep-blue);



  background: rgba(32,58,80,.06);



  border-radius: 10px;

}



.rep-type-card.active .rep-type-icon {

  background: rgba(32,58,80,.12);

}



.rep-type-title {

  margin-bottom: 3px;



  color: var(--rep-text);



  font-size: 14px;

  font-weight: 700;

}



.rep-type-desc {

  color: var(--rep-text-2);



  font-size: 12px;

  line-height: 1.4;

}





/* CARD */



.rep-card {

  overflow: hidden;



  background: #fff;



  border: 1px solid var(--rep-border);

  border-radius: 14px;



  box-shadow: 0 2px 6px rgba(32,58,80,.035);

}



.rep-card-header {

  display: flex;

  align-items: center;

  justify-content: space-between;



  gap: 16px;



  padding: 18px 20px;



  border-bottom: 1px solid var(--rep-border);

}



.rep-card-title {

  color: var(--rep-text);



  font-size: 16px;

  font-weight: 700;

}



.rep-card-subtitle {

  margin-top: 4px;



  color: var(--rep-text-3);



  font-size: 12px;

}





/* BOTÓN */



.rep-btn {

  display: inline-flex;

  align-items: center;

  justify-content: center;



  gap: 7px;



  min-height: 38px;



  padding: 0 14px;



  color: var(--rep-blue);



  background: #fff;



  border: 1px solid var(--rep-border);

  border-radius: 8px;



  font: inherit;

  font-size: 13px;

  font-weight: 600;



  cursor: pointer;



  transition:

    background .15s,

    border-color .15s;

}



.rep-btn:hover {

  background: #f4f9fb;

  border-color: #96BBCF;

}


.rep-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}





/* TABLA */



.rep-table-wrap {

  width: 100%;

  overflow-x: auto;

}



.rep-table {

  width: 100%;



  min-width: 760px;



  border-collapse: collapse;

}



.rep-table th {

  padding: 12px 16px;



  color: var(--rep-text-2);



  background: #F7F9FA;



  border-bottom: 1px solid var(--rep-border);



  font-size: 11px;

  font-weight: 700;



  text-align: left;

  text-transform: uppercase;



  letter-spacing: .03em;



  white-space: nowrap;

}



.rep-table td {

  padding: 14px 16px;



  color: var(--rep-text);



  border-bottom: 1px solid #EDF1F3;



  font-size: 13px;



  vertical-align: middle;

}



.rep-table tbody tr:last-child td {

  border-bottom: 0;

}



.rep-table tbody tr:hover {

  background: #FAFCFD;

}



.rep-alumno {

  font-weight: 700;

}



.rep-center {

  text-align: center !important;

}





/* PILLS */



.rep-pill {

  display: inline-flex;

  align-items: center;

  justify-content: center;



  padding: 4px 9px;



  border-radius: 999px;



  font-size: 10px;

  font-weight: 700;



  text-transform: uppercase;

}



.rep-pill.excelente {

  color: #166534;

  background: #dcfce7;

}



.rep-pill.regular {

  color: #854d0e;

  background: #fef9c3;

}



.rep-pill.riesgo {

  color: #991b1b;

  background: #fee2e2;

}





/* ASISTENCIA */



.rep-progress-wrap {

  display: flex;

  align-items: center;



  gap: 9px;



  min-width: 150px;

}



.rep-progress {

  flex: 1;



  height: 7px;



  overflow: hidden;



  background: #E8EDF0;



  border-radius: 999px;

}



.rep-progress-fill {

  height: 100%;



  border-radius: 999px;

}



.rep-percent {

  min-width: 40px;



  font-size: 12px;

  font-weight: 700;



  text-align: right;

}





/* RESPONSIVE */



@media (max-width: 1100px) {

  .rep-types {

    grid-template-columns: repeat(2, minmax(0, 1fr));

  }



  .rep-summary {

    grid-template-columns: repeat(2, minmax(0, 1fr));

  }

}



@media (max-width: 650px) {

  .reportes-page {

    padding: 18px 12px 35px;

  }



  .rep-types {

    grid-template-columns: 1fr;

  }



  .rep-summary {

    grid-template-columns: 1fr;

  }



  .rep-actions {
    width: 100%;
    flex-direction: column;
  }

  .rep-actions .rep-btn {
    width: 100%;
  }

  .rep-card-header {

    align-items: flex-start;

    flex-direction: column;

  }



  .rep-btn {

    width: 100%;

  }

}

`





export default function ReportesDocente({ user }) {



  // ==================================================

  // ESTADOS

  // ==================================================



  const [datos, setDatos] = useState([])

  const [activeReport, setActiveReport] = useState(null)



  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')





  // ==================================================

  // CARGAR REPORTES

  // ==================================================



  useEffect(() => {

    cargarReportes()

  }, [user?.id])





  async function cargarReportes() {

    try {

      setLoading(true)

      setError('')





      // USUARIO AUTENTICADO



      const {

        data: authData,

        error: authError,

      } = await supabase.auth.getUser()





      if (authError) {

        throw authError

      }





      const authUser = authData?.user





      if (!authUser?.id) {

        throw new Error(

          'No se encontró la sesión del docente.'

        )

      }





      // DOCENTE



      const {

        data: docente,

        error: docenteError,

      } = await supabase

        .from('docentes')

        .select(`

          id,

          perfil_id

        `)

        .eq(

          'perfil_id',

          authUser.id

        )

        .maybeSingle()





      if (docenteError) {

        throw docenteError

      }





      if (!docente) {

        throw new Error(

          'No se encontró el registro del docente.'

        )

      }





      // ASIGNACIONES



      const {

        data: asignaciones,

        error: asignacionesError,

      } = await supabase

        .from('grupo_materias')

        .select(`

          id,

          grupo_id,

          materia_id,



          grupos (

            id,

            nombre,

            semestre,

            turno

          ),



          materias (

            id,

            nombre

          )

        `)

        .eq(

          'docente_id',

          docente.id

        )





      if (asignacionesError) {

        throw asignacionesError

      }





      if (!asignaciones?.length) {

        setDatos([])

        return

      }





      // PROCESAR CADA ASIGNACIÓN



      const resultados = await Promise.all(

        asignaciones.map(

          async asignacion => {



            // INSCRIPCIONES



            const {

              data: inscripciones,

              error: inscripcionesError,

            } = await supabase

              .from('inscripciones')

              .select(`

                id,

                alumno_id,



                alumnos (

                  id,

                  matricula,



                  perfiles (

                    id,

                    nombre,

                    apellido

                  )

                )

              `)

              .eq(

                'grupo_id',

                asignacion.grupo_id

              )





            if (inscripcionesError) {

              throw inscripcionesError

            }





            if (!inscripciones?.length) {

              return []

            }





            const inscripcionIds =

              inscripciones.map(

                inscripcion => inscripcion.id

              )





            // CALIFICACIONES



            const {

              data: calificaciones,

              error: calificacionesError,

            } = await supabase

              .from('calificaciones')

              .select(`

                id,

                inscripcion_id,

                grupo_materia_id,

                parcial_1,

                parcial_2,

                parcial_3,

                promedio

              `)

              .eq(

                'grupo_materia_id',

                asignacion.id

              )

              .in(

                'inscripcion_id',

                inscripcionIds

              )





            if (calificacionesError) {

              throw calificacionesError

            }





            // ASISTENCIAS



            const {

              data: asistencias,

              error: asistenciasError,

            } = await supabase

              .from('asistencias')

              .select(`

                id,

                inscripcion_id,

                grupo_materia_id,

                fecha,

                estado

              `)

              .eq(

                'grupo_materia_id',

                asignacion.id

              )

              .in(

                'inscripcion_id',

                inscripcionIds

              )





            if (asistenciasError) {

              throw asistenciasError

            }





            // CONSTRUIR DATOS



            return inscripciones.map(

              inscripcion => {



                const alumno =

                  inscripcion.alumnos



                const perfil =

                  alumno?.perfiles





                const nombre =

                  [

                    perfil?.nombre,

                    perfil?.apellido,

                  ]

                    .filter(Boolean)

                    .join(' ') ||

                  'Alumno'





                const calificacion =

                  (calificaciones || []).find(

                    item =>

                      Number(

                        item.inscripcion_id

                      ) ===

                      Number(

                        inscripcion.id

                      )

                  )





                const historial =

                  (asistencias || []).filter(

                    item =>

                      Number(

                        item.inscripcion_id

                      ) ===

                      Number(

                        inscripcion.id

                      )

                  )





                const presentes =

                  historial.filter(

                    item =>

                      item.estado === 'presente'

                  ).length





                const faltas =

                  historial.filter(

                    item =>

                      item.estado === 'ausente'

                  ).length





                const totalClases =

                  presentes + faltas





                const porcentajeAsistencia =

                  totalClases > 0

                    ? Math.round(

                        (

                          presentes /

                          totalClases

                        ) * 100

                      )

                    : null





                const promedioRaw =

                  calificacion?.promedio





                const promedio =

                  promedioRaw !== null &&

                  promedioRaw !== undefined &&

                  promedioRaw !== ''

                    ? Number(promedioRaw)

                    : null





                return {

                  key:

                    `${asignacion.id}-${inscripcion.id}`,



                  alumno_id:

                    alumno?.id,



                  inscripcion_id:

                    inscripcion.id,



                  matricula:

                    alumno?.matricula,



                  nombre,



                  grupo:

                    asignacion.grupos

                      ?.nombre ||

                    'Sin grupo',



                  turno:

                    asignacion.grupos

                      ?.turno,



                  semestre:

                    asignacion.grupos

                      ?.semestre,



                  materia:

                    asignacion.materias

                      ?.nombre ||

                    'Materia',



                  grupo_materia_id:

                    asignacion.id,



                  promedio:

                    Number.isFinite(promedio)

                      ? promedio

                      : null,



                  parcial_1:

                    calificacion?.parcial_1,



                  parcial_2:

                    calificacion?.parcial_2,



                  parcial_3:

                    calificacion?.parcial_3,



                  asistencias:

                    presentes,



                  faltas,



                  totalClases,



                  porcentajeAsistencia,

                }

              }

            )

          }

        )

      )





      setDatos(

        resultados

          .flat()

          .sort(

            (a, b) => {



              const grupoCompare =

                a.grupo.localeCompare(

                  b.grupo,

                  'es'

                )





              if (grupoCompare !== 0) {

                return grupoCompare

              }





              const materiaCompare =

                a.materia.localeCompare(

                  b.materia,

                  'es'

                )





              if (materiaCompare !== 0) {

                return materiaCompare

              }





              return a.nombre.localeCompare(

                b.nombre,

                'es'

              )

            }

          )

      )



    } catch (err) {



      console.error(

        'Error cargando reportes:',

        err

      )





      setDatos([])





      setError(

        err?.message ||

        'No se pudieron cargar los reportes.'

      )



    } finally {

      setLoading(false)

    }

  }





  // ==================================================

  // DATOS CALCULADOS

  // ==================================================



  const conCalificacion =

    useMemo(() => {



      return datos.filter(

        alumno =>

          Number.isFinite(

            alumno.promedio

          )

      )



    }, [datos])





  const enRiesgo =

    useMemo(() => {



      return conCalificacion.filter(

        alumno =>

          alumno.promedio < 7

      )



    }, [conCalificacion])





  const excelentes =

    useMemo(() => {



      return conCalificacion.filter(

        alumno =>

          alumno.promedio >= 9

      )



    }, [conCalificacion])





  const promedioGeneral =

    useMemo(() => {



      if (

        conCalificacion.length === 0

      ) {

        return null

      }





      const suma =

        conCalificacion.reduce(

          (total, alumno) =>

            total + alumno.promedio,

          0

        )





      return (

        suma /

        conCalificacion.length

      )



    }, [conCalificacion])





  const asistenciaGeneral =

    useMemo(() => {



      const presentes =

        datos.reduce(

          (total, alumno) =>

            total + alumno.asistencias,

          0

        )





      const clases =

        datos.reduce(

          (total, alumno) =>

            total + alumno.totalClases,

          0

        )





      if (clases === 0) {

        return null

      }





      return Math.round(

        (

          presentes /

          clases

        ) * 100

      )



    }, [datos])





  // ==================================================

  // FECHAS

  // ==================================================



  const fechaReporte =

    new Date().toLocaleDateString(

      'es-MX',

      {

        day: '2-digit',

        month: 'long',

        year: 'numeric',

      }

    )





  function fechaArchivo() {

    const hoy = new Date()



    const year =

      hoy.getFullYear()



    const month =

      String(

        hoy.getMonth() + 1

      ).padStart(2, '0')



    const day =

      String(

        hoy.getDate()

      ).padStart(2, '0')





    return `${year}-${month}-${day}`

  }





  // ==================================================

  // ENCABEZADO PDF

  // ==================================================



  function prepararPDF(titulo, descripcion) {



    const doc = new jsPDF({

      orientation: 'landscape',

      unit: 'mm',

      format: 'a4',

    })





    // BOLETYX



    doc.setFont(

      'helvetica',

      'bold'

    )



    doc.setFontSize(20)



    doc.setTextColor(

      32,

      58,

      80

    )



    doc.text(

      'Boletyx',

      14,

      17

    )





    // SUBTÍTULO



    doc.setFont(

      'helvetica',

      'normal'

    )



    doc.setFontSize(9)



    doc.setTextColor(

      100,

      116,

      128

    )



    doc.text(

      'Sistema de Control Escolar',

      14,

      23

    )





    // LÍNEA



    doc.setDrawColor(

      220,

      229,

      234

    )



    doc.line(

      14,

      29,

      283,

      29

    )





    // TÍTULO



    doc.setFont(

      'helvetica',

      'bold'

    )



    doc.setFontSize(15)



    doc.setTextColor(

      23,

      43,

      58

    )



    doc.text(

      titulo,

      14,

      40

    )





    // DESCRIPCIÓN



    doc.setFont(

      'helvetica',

      'normal'

    )



    doc.setFontSize(9)



    doc.setTextColor(

      100,

      116,

      128

    )



    doc.text(

      descripcion,

      14,

      47

    )





    // FECHA



    doc.text(

      `Generado: ${fechaReporte}`,

      283,

      17,

      {

        align: 'right',

      }

    )





    return doc

  }





  // ==================================================

  // CONFIGURACIÓN DE TABLA PDF

  // ==================================================



  function configuracionTabla() {

    return {

      startY: 55,



      theme: 'grid',



      styles: {

        font: 'helvetica',

        fontSize: 8,

        cellPadding: 3,

        textColor: [23, 43, 58],

        lineColor: [220, 229, 234],

        lineWidth: 0.1,

      },



      headStyles: {

        fillColor: [32, 58, 80],

        textColor: [255, 255, 255],

        fontStyle: 'bold',

      },



      alternateRowStyles: {

        fillColor: [247, 249, 250],

      },



      margin: {

        left: 14,

        right: 14,

      },

    }

  }






  // ==================================================
  // EXPORTAR CSV / EXCEL
  // ==================================================

  function escaparCSV(valor) {
    if (valor === null || valor === undefined) {
      return ''
    }

    const texto = String(valor)
    return `"${texto.replace(/"/g, '""')}"`
  }

  function descargarCSV(nombreArchivo, encabezados, filas) {
    const separador = ','

    const contenido = [
      encabezados.map(escaparCSV).join(separador),
      ...filas.map(fila =>
        fila.map(escaparCSV).join(separador)
      ),
    ].join('\r\n')

    const blob = new Blob(
      ['\uFEFF', contenido],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = nombreArchivo

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    URL.revokeObjectURL(url)
  }

  function handleExportarCSV(tipo) {
    if (tipo === 'rendimiento') {
      if (conCalificacion.length === 0) {
        window.alert('No hay calificaciones para exportar.')
        return
      }

      const filas = conCalificacion.map(alumno => [
        alumno.matricula || '—',
        alumno.nombre,
        alumno.grupo,
        alumno.materia,
        alumno.parcial_1 ?? 'Sin captura',
        alumno.parcial_2 ?? 'Sin captura',
        alumno.parcial_3 ?? 'Sin captura',
        alumno.promedio.toFixed(1),
        alumno.promedio >= 9
          ? 'Excelente'
          : alumno.promedio >= 7
            ? 'Regular'
            : 'Riesgo',
      ])

      descargarCSV(
        `reporte-rendimiento-${fechaArchivo()}.csv`,
        [
          'Matrícula',
          'Alumno',
          'Grupo',
          'Materia',
          'Parcial 1',
          'Parcial 2',
          'Parcial 3',
          'Promedio',
          'Estado',
        ],
        filas
      )

      return
    }

    if (tipo === 'asistencia') {
      if (datos.length === 0) {
        window.alert('No hay información de asistencia para exportar.')
        return
      }

      const filas = datos.map(alumno => [
        alumno.matricula || '—',
        alumno.nombre,
        alumno.grupo,
        alumno.materia,
        alumno.asistencias,
        alumno.faltas,
        alumno.totalClases,
        alumno.porcentajeAsistencia === null
          ? 'Sin registros'
          : `${alumno.porcentajeAsistencia}%`,
      ])

      descargarCSV(
        `reporte-asistencia-${fechaArchivo()}.csv`,
        [
          'Matrícula',
          'Alumno',
          'Grupo',
          'Materia',
          'Asistencias',
          'Faltas',
          'Total de clases',
          '% Asistencia',
        ],
        filas
      )

      return
    }

    if (tipo === 'riesgo') {
      if (enRiesgo.length === 0) {
        window.alert('No hay alumnos en riesgo para exportar.')
        return
      }

      const filas = enRiesgo.map(alumno => [
        alumno.matricula || '—',
        alumno.nombre,
        alumno.grupo,
        alumno.materia,
        alumno.parcial_1 ?? 'Sin captura',
        alumno.parcial_2 ?? 'Sin captura',
        alumno.parcial_3 ?? 'Sin captura',
        alumno.promedio.toFixed(1),
        alumno.faltas,
      ])

      descargarCSV(
        `reporte-riesgo-${fechaArchivo()}.csv`,
        [
          'Matrícula',
          'Alumno',
          'Grupo',
          'Materia',
          'Parcial 1',
          'Parcial 2',
          'Parcial 3',
          'Promedio',
          'Faltas',
        ],
        filas
      )

      return
    }

    if (tipo === 'excelencia') {
      if (excelentes.length === 0) {
        window.alert('No hay alumnos en excelencia para exportar.')
        return
      }

      const filas = excelentes.map(alumno => [
        alumno.matricula || '—',
        alumno.nombre,
        alumno.grupo,
        alumno.materia,
        alumno.parcial_1 ?? 'Sin captura',
        alumno.parcial_2 ?? 'Sin captura',
        alumno.parcial_3 ?? 'Sin captura',
        alumno.promedio.toFixed(1),
      ])

      descargarCSV(
        `reporte-excelencia-${fechaArchivo()}.csv`,
        [
          'Matrícula',
          'Alumno',
          'Grupo',
          'Materia',
          'Parcial 1',
          'Parcial 2',
          'Parcial 3',
          'Promedio',
        ],
        filas
      )
    }
  }

  // ==================================================

  // EXPORTAR PDF

  // ==================================================



  function handleExportar(tipo) {



    // ================================================

    // RENDIMIENTO

    // ================================================



    if (tipo === 'rendimiento') {



      if (

        conCalificacion.length === 0

      ) {

        window.alert(

          'No hay calificaciones para exportar.'

        )



        return

      }





      const doc =

        prepararPDF(

          'Reporte de Rendimiento Académico',

          'Calificaciones registradas en las materias asignadas al docente.'

        )





      const filas =

        conCalificacion.map(

          alumno => [



            alumno.matricula || '—',



            alumno.nombre,



            alumno.grupo,



            alumno.materia,



            alumno.promedio.toFixed(1),



            alumno.promedio >= 9

              ? 'Excelente'

              : alumno.promedio >= 7

                ? 'Regular'

                : 'Riesgo',

          ]

        )





      autoTable(

        doc,

        {

          ...configuracionTabla(),



          head: [[

            'Matrícula',

            'Alumno',

            'Grupo',

            'Materia',

            'Promedio',

            'Estado',

          ]],



          body: filas,

        }

      )





      doc.save(

        `reporte-rendimiento-${fechaArchivo()}.pdf`

      )



      return

    }





    // ================================================

    // ASISTENCIA

    // ================================================



    if (tipo === 'asistencia') {



      if (

        datos.length === 0

      ) {

        window.alert(

          'No hay información de asistencia para exportar.'

        )



        return

      }





      const doc =

        prepararPDF(

          'Reporte de Asistencia',

          'Porcentaje calculado con las clases registradas en el sistema.'

        )





      const filas =

        datos.map(

          alumno => [



            alumno.matricula || '—',



            alumno.nombre,



            alumno.grupo,



            alumno.materia,



            alumno.asistencias,



            alumno.faltas,



            alumno.porcentajeAsistencia ===

            null

              ? 'Sin registros'

              : `${alumno.porcentajeAsistencia}%`,

          ]

        )





      autoTable(

        doc,

        {

          ...configuracionTabla(),



          head: [[

            'Matrícula',

            'Alumno',

            'Grupo',

            'Materia',

            'Asistencias',

            'Faltas',

            '% Asistencia',

          ]],



          body: filas,

        }

      )





      doc.save(

        `reporte-asistencia-${fechaArchivo()}.pdf`

      )



      return

    }





    // ================================================

    // RIESGO

    // ================================================



    if (tipo === 'riesgo') {



      if (

        enRiesgo.length === 0

      ) {

        window.alert(

          'No hay alumnos en riesgo para exportar.'

        )



        return

      }





      const doc =

        prepararPDF(

          'Reporte de Alumnos en Riesgo',

          'Registros con promedio inferior a 7.0.'

        )





      const filas =

        enRiesgo.map(

          alumno => [



            alumno.matricula || '—',



            alumno.nombre,



            alumno.grupo,



            alumno.materia,



            alumno.promedio.toFixed(1),



            alumno.faltas,

          ]

        )





      autoTable(

        doc,

        {

          ...configuracionTabla(),



          head: [[

            'Matrícula',

            'Alumno',

            'Grupo',

            'Materia',

            'Promedio',

            'Faltas',

          ]],



          body: filas,

        }

      )





      doc.save(

        `reporte-riesgo-${fechaArchivo()}.pdf`

      )



      return

    }





    // ================================================

    // EXCELENCIA

    // ================================================



    if (tipo === 'excelencia') {



      if (

        excelentes.length === 0

      ) {

        window.alert(

          'No hay alumnos en excelencia para exportar.'

        )



        return

      }





      const doc =

        prepararPDF(

          'Reporte de Alumnos en Excelencia',

          'Registros con promedio igual o superior a 9.0.'

        )





      const filas =

        excelentes.map(

          alumno => [



            alumno.matricula || '—',



            alumno.nombre,



            alumno.grupo,



            alumno.materia,



            alumno.promedio.toFixed(1),

          ]

        )





      autoTable(

        doc,

        {

          ...configuracionTabla(),



          head: [[

            'Matrícula',

            'Alumno',

            'Grupo',

            'Materia',

            'Promedio',

          ]],



          body: filas,

        }

      )





      doc.save(

        `reporte-excelencia-${fechaArchivo()}.pdf`

      )

    }

  }





  // ==================================================

  // RENDER

  // ==================================================



  return (

    <>

      <style>{ESTILOS}</style>





      <div className="reportes-page fade-in">



        {/* HEADER */}



        <div className="rep-header">



          <h1>

            Reportes

          </h1>



          <p>

            Consulta y exporta reportes académicos de tus grupos

          </p>



        </div>





        {/* ERROR */}



        {error && (

          <div className="rep-alert">



            <IconAlert size={16} />



            {error}



          </div>

        )}





        {/* RESUMEN */}



        {!loading &&

          !error &&

          datos.length > 0 && (



            <div className="rep-summary">



              <div className="rep-summary-card">



                <div className="rep-summary-value">

                  {promedioGeneral !== null

                    ? promedioGeneral.toFixed(1)

                    : '—'}

                </div>



                <div className="rep-summary-label">

                  Promedio académico

                </div>



              </div>





              <div className="rep-summary-card">



                <div

                  className="rep-summary-value"

                  style={{

                    color: '#16a34a',

                  }}

                >

                  {asistenciaGeneral !== null

                    ? `${asistenciaGeneral}%`

                    : '—'}

                </div>



                <div className="rep-summary-label">

                  Asistencia general

                </div>



              </div>





              <div className="rep-summary-card">



                <div

                  className="rep-summary-value"

                  style={{

                    color: '#dc2626',

                  }}

                >

                  {enRiesgo.length}

                </div>



                <div className="rep-summary-label">

                  Registros en riesgo

                </div>



              </div>





              <div className="rep-summary-card">



                <div

                  className="rep-summary-value"

                  style={{

                    color: '#16a34a',

                  }}

                >

                  {excelentes.length}

                </div>



                <div className="rep-summary-label">

                  Registros en excelencia

                </div>



              </div>



            </div>



          )}





        {/* TIPOS DE REPORTE */}



        <div className="rep-types">



          {REPORT_TYPES.map(

            reporte => {



              const ReportIcon =

                reporte.Icon





              return (



                <div

                  key={reporte.id}

                  role="button"

                  tabIndex={0}



                  className={

                    `rep-type-card${

                      activeReport ===

                      reporte.id

                        ? ' active'

                        : ''

                    }`

                  }



                  onClick={() =>

                    setActiveReport(

                      reporte.id

                    )

                  }



                  onKeyDown={event => {



                    if (

                      event.key === 'Enter' ||

                      event.key === ' '

                    ) {

                      setActiveReport(

                        reporte.id

                      )

                    }



                  }}

                >



                  <div className="rep-type-icon">



                    <ReportIcon

                      size={20}

                    />



                  </div>





                  <div>



                    <div className="rep-type-title">

                      {reporte.title}

                    </div>



                    <div className="rep-type-desc">

                      {reporte.desc}

                    </div>



                  </div>



                </div>



              )

            }

          )}



        </div>





        {/* LOADING */}



        {loading && (



          <div className="rep-card">



            <div className="rep-loading">

              Cargando información académica...

            </div>



          </div>



        )}





        {/* SIN DATOS */}



        {!loading &&

          !error &&

          datos.length === 0 && (



            <div className="rep-card">



              <div className="rep-empty">

                No hay información disponible para generar reportes.

              </div>



            </div>



          )}





        {/* ==========================================

            RENDIMIENTO

        ========================================== */}



        {!loading &&

          activeReport === 'rendimiento' && (



            <div className="rep-card">



              <div className="rep-card-header">



                <div>



                  <div className="rep-card-title">

                    Reporte de Rendimiento

                  </div>



                  <div className="rep-card-subtitle">

                    Generado: {fechaReporte}

                  </div>



                </div>
                <div className="rep-actions">
                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportar('rendimiento')}
                  >
                    <IconDownload size={14} />
                    Exportar PDF
                  </button>

                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportarCSV('rendimiento')}
                  >
                    <IconDownload size={14} />
                    Exportar Excel
                  </button>
                </div>



              </div>





              {conCalificacion.length === 0 ? (



                <div className="rep-empty">

                  Todavía no existen calificaciones registradas para las materias del docente.

                </div>



              ) : (



                <div className="rep-table-wrap">



                  <table className="rep-table">



                    <thead>



                      <tr>

                        <th>Alumno</th>

                        <th>Grupo</th>

                        <th>Materia</th>

                        <th>Promedio</th>



                        <th className="rep-center">

                          Estado

                        </th>

                      </tr>



                    </thead>





                    <tbody>



                      {conCalificacion.map(

                        alumno => {



                          const estado =

                            alumno.promedio >= 9

                              ? 'Excelente'

                              : alumno.promedio >= 7

                                ? 'Regular'

                                : 'Riesgo'





                          const clase =

                            alumno.promedio >= 9

                              ? 'excelente'

                              : alumno.promedio >= 7

                                ? 'regular'

                                : 'riesgo'





                          return (



                            <tr key={alumno.key}>



                              <td className="rep-alumno">

                                {alumno.nombre}

                              </td>



                              <td>

                                {alumno.grupo}

                              </td>



                              <td>

                                {alumno.materia}

                              </td>



                              <td>



                                <span

                                  style={{

                                    color:

                                      gradeColor(

                                        alumno.promedio

                                      ),



                                    fontWeight:

                                      700,

                                  }}

                                >

                                  {alumno.promedio.toFixed(

                                    1

                                  )}

                                </span>



                              </td>



                              <td className="rep-center">



                                <span

                                  className={

                                    `rep-pill ${clase}`

                                  }

                                >

                                  {estado}

                                </span>



                              </td>



                            </tr>



                          )

                        }

                      )}



                    </tbody>



                  </table>



                </div>



              )}



            </div>



          )}





        {/* ==========================================

            ASISTENCIA

        ========================================== */}



        {!loading &&

          activeReport === 'asistencia' && (



            <div className="rep-card">



              <div className="rep-card-header">



                <div>



                  <div className="rep-card-title">

                    Reporte de Asistencia

                  </div>



                  <div className="rep-card-subtitle">

                    Calculado con las clases registradas en el sistema

                  </div>



                </div>
                <div className="rep-actions">
                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportar('asistencia')}
                  >
                    <IconDownload size={14} />
                    Exportar PDF
                  </button>

                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportarCSV('asistencia')}
                  >
                    <IconDownload size={14} />
                    Exportar Excel
                  </button>
                </div>



              </div>





              {datos.length === 0 ? (



                <div className="rep-empty">

                  No hay alumnos disponibles para este reporte.

                </div>



              ) : (



                <div className="rep-table-wrap">



                  <table className="rep-table">



                    <thead>



                      <tr>

                        <th>Alumno</th>

                        <th>Grupo</th>

                        <th>Materia</th>



                        <th className="rep-center">

                          Asistencias

                        </th>



                        <th className="rep-center">

                          Faltas

                        </th>



                        <th>

                          % Asistencia

                        </th>

                      </tr>



                    </thead>





                    <tbody>



                      {datos.map(

                        alumno => {



                          const pct =

                            alumno.porcentajeAsistencia





                          const color =

                            pct === null

                              ? '#8FA0AF'

                              : pct >= 80

                                ? '#16a34a'

                                : pct >= 70

                                  ? '#ca8a04'

                                  : '#dc2626'





                          return (



                            <tr key={alumno.key}>



                              <td className="rep-alumno">

                                {alumno.nombre}

                              </td>



                              <td>

                                {alumno.grupo}

                              </td>



                              <td>

                                {alumno.materia}

                              </td>



                              <td

                                className="rep-center"

                                style={{

                                  color: '#16a34a',

                                  fontWeight: 700,

                                }}

                              >

                                {alumno.asistencias}

                              </td>



                              <td

                                className="rep-center"

                                style={{

                                  color: '#dc2626',

                                  fontWeight: 700,

                                }}

                              >

                                {alumno.faltas}

                              </td>



                              <td>



                                {pct === null ? (



                                  <span

                                    style={{

                                      color: '#8FA0AF',

                                      fontSize: 12,

                                    }}

                                  >

                                    Sin registros

                                  </span>



                                ) : (



                                  <div className="rep-progress-wrap">



                                    <div className="rep-progress">



                                      <div

                                        className="rep-progress-fill"

                                        style={{

                                          width: `${pct}%`,

                                          background: color,

                                        }}

                                      />



                                    </div>





                                    <span

                                      className="rep-percent"

                                      style={{

                                        color,

                                      }}

                                    >

                                      {pct}%

                                    </span>



                                  </div>



                                )}



                              </td>



                            </tr>



                          )

                        }

                      )}



                    </tbody>



                  </table>



                </div>



              )}



            </div>



          )}





        {/* ==========================================

            RIESGO

        ========================================== */}



        {!loading &&

          activeReport === 'riesgo' && (



            <div className="rep-card">



              <div className="rep-card-header">



                <div>



                  <div className="rep-card-title">

                    Alumnos en Riesgo ({enRiesgo.length})

                  </div>



                  <div className="rep-card-subtitle">

                    Promedio inferior a 7.0 — requieren atención

                  </div>



                </div>
                <div className="rep-actions">
                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportar('riesgo')}
                  >
                    <IconDownload size={14} />
                    Exportar PDF
                  </button>

                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportarCSV('riesgo')}
                  >
                    <IconDownload size={14} />
                    Exportar Excel
                  </button>
                </div>



              </div>





              {enRiesgo.length === 0 ? (



                <div className="rep-empty">

                  Sin alumnos en riesgo.

                </div>



              ) : (



                <div className="rep-table-wrap">



                  <table className="rep-table">



                    <thead>



                      <tr>

                        <th>Alumno</th>

                        <th>Grupo</th>

                        <th>Materia</th>

                        <th>Promedio</th>



                        <th className="rep-center">

                          Faltas

                        </th>

                      </tr>



                    </thead>





                    <tbody>



                      {enRiesgo.map(

                        alumno => (



                          <tr key={alumno.key}>



                            <td className="rep-alumno">

                              {alumno.nombre}

                            </td>



                            <td>

                              {alumno.grupo}

                            </td>



                            <td>

                              {alumno.materia}

                            </td>



                            <td>



                              <span

                                style={{

                                  color: '#dc2626',

                                  fontWeight: 700,

                                }}

                              >

                                {alumno.promedio.toFixed(

                                  1

                                )}

                              </span>



                            </td>



                            <td

                              className="rep-center"

                              style={{

                                color: '#dc2626',

                                fontWeight: 700,

                              }}

                            >

                              {alumno.faltas}

                            </td>



                          </tr>



                        )

                      )}



                    </tbody>



                  </table>



                </div>



              )}



            </div>



          )}





        {/* ==========================================

            EXCELENCIA

        ========================================== */}



        {!loading &&

          activeReport === 'excelencia' && (



            <div className="rep-card">



              <div className="rep-card-header">



                <div>



                  <div className="rep-card-title">

                    Alumnos en Excelencia ({excelentes.length})

                  </div>



                  <div className="rep-card-subtitle">

                    Promedio igual o superior a 9.0

                  </div>



                </div>
                <div className="rep-actions">
                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportar('excelencia')}
                  >
                    <IconDownload size={14} />
                    Exportar PDF
                  </button>

                  <button
                    type="button"
                    className="rep-btn"
                    onClick={() => handleExportarCSV('excelencia')}
                  >
                    <IconDownload size={14} />
                    Exportar Excel
                  </button>
                </div>



              </div>





              {excelentes.length === 0 ? (



                <div className="rep-empty">

                  Todavía no hay alumnos con promedio de excelencia.

                </div>



              ) : (



                <div className="rep-table-wrap">



                  <table className="rep-table">



                    <thead>



                      <tr>

                        <th>Alumno</th>

                        <th>Grupo</th>

                        <th>Materia</th>

                        <th>Promedio</th>

                      </tr>



                    </thead>





                    <tbody>



                      {excelentes.map(

                        alumno => (



                          <tr key={alumno.key}>



                            <td className="rep-alumno">

                              {alumno.nombre}

                            </td>



                            <td>

                              {alumno.grupo}

                            </td>



                            <td>

                              {alumno.materia}

                            </td>



                            <td>



                              <span

                                style={{

                                  color: '#16a34a',

                                  fontWeight: 700,

                                }}

                              >

                                {alumno.promedio.toFixed(

                                  1

                                )}

                              </span>



                            </td>



                          </tr>



                        )

                      )}



                    </tbody>



                  </table>



                </div>



              )}



            </div>



          )}



      </div>

    </>

  )

}