const express = require('express');
const { updateTask, test, registerUser, loginUser, postTask, getTasksALL, getProfile, deleteTask} = require('../controller/authController')
const router = express.Router();
const cors = require('cors');

//middleware

router.use(
    cors({
        credentials: true,
        origin:'http://localhost:3000'
    })
)

router.get('/' ,test);
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/task', postTask)
router.get('/task',getTasksALL)
router.put('/task/:id', updateTask)
router.delete('/task/:id', deleteTask)
router.get('/profile' ,getProfile);

module.exports = router