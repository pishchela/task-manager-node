const express = require('express');
const Task = require("../models/task");
const router = new express.Router();
const auth = require("../middleware/auth");

// /tasks?completed=true
// /tasks?limit=10&skip=0
// /tasks?sortBy=createdAt&sortOrder=asc
router.get('/tasks', auth, async (req, res) => {
    const pageOptions = {
        page: parseInt(req.query.page, 10) || 0,
        limit: parseInt(req.query.limit, 10) || 10
    }
    const filter = {
        owner: req.user._id,
    };

    // if (req.query.sortBy) {
    //     sort[req.query.sortBy] = req.query?.sortOrder === 'desc' ? -1 : 1;
    // }
    if (req.query?.completed) {
        filter.completed = req.query.completed === 'true';
    }

    try {
        const tasks = await Task
            .find(filter)
            .skip(pageOptions.page * pageOptions.limit)
            .limit(pageOptions.limit);
        res.status(201).send(tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id});
        if (!task) {
            res.status(404).send();
        } else {
            res.status(201).send();
        }
    } catch {
        res.status(500).send();
    }
});

router.delete('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id;
    try {
        await Task.findOneAndDelete({ _id, owner: req.user._id});
        const count = await Task.count({ completed: false });
        res.status(201).send('length: ' + count);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/tasks/all', auth, async (req, res) => {
   const ownerId = req.user._id;
    try {
       const deleted = await Task.deleteMany({ owner: ownerId });
       res.status(200).send(deleted?.deletedCount);
   } catch {
       res.status(500).send('smth went wrong');
   }
});


router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!' });
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send('not found');
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.status(201).send(task);
   } catch (e) {
       res.status(500).send(e);
   }
});


router.post('/task', auth, async (req, res) => {
    const user = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await user.save();
        res.status(201).send('saved!');
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
