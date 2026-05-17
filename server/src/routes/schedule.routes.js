import { Router } from 'express'
import { generate, getLatest, getAll } from '../controllers/schedule.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(protect)
router.post('/generate', generate)
router.get('/latest', getLatest)
router.get('/', getAll)
export default router