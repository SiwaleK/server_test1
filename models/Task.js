
const mongoose = require('mongoose')
const {Schema} = mongoose

const TaskSchema = new Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
      
    },
    taskTitle: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
   
    },
    
      startTime: {
      type: String,
 
    },
      stopTime: {
      type: String,

    },
    elapsedTime: {
        type: String,

      },
      isRunning: {
        type: Boolean,
      },
      date: {
        type : Date
      }

  });
  
const TaskModel = mongoose.model('Task', TaskSchema);

module.exports = TaskModel;