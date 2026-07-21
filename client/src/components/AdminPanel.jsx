import { useState, useEffect, useCallback } from 'react'
import './AdminPanel.css'
import {
  listUsersApi,
  updateUserRoleApi,
  deleteUserApi,
  getAdminStatsApi
} from '../api/admin'

function StatCard({ label, value }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  )
}

export default function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [pendingId, setPendingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const loadData = useCallback(async (searchTerm = '') => {
    setLoading(true)
    setErrorMsg('')
    try {
      const [usersRes, statsRes] = await Promise.all([
        listUsersApi(searchTerm),
        getAdminStatsApi()
      ])
      setUsers(usersRes.users || [])
      setStats(statsRes)
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo cargar la información del panel.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (e) => {
    e.preventDefault()
    loadData(search)
  }

  const handleRoleChange = async (userId, newRole) => {
    setPendingId(userId)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await updateUserRoleApi(userId, newRole)
      setSuccessMsg('Rol actualizado correctamente.')
      await loadData(search)
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo actualizar el rol.')
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (userId) => {
    setPendingId(userId)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await deleteUserApi(userId)
      setSuccessMsg('Usuario eliminado correctamente.')
      setConfirmDeleteId(null)
      await loadData(search)
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar el usuario.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="admin-panel fade-in">
      <div className="cal-header-top">
        <div className="cal-header-text">
          <h1>Panel de administrador</h1>
          <p>Administra los usuarios registrados y consulta el estado general de la plataforma.</p>
        </div>
      </div>

      {stats && (
        <div className="admin-stats-grid">
          <StatCard label="Usuarios totales" value={stats.totalUsers} />
          <StatCard label="Administradores" value={stats.totalAdmins} />
          <StatCard label="Estudiantes" value={stats.totalStudents} />
          <StatCard label="Cursos registrados" value={stats.totalCourses} />
          <StatCard label="Horarios generados" value={stats.totalSchedules} />
        </div>
      )}

      {errorMsg && <div className="admin-alert admin-alert-error">{errorMsg}</div>}
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}

      <form className="admin-search-row" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por nombre, correo o universidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="primary-button">Buscar</button>
        {search && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => { setSearch(''); loadData('') }}
          >
            Limpiar
          </button>
        )}
      </form>

      <div className="admin-table-wrapper">
        {loading ? (
          <p className="admin-loading">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="admin-loading">No se encontraron usuarios.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Universidad</th>
                <th>Cursos</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = String(u._id) === String(currentUser?._id)
                return (
                  <tr key={u._id}>
                    <td>{u.Name_User} {u.Last_Name_User_1}</td>
                    <td>{u.Email_User}</td>
                    <td>{u.University_User || '—'}</td>
                    <td>{u.Courses_User ?? 0}</td>
                    <td>
                      <span className={`admin-role-badge role-${u.role}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Estudiante'}
                      </span>
                    </td>
                    <td className="admin-actions-cell">
                      <select
                        value={u.role}
                        disabled={pendingId === u._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="student">Estudiante</option>
                        <option value="admin">Administrador</option>
                      </select>

                      {confirmDeleteId === u._id ? (
                        <span className="admin-confirm-row">
                          <button
                            className="admin-danger-button"
                            disabled={pendingId === u._id}
                            onClick={() => handleDelete(u._id)}
                          >
                            Confirmar
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          className="admin-danger-button"
                          disabled={isSelf || pendingId === u._id}
                          title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                          onClick={() => setConfirmDeleteId(u._id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
