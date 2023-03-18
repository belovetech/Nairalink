// process.on('uncaughtException', (err) => {
//   console.log(`${err.name}: ${err.message}`);
//   console.log('SHUTTING DOWN SOON.............🔥');
//   process.exit(1);
// });
import app from './app';

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
  if (err) return console.log(`Cannot listen on port ${port}`);
  console.log(`Listening on port ${port}`);
});
