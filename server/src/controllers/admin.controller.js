import userRepository from '../repositories/user.repository.js'
import courseRepository from '../repositories/course.repository.js'
import scheduleRepository from '../repositories/schedule.repository.js'
import { logAction } from '../utils/audit.js'

// GET /api/admin/users?search=texto
export const listUsers = async (req, res) => {
  try {
    const { search } = req.query
    const allUsers = await userRepository.findAll()

    if (!search?.trim()) {
      return res.json({ users: allUsers, total: allUsers.length })
    }

    const term = search.trim().toLowerCase()
    const filtered = allUsers.filter((u) =>
      u.Name_User?.toLowerCase().includes(term) ||
      u.Email_User?.toLowerCase().includes(term) ||
      u.University_User?.toLowerCase().includes(term)
    )

    return res.json({ users: filtered, total: filtered.length })
  } catch (e) {
    console.error('ADMIN LIST USERS ERROR:', e)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// PATCH /api/admin/users/:id/role   body: { role: 'admin' | 'student' }
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ message: "El rol debe ser 'admin' o 'student'" })
    }

    // Un admin no puede quitarse el rol a sí mismo por accidente
    if (String(req.user._id) === String(id) && role !== 'admin') {
      return res.status(400).json({ message: 'No puedes quitarte el rol de administrador a ti mismo' })
    }

    // Evitar dejar la plataforma sin ningún administrador
    if (role === 'student') {
      const adminCount = await userRepository.countByRole('admin')
      const target = await userRepository.findById(id)
      if (target?.role === 'admin' && adminCount <= 1) {
        return res.status(400).json({ message: 'Debe existir al menos un administrador en la plataforma' })
      }
    }

    const updatedUser = await userRepository.updateById(id, { role })
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    await logAction({
      userId: req.user._id,
      action: 'ADMIN_UPDATE_ROLE',
      resource: 'users',
      req,
      detail: `Rol de ${id} actualizado a ${role}`
    })

    return res.json({ user: updatedUser })
  } catch (e) {
    console.error('ADMIN UPDATE ROLE ERROR:', e)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta desde el panel' })
    }

    const target = await userRepository.findById(id)
    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (target.role === 'admin') {
      const adminCount = await userRepository.countByRole('admin')
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Debe existir al menos un administrador en la plataforma' })
      }
    }

    await userRepository.deleteById(id)

    await logAction({
      userId: req.user._id,
      action: 'ADMIN_DELETE_USER',
      resource: 'users',
      req,
      detail: `Usuario eliminado: ${id}`
    })

    return res.json({ message: 'Usuario eliminado correctamente' })
  } catch (e) {
    console.error('ADMIN DELETE USER ERROR:', e)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalCourses, totalSchedules] = await Promise.all([
      userRepository.countAll(),
      userRepository.countByRole('admin'),
      courseRepository.countAll(),
      scheduleRepository.countAll()
    ])

    return res.json({
      totalUsers,
      totalAdmins,
      totalStudents: totalUsers - totalAdmins,
      totalCourses,
      totalSchedules
    })
  } catch (e) {
    console.error('ADMIN STATS ERROR:', e)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}
