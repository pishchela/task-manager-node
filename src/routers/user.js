const express = require('express');
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({
    dest: 'avatars',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a in jpg/jpeg/png format'));
        }
        cb(undefined, true);
    },
    storage,
});

router.post('/user', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        res.status(201).send(user);
    } catch (e) {
        res.status(404).send();
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const _body = req.body;
    const permittedFields = ['name', 'age', 'email'];
    try {
        Object.keys(_body).forEach((item) => {
            if (!permittedFields.includes(item)) {
                throw new Error(`no ${item} field in the user`);
            }
        });
        const updatedUser = await req.user.updateOne(_body, { new: true, runValidators: true });
        res.status(201).send(updatedUser);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }

});


router.post('/users/login', async (req, res) => {
    const body = req.body;
    try {
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/logoutAll', async (req, res) => {
    try {
        let updatedUsers = await User.updateMany({}, { tokens: []});
        res.status(201).send(updatedUsers);
    } catch (e) {
        res.status(500).send(e);
    }
});


router.delete('/users/me', auth, async (req, res) => {
   try {
       await req.user.deleteOne();
       res.status(200).send(req.user);

   } catch (e) {
       res.status(500).send(e);
   }
});




router.post('/users/me/avatar', [auth, upload.single('avatar')], async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.status(200).send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

module.exports = router;
