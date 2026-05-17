import StudySchedule from '../models/Schedule.model.js'

export class ScheduleRepository {
  async create(data) {
    return StudySchedule.create(data)
  }

  async findLatestByUser(userId) {
    return StudySchedule.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate('courses')
  }

  async findAllByUser(userId) {
    return StudySchedule.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('courses')
  }
}

export default new ScheduleRepository()