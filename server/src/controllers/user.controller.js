import userRepository from '../repositories/user.repository.js'

export const completeOnboarding = async (req, res) => {
  try {
    const user = await userRepository.updateById(req.user._id, {
      hasCompletedOnboarding: true
    })
    res.json({ ok: true, user })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}