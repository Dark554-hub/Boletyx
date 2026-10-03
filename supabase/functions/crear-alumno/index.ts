import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
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
    } = await supabaseUsuario.auth.getUser()

    if (userError || !user) {
      return respuesta(
        {
          success: false,
          error: 'No se pudo validar la sesión.',
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
    } = await supabaseAdmin
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

    const body = await req.json()

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

    const grupo =
      String(body.grupo || '').trim()

    const turno =
      String(body.turno || '')
        .trim()
        .toLowerCase()

    // ==================================================
    // VALIDACIONES
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

    if (
      !Number.isInteger(semestre) ||
      semestre < 1 ||
      semestre > 6
    ) {
      return respuesta(
        {
          success: false,
          error: 'Semestre no válido.',
        },
        400
      )
    }

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
    // CREAR USUARIO EN AUTH
    // ==================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
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

    const nuevoUsuario = authData.user

    if (!nuevoUsuario) {
      throw new Error(
        'Supabase no devolvió el nuevo usuario.'
      )
    }

    try {
      // ==================================================
      // CREAR PERFIL
      // ==================================================

      const { error: perfilError } =
        await supabaseAdmin
          .from('perfiles')
          .insert({
            id: nuevoUsuario.id,
            nombre,
            apellido,
            rol: 'alumno',
          })

      if (perfilError) {
        throw perfilError
      }

      // ==================================================
      // GENERAR MATRÍCULA ÚNICA
      // ==================================================

      let alumnoCreado = false
      let matriculaFinal = ''
      let ultimoError: unknown = null

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
        } = await supabaseAdmin
          .from('alumnos')
          .select('matricula')
          .like('matricula', `${anio}%`)

        if (matriculaError) {
          throw matriculaError
        }

        let mayorNumero = 0

        for (const alumno of alumnosAnio || []) {
          const matriculaActual =
            String(alumno.matricula || '')

          const consecutivo =
            Number(
              matriculaActual.slice(4)
            )

          if (
            Number.isInteger(consecutivo) &&
            consecutivo > mayorNumero
          ) {
            mayorNumero = consecutivo
          }
        }

        const siguiente =
          String(mayorNumero + 1)
            .padStart(4, '0')

        const matricula =
          `${anio}${siguiente}`

        const { error: alumnoError } =
          await supabaseAdmin
            .from('alumnos')
            .insert({
              perfil_id: nuevoUsuario.id,
              matricula,
              semestre,
              grupo: grupo || null,
              turno,
            })

        if (!alumnoError) {
          alumnoCreado = true
          matriculaFinal = matricula
          break
        }

        ultimoError = alumnoError

        // 23505 = unique_violation
        if (alumnoError.code !== '23505') {
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
        matricula: matriculaFinal,
        user_id: nuevoUsuario.id,
      })
    } catch (databaseError) {
      // Si falla la creación del perfil o alumno,
      // eliminar también la cuenta de Auth.
      await supabaseAdmin.auth.admin.deleteUser(
        nuevoUsuario.id
      )

      throw databaseError
    }
  } catch (error) {
    console.error('crear-alumno:', error)

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

function respuesta(
  body: Record<string, unknown>,
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