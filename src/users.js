const { connectDb } = require('./dbConnect');

exports.createUser = (req, res) => {
  // first, lets do some vailidation.. valid email, valid password
  if (!req.body || !req.body.email || !req.body.password) {
    //say that this is an invalid request
    res.status(400).send('Invalid Request');
    return; //return because express does not like to res.sends in a single post
  }
  const newUser = {
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    isAdmin: false,
    userRole: 5,
    //We set userRole and if admin, so newUser can't add themselves in as highevel user or admin
  };

  const db = connectDb();
  db.collection('users')
    .add(newUser)
    .then(() => {
      const user = {
        id: doc.id,
        email: newUser.email,
        isAdmin: false,
        userRole: 5,
      };

      //TODO: create a JWT and Send back the token
      res.status(201).send({
        success: true,
        message: 'Account Created',
        token: user, //add this to token later
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err, //add this to token later
      })
    );
};

exports.loginUser = () => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send('Invalid Request');
    return;
  }
  const db = connectDb();
  db.collection('users')
    .where('email', '==', req.body.email.toLowerCase())
    .where('password', '==', req.body.password) //== passed as sting so js does not check for equality
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        //bad login
        res.status(401).send({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }
      //good login
      const users = snapshot.docs.map((doc) => {
        let user = doc.data();
        user.id = doc.id;
        user.password = undefined;
        return user;
      });
      res.send({
        success: true,
        message: 'Login Succesful',
        token: users[0],
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err, //add this to token later
      })
    );
};
