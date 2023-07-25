const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {
    mockUser,
    mockUserId,
    setupDatabase,
} = require('./fixtures/db');

describe('Users tests', () => {

    beforeEach(setupDatabase);

    test('Should signup a new user', async () => {
        const signupUser = {
            name: 'Mock name',
            email: 'mock@example.com',
            password: 'p@ssw0rd',
        }

        const response = await request(app)
            .post('/user')
            .send(signupUser)
            .expect(201);

        // Assert that the database was changed correctly;
        const user = await User.findById(response.body.user._id);
        expect(user).not.toBeNull();

        // Assertions about the response;
        expect(response.body).toMatchObject({
            user: {
                name: signupUser.name,
                email: signupUser.email,
            },
            token: user.tokens[0].token,
        });
        expect(user.password).not.toBe(signupUser.password);
    });

    test('Should login existing user', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: mockUser.email,
                password: mockUser.password,
            })
            .expect(200);

        const user = await User.findById(response.body.user._id);
        expect(user).not.toBeNull();

        expect(response.body).toMatchObject({
            token: user.tokens[1].token,
        });
    });

    test('Should not login nonexistent user', async () => {
        await request(app)
            .post('/users/login')
            .send({
                email: mockUser.email,
                password: mockUser.password + 'wrong password',
            })
            .expect(400);
    });

    test('Should get profile for user', async () => {
        await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .send()
            .expect(200);
    });

    test('Should not get profile for unauthenticated user', async () => {
        await request(app)
            .get('/users/me')
            .send()
            .expect(401);
    });

    test('Should remove users account for authenticated user', async () => {
        const response = await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .send()
            .expect(200);

        const user = await User.findById(mockUserId);
        expect(user).toBeNull();
    });

    test('Should not remove users account for unauthenticated user', async () => {
        await request(app)
            .delete('/users/me')
            .send()
            .expect(401);
    });

    test('Should upload avatar image', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
            .expect(200);

        const user = await User.findById(mockUserId);
        expect(user.avatar).toEqual(expect.any(Buffer));
    });

    test('Should update valid user fields', async () => {
        const updatedName = 'Updated name';
        const response = await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .send({
                name: updatedName,
            })
            .expect(201);

        const user = await User.findById(mockUserId);
        expect(user.name).toBe(updatedName);

    });

    test('Should not update invalid user fields', async () => {
        const response = await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${mockUser.tokens[0].token}`)
            .send({
                wrongField: 'wrong field',
            })
            .expect(400);
    });
});

