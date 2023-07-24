const app = require('./app');
const port = process.env.PORT;

app.listen(port, () => {
   console.warn('server is up on port ' + port);
});
