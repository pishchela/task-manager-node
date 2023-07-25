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

    xtest('Should not delete another users task', async () => {
        const response = await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${anotherMockUser.tokens[0].token}`)
            .expect(404);

        const task = await Task.findById(taskOne._id);
        expect(task).not.toBeNull();
    });
});
