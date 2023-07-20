const User = require('../models/user')
const Task = require('../models/Task')
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const test = (req, res) => {
    res.json('test is working')
}
const { ObjectId } = require('mongoose');

// Register Endpoint 
const registerUser = async(req, res ) => {
    try{
        const {name, email, password} = req.body;
        // Check if name was entered
        if(!name) {
            return res.json({
                error:'name is required'
            })
        };
        // Check is password is good 
        if (!password || password.length < 6) {
            return res.json({
                error: 'Password is required and should be at least 6 characters long '
            })
        };
        //check email 
        const exist = await User.findOne({email}) 
        if (exist) {
            return res.json({
                error: 'Email is taken already'
            })
        }

        const hashedPassword  = await hashPassword(password)
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword  
        })
        return res.json(user)
    } catch(error) {

    }
};

//Login Endpoint
const loginUser = async( req, res) => {
    try{
        const {email, password} = req.body;
    
    // Check if user exists
    const user = await User.findOne({email}).maxTimeMS(15000);
    if (!user) {
        return res.json({
            error: 'No user found'
        })
    }
    // Verify Password
    const match = await comparePassword(password ,user.password)
    if (match) {
        jwt.sign(
          { email: user.email, id: user._id, name: user.name },
          process.env.JWT_SECRET,
          {},
          (err, token) => {
            if (err) throw err;
            // Return the token as a response
            res.json({ token });
            console.log(token);
          }
        );
      } else {
        res.json({
          error: 'Password does not match',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  };


// Get Profile

const getProfile = (req, res) => {
    if (req.cookies && req.cookies.token) {
      const { token } = req.cookies;
      jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
        if (err) throw err;
        res.json(user);
      });
    } else {
      res.json(null);
    }
  };
  

const postTask = async ( req, res) => {

    const token = req.headers.authorization.split(' ')[1];
    console.log('server side')
    console.log(token)
    if (token) {
        try {
        const {taskTitle, taskDescription } = req.body;
        console.log(taskTitle);
        console.log(taskDescription);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decodedToken.id;
        const task_id = new mongoose.Types.ObjectId();
        console.log(user_id);
        const currentDate = new Date();
        const task = new Task({
            user_id: user_id,
            taskTitle: taskTitle,
            taskDescription: taskDescription,
            startTime: null, // Initialize startTime as null
            stopTime: null, // Initialize stopTime as null
            elapsedTime: null,
            date: currentDate,
            isRunning:false, // 
           task_id:task_id,
        });
        await task.save();
        res.status(200).json({ message: 'Task created '})

    
    } catch (err) {
         res.status(500).json({error: 'Internal server erroring'})
         console.error(err);
        }
      } else {
        res.status(401).json({ error: 'Unauthorize'});
      }
      
};



const updateTask = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
    if (token) {
      try {
        const taskId = req.params.id;
        const updatedTask = req.body;
  
        try {
          // Update the task in the database
          const task = await Task.findByIdAndUpdate(taskId, updatedTask, { new: true });
          if (!task) {
            return res.status(404).json({ error: 'Task not found' });
          }
  
          res.status(200).json({ task });
          // Send a success status code (e.g., 200 OK) if the update was successful
        } catch (error) {
          console.error('Error updating task:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  

  const deleteTask = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const taskId = req.params.id.toString().trim(); // Get the taskId from the URL parameter
  
    if (token) {
      try {
        const task = await Task.deleteOne({ _id: taskId });
  
        if (!task) {
          console.log('taskId:');
          console.log(taskId); // Move this line above the 'return' statement
          return res.status(404).json({ error: 'Task not found' });
        }
  
        // If the task was successfully deleted
        res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ error: 'Server error' });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
const getTasksALL = async ( req ,res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user_id = decodedToken.id;
            
            const tasks = await Task.find({ user_id });
            // console.log("user id ")
           // console.log(tasks)
            res.status(200).json(tasks);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error'})
        }

    } else {
        res.status(401).json({ error:'Unauthorized' });
    }
}




module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    postTask,
    getTasksALL,
    updateTask,
    deleteTask

}