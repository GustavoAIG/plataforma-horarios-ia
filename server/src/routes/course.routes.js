import { Router } from 'express'
import { getCourses, createCourse, updateCourse, deleteCourse, analyzeMalla } from '../controllers/course.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(protect)
router.get('/', getCourses)
router.post('/', createCourse)
router.post('/analyze-malla', analyzeMalla)
router.put('/:id', updateCourse)
router.delete('/:id', deleteCourse)
export default router