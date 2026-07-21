// Debe usarse siempre después de `protect`, ya que depende de req.user
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido a administradores' })
  }

  next()
}
