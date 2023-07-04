const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

/// express middleware examples
// app.use((req, res, next) => {
//    console.warn(req.method, req.path);
//    if (req.method === 'GET') {
//       res.send('GET REQUESTS are disabled')
//    } else {
//       next();
//    }
// });

// app.use((req, res, next) => {
//    res.status(503).send('server is currently down');
// });
///

// const multer = require('multer');
// const upload = multer({
//    dest: 'images',
// });
//
// app.post('/upload', upload.single('upload'), (req, res) => {
//    res.send();
// })

app.use(express.json()); // parses incoming JSONs;
app.use(userRouter);
app.use(taskRouter);


////////////
const Task = require('./models/task');
const User = require('./models/user');

const testingExec = async () => {
   // const task = await Task.findById('648d073d6c8e10704d9d2a21');
   // await task.populate('owner');
   // console.warn(task.owner);

   /////////

   // const user = await User.findById('648d061fd3f158da92169719');
   // await user.populate('tasks');
   // console.warn(user.tasks);
}

// testingExec();


app.listen(port, () => {
   console.warn('server is up on port ' + port);
});
