import { Router } from 'express'
import { completeOnboarding } from '../controllers/user.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.patch('/complete-onboarding', protect, completeOnboarding)

export default router