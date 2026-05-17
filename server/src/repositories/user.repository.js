import User from '../models/User.model.js'

export class UserRepository {
  async findByEmail(email) {
    // Incluimos Password_user para poder comparar en login
    return User.findOne({ Email_User: email.toLowerCase() }).select('+Password_user')
  }

  async findById(id) {
    return User.findById(id).select('-Password_user')
  }

  async create(data) {
    return User.create(data)
  }

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true }).select('-Password_user')
  }

  async findAll() {
    return User.find().select('-Password_user')
  }
}

export default new UserRepository()