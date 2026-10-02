export default function DatosAdmin({ user }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#203A50]">
        Panel de Administración
      </h1>

      <p className="mt-2 text-gray-500">
        Bienvenido, {user.nombre}
      </p>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg text-[#203A50]">
          Control escolar
        </h2>

        <p className="mt-2 text-gray-500">
          Desde este módulo podrás gestionar alumnos y asignar matrículas.
        </p>
      </div>
    </div>
  )
}