import mongoose from 'mongoose';

const fail = e => {
  console.error(e);
  process.exit(1);
};

export default function connectDB(url) {
  const promise = mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => console.log('DB connected'))
    .catch(fail);
  mongoose.connection.on('error', fail);
  return promise;
}
