import Course from '../models/Course.model.js'

export class CourseRepository {
  async findByUser(userId) {
    return Course.find({ user: userId })
  }

  async findByIdAndUser(id, userId) {
    return Course.findOne({ _id: id, user: userId })
  }

  async findManyByUser(ids, userId) {
    return Course.find({ _id: { $in: ids }, user: userId })
  }

  async create(data) {
    return Course.create(data)
  }

  async updateByIdAndUser(id, userId, data) {
    return Course.findOneAndUpdate({ _id: id, user: userId }, data, { new: true })
  }

  async deleteByIdAndUser(id, userId) {
    return Course.findOneAndDelete({ _id: id, user: userId })
  }
}

export default new CourseRepository()