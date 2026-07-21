import { Router } from 'express'
import { listUsers, updateUserRole, deleteUser, getStats } from '../controllers/admin.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

router.use(protect, isAdmin)

router.get('/users', listUsers)
router.patch('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)
router.get('/stats', getStats)

export default router
