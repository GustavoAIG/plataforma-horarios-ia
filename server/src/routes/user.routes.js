import { Router } from 'express'
import { completeOnboarding, updateProfile } from '../controllers/user.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.patch('/complete-onboarding', protect, completeOnboarding)
router.patch('/profile', protect, updateProfile)

export default router