import { createClient } from '@supabase/supabase-js'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',

  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}


Deno.serve(async (req: Request) => {

  // ==================================================
  // CORS
  // ==================================================

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }


  try {

    // ==================================================
    // VARIABLES DE ENTORNO
    // ==================================================

    const supabaseUrl =
      Deno.env.get('SUPABASE_URL')

    const anonKey =
      Deno.env.get('SUPABASE_ANON_KEY')

    const serviceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')


    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        'Faltan variables de entorno de Supabase.'
      )
    }


    // ==================================================
    // VALIDAR TOKEN DEL USUARIO
    // ==================================================

    const authHeader =
      req.headers.get('Authorization')


    if (!authHeader) {
      return respuesta(
        {
          success: false,
          error: 'Sesión no válida.',
        },
        401
      )
    }


    // ==================================================
    // CLIENTE DEL USUARIO QUE HACE LA PETICIÓN
    // ==================================================

    const supabaseUsuario = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )


    const {
      data: { user },
      error: userError,
    } =
      await supabaseUsuario.auth.getUser()


    if (userError || !user) {
      return respuesta(
        {
          success: false,

          error:
            'No se pudo validar la sesión.',
        },
        401
      )
    }


    // ==================================================
    // CLIENTE ADMINISTRATIVO
    // ==================================================

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )


    // ==================================================
    // VERIFICAR QUE EL USUARIO SEA ADMIN
    // ==================================================

    const {
      data: perfilAdmin,
      error: perfilAdminError,
    } =
      await supabaseAdmin
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()


    if (
      perfilAdminError ||
      perfilAdmin?.rol !== 'admin'
    ) {
      return respuesta(
        {
          success: false,

          error:
            'No tienes permisos para registrar alumnos.',
        },
        403
      )
    }


    // ==================================================
    // DATOS DEL FORMULARIO
    // ==================================================

    const body =
      await req.json()


    const nombre =
      String(body.nombre || '').trim()


    const apellido =
      String(body.apellido || '').trim()


    const email =
      String(body.email || '')
        .trim()
        .toLowerCase()


    const password =
      String(body.password || '')


    const semestre =
      Number(body.semestre)


    let turno =
      String(body.turno || '')
        .trim()
        .toLowerCase()


    const areaId =
      body.area_id == null ||
      body.area_id === ''
        ? null
        : Number(body.area_id)


    // ==================================================
    // VALIDACIONES GENERALES
    // ==================================================

    if (
      !nombre ||
      !apellido ||
      !email ||
      !password
    ) {
      return respuesta(
        {
          success: false,

          error:
            'Nombre, apellido, correo y contraseña son obligatorios.',
        },
        400
      )
    }


    if (password.length < 6) {
      return respuesta(
        {
          success: false,

          error:
            'La contraseña debe tener al menos 6 caracteres.',
        },
        400
      )
    }


    // ==================================================
    // VALIDAR SEMESTRE
    // ==================================================
    //
    // El sistema solamente trabaja con:
    //
    // 1.er semestre
    // 3.er semestre
    // 5.º semestre
    //
    // ==================================================

    if (
      !Number.isInteger(semestre) ||
      ![1, 3, 5].includes(semestre)
    ) {
      return respuesta(
        {
          success: false,

          error:
            'Semestre no válido. Solo se permiten los semestres 1, 3 y 5.',
        },
        400
      )
    }


    // ==================================================
    // VALIDAR TURNO GENERAL
    // ==================================================

    if (
      turno !== 'matutino' &&
      turno !== 'vespertino'
    ) {
      return respuesta(
        {
          success: false,
          error: 'Turno no válido.',
        },
        400
      )
    }


    // ==================================================
    // DETERMINAR SI REQUIERE ÁREA
    // ==================================================
    //
    // Semestre 1:
    // no tiene área especializada.
    //
    // Semestres 3 y 5:
    // requieren área académica.
    //
    // ==================================================

    const requiereArea =
      [3, 5].includes(semestre)


    let areaIdFinal:
      number | null = null


    // ==================================================
    // VALIDAR ÁREA ACADÉMICA
    // ==================================================

    if (requiereArea) {

      if (
        areaId == null ||
        !Number.isInteger(areaId) ||
        areaId <= 0
      ) {
        return respuesta(
          {
            success: false,

            error:
              'Debes seleccionar un área académica válida.',
          },
          400
        )
      }


      const {
        data: area,
        error: areaError,
      } =
        await supabaseAdmin
          .from('areas')
          .select('id, nombre')
          .eq('id', areaId)
          .single()


      if (
        areaError ||
        !area
      ) {
        return respuesta(
          {
            success: false,

            error:
              'El área académica seleccionada no existe.',
          },
          400
        )
      }


      // ================================================
      // NO PERMITIR TRONCO COMÚN
      // ================================================

      if (
        area.nombre
          ?.trim()
          .toLowerCase() ===
        'tronco común'
      ) {
        return respuesta(
          {
            success: false,

            error:
              'Tronco Común no puede seleccionarse como área académica para los semestres 3 y 5.',
          },
          400
        )
      }


      // ================================================
      // REGLAS DE TURNO SEGÚN ÁREA
      // ================================================

      if (
        area.nombre ===
        'Matemáticas e Ingenierías'
      ) {
        // Matemáticas siempre es matutino.
        turno = 'matutino'
      }

      else if (
        area.nombre ===
        'Ciencias Biológicas y de la Salud'
      ) {
        // Biológicas siempre es vespertino.
        turno = 'vespertino'
      }

      else if (
        area.nombre ===
        'Ciencias Sociales y Humanidades'
      ) {
        // Sociales puede estar en cualquiera
        // de los dos turnos.

        if (
          turno !== 'matutino' &&
          turno !== 'vespertino'
        ) {
          return respuesta(
            {
              success: false,

              error:
                'Selecciona un turno válido para Ciencias Sociales y Humanidades.',
            },
            400
          )
        }
      }

      else {
        // Si en el futuro agregan otra área,
        // no permitimos utilizarla hasta definir
        // sus reglas.

        return respuesta(
          {
            success: false,

            error:
              'El área académica seleccionada no está habilitada para inscripciones.',
          },
          400
        )
      }


      areaIdFinal =
        area.id
    }


    // ==================================================
    // SEMESTRE 1
    // ==================================================
    //
    // Nunca debe guardar un área especializada.
    //
    // ==================================================

    if (!requiereArea) {
      areaIdFinal = null
    }


    // ==================================================
    // CREAR USUARIO EN AUTH
    // ==================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin
        .auth
        .admin
        .createUser({
          email,
          password,
          email_confirm: true,
        })


    if (authError) {
      return respuesta(
        {
          success: false,
          error: authError.message,
        },
        400
      )
    }


    const nuevoUsuario =
      authData.user


    if (!nuevoUsuario) {
      throw new Error(
        'Supabase no devolvió el nuevo usuario.'
      )
    }


    try {

      // ==================================================
      // CREAR PERFIL
      // ==================================================

      const {
        error: perfilError,
      } =
        await supabaseAdmin
          .from('perfiles')
          .insert({
            id:
              nuevoUsuario.id,

            nombre,

            apellido,

            rol:
              'alumno',
          })


      if (perfilError) {
        throw perfilError
      }


      // ==================================================
      // GENERAR MATRÍCULA ÚNICA
      // ==================================================

      let alumnoCreado =
        false

      let matriculaFinal =
        ''

      let ultimoError:
        unknown = null


      for (
        let intento = 0;
        intento < 5;
        intento++
      ) {

        const anio =
          new Date()
            .getFullYear()
            .toString()


        const {
          data: alumnosAnio,
          error: matriculaError,
        } =
          await supabaseAdmin
            .from('alumnos')
            .select('matricula')
            .like(
              'matricula',
              `${anio}%`
            )


        if (matriculaError) {
          throw matriculaError
        }


        let mayorNumero = 0


        for (
          const alumno of
            alumnosAnio || []
        ) {

          const matriculaActual =
            String(
              alumno.matricula || ''
            )


          const consecutivo =
            Number(
              matriculaActual.slice(4)
            )


          if (
            Number.isInteger(
              consecutivo
            ) &&
            consecutivo >
              mayorNumero
          ) {
            mayorNumero =
              consecutivo
          }
        }


        const siguiente =
          String(
            mayorNumero + 1
          ).padStart(
            4,
            '0'
          )


        const matricula =
          `${anio}${siguiente}`


        // ==================================================
        // CREAR ALUMNO
        // ==================================================
        //
        // grupo queda en null.
        //
        // El grupo real se asigna posteriormente:
        //
        // inscripciones -> grupo_id
        //
        // ==================================================

        const {
          error: alumnoError,
        } =
          await supabaseAdmin
            .from('alumnos')
            .insert({
              perfil_id:
                nuevoUsuario.id,

              matricula,

              semestre,

              grupo:
                null,

              turno,

              area_id:
                areaIdFinal,
            })


        if (!alumnoError) {
          alumnoCreado =
            true

          matriculaFinal =
            matricula

          break
        }


        ultimoError =
          alumnoError


        // PostgreSQL:
        // 23505 = unique_violation
        //
        // Si la matrícula colisionó,
        // volvemos a intentarlo.

        if (
          alumnoError.code !==
          '23505'
        ) {
          throw alumnoError
        }
      }


      if (!alumnoCreado) {
        throw (
          ultimoError ||
          new Error(
            'No se pudo generar una matrícula única.'
          )
        )
      }


      // ==================================================
      // RESPUESTA EXITOSA
      // ==================================================

      return respuesta({
        success: true,

        matricula:
          matriculaFinal,

        user_id:
          nuevoUsuario.id,

        semestre,

        turno,

        area_id:
          areaIdFinal,
      })


    } catch (databaseError) {

      // ==================================================
      // ROLLBACK DE AUTH
      // ==================================================

      await supabaseAdmin
        .auth
        .admin
        .deleteUser(
          nuevoUsuario.id
        )


      throw databaseError
    }


  } catch (error) {

    console.error(
      'crear-alumno:',
      error
    )


    return respuesta(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado.',
      },
      500
    )
  }
})


// ==================================================
// RESPUESTA JSON
// ==================================================

function respuesta(
  body:
    Record<string, unknown>,

  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        ...corsHeaders,

        'Content-Type':
          'application/json',
      },
    }
  )
}