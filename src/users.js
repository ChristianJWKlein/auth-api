const { connectDb } = require('./dbConnect');

exports.createUser = (req, res) => {
  // first, lets do some vailidation.. valid email, valid password
  if (!req.body || !req.body.email || !req.body.password) {
    //say that this is an invalid request
    res.status(400).send('Invalid Request');
    return; //return because express does not like to res.sends in a single post
  }
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    isAdmin: false,
    userRole: 5,
    //We set userRole and if admin, so newUser can't add themselves in as highevel user or admin
  };

  const db = connectDb();
  db.collection('users')
    .add(newUser)
    .then(() => {
      //TODO: create a JWT and Send back the token
      res.status(201).send('Account created');
    })
    .catch((err) => res.status(500).send(err));
};
