require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const AiRecommendation = require('../models/AiRecommendation');
const CourseExtended = require('../models/CourseExtended');
const EmotionalResult = require('../models/EmotionalResult');
const Habit = require('../models/Habit');
const Notification = require('../models/Notification');
const PerformanceMetric = require('../models/PerformanceMetric');
const ProgressTracking = require('../models/ProgressTracking');
const StudyMethod = require('../models/StudyMethod');
const StudySchedule = require('../models/StudySchedule');
const StudySession = require('../models/StudySession');
const Task = require('../models/Task');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding');

  // Example minimal inserts based on provided samples
  const user = await User.findOneAndUpdate(
    { Email_User: 'PepitoG@gmail.com' },
    { Age_User:21, Career_User:'Ingeniería de Sistemas', Courses_User:6, Email_User:'PepitoG@gmail.com', Last_Name_User_1:'Gomez', Last_name_User_2:'Mamani', Name_User:'Pepito', Password_user:'123456', Registration_Date:new Date('2026-05-12'), Study_Goal_Student:'Mejorar productividad', University_User:'UTP' },
    { upsert: true, new: true }
  );

  await AiRecommendation.updateOne({ Recommendation_Text_AI: 'Descansa cada 25 minutos' }, { Recommendation_Type_AI: 'Pomodoro', Recommendation_Text_AI: 'Descansa cada 25 minutos', Generated_Date_AI: new Date('2026-05-12'), user_id: user._id }, { upsert: true });

  await CourseExtended.updateOne({ Name_Course: 'Base de Datos' }, { Name_Course:'Base de Datos', Hours_Course:4, Priority_Level_Course:2, Teacher_Course:'Carlos Ruiz', Times_A_Week_Course:3, user_id: user._id }, { upsert: true });

  await EmotionalResult.updateOne({ Notes_Result: 'Muchos trabajos' }, { Stress_Level:7, Energy_Level:5, Motivation_Level:8, Mood_Result:'Cansado', Notes_Result:'Muchos trabajos', Evaluation_Date:new Date('2026-05-12'), user_id: user._id }, { upsert: true });

  await Habit.updateOne({ Habit_Name:'Leer' }, { Habit_Name:'Leer', Frequency_Per_Week:5, Habit_Status:'Activo', user_id:user._id }, { upsert: true });

  await Notification.updateOne({ Title:'Recordatorio' }, { Title:'Recordatorio', Message:'Tienes una tarea pendiente', Notification_Date:new Date('2026-05-12'), Status:'No leído', user_id:user._id }, { upsert: true });

  await PerformanceMetric.updateOne({ id_user: user._id }, { Concentration_Level:8.5, Efficiency_Level:7.2, Study_Consistency:9, Academic_Performance:8.7, Metric_Date:new Date('2026-05-12'), id_user:user._id }, { upsert: true });

  await ProgressTracking.updateOne({ user_id: user._id }, { Completed_Tasks:10, Study_Hours:25, Productivity_Level:8.4, Weekly_Progress:70, Monthly_Progress:85, user_id:user._id }, { upsert: true });

  await StudyMethod.updateOne({ Name_Method:'Pomodoro' }, { Name_Method:'Pomodoro', Description_Method:'Método de estudio por intervalos', Scientific_Evidence:'Mejora la concentración', Difficulty_Level:2 }, { upsert: true });

  await StudySchedule.updateOne({ user_id: user._id }, { Date_Schedule:new Date('2026-05-12'), Start_Time_Schedule:'17:00', End_Time_Schedule:'19:00', Break_Time:15, user_id:user._id }, { upsert: true });

  await StudySession.updateOne({ Duration_Hours:2 }, { Session_Date:new Date('2026-05-12'), Start_Time:'18:00', End_Time:'20:00', Duration_Hours:2, Focus_Level:8 }, { upsert: true });

  await Task.updateOne({ Name_Task:'Hacer UML' }, { Name_Task:'Hacer UML', Description_Task:'Completar diagrama UML', Creation_Date_Task:new Date('2026-05-12'), Due_Date_Task:new Date('2026-05-20'), Priority_Level_Task:3, Estimated_Hours:5, Status_Task:'Pendiente', Progress_Percentage:40 }, { upsert: true });

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err=>{ console.error(err); process.exit(1); });
