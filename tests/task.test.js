const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const {
    mockUser,
    mockUserId,
    anotherMockUserId,
    anotherMockUser,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase,
} = require('./fixtures/db');

describe('Tasks tests', () => {

    beforeEach(setupDatabase);

    test('Should create task for user', async () => {
        const response = await request(app)
            .post('/task')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .send({
                description: 'describing task',
            })
            .expect(201);


        const task = await Task.findById(response.body._id);

        expect(task).not.toBeNull();
        expect(task.completed).toBeFalsy();
    });

    test('Should return all users tasks', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    test('Should not delete another users task', async () => {
        const response = await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${anotherMockUser.tokens[0].token}`)
            .expect(201);

        const task = await Task.findById(taskOne._id);
        expect(task).not.toBeNull();
    });

    test('Should not create task with invalid description/completed', async () => {
        await request(app)
            .post('/task')
            .set('Authorization', `Bearer ${anotherMockUser.tokens[0].token}`)
            .send({
                description: [false, false, false],
            })
            .expect(500);
    });

    test('Should not create task with invalid description/completed', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .send({
                completed: [false, false, false],
            })
            .expect(500);
    });

    test('Should delete user task', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${anotherMockUser.tokens[0].token}`)
            .expect(201);
    });

    test('Should not delete task if unauthenticated', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .expect(401);
    });

    test('Should not fetch user task by id if unauthenticated', async () => {
        await request(app)
            .get('/tasks')
            .expect(401);
    });

    test('Should fetch user task by id', async () => {
        const response = await request(app)
            .get(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .expect(201);

        expect(response.body.description).toBe(taskOne.description);
    });

    test('Should fetch page of tasks', async () => {
        const response = await request(app)
            .get(`/tasks/`)
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    test('Should not fetch other users task by id', async () => {
        await request(app)
            .get(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${anotherMockUser.tokens[0].token}`)
            .expect(404);
    });

    test('Should not update other users task', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${anotherMockUser.tokens[0].token}`)
            .send({
                description: 'some new description',
            })
            .expect(404);

        const task = await Task.findById(taskOne._id);
        expect(task.description).toBe(taskOne.description);
    });
});
