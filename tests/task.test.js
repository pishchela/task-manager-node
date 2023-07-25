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

// TODO:
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks
