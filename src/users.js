const jwt = require('jsonwebtoken');
const { connectDb } = require('./dbConnect');

exports.createUser = (req, res) => {
  // first, lets do some vailidation.. valid email, valid password
  if (!req.body || !req.body.email || !req.body.password) {
    //say that this is an invalid request
    res.status(400).send({
      success: false,
      message: 'Invalid Request',
    });
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
    .then((doc) => {
      const user = {
        id: doc.id,
        email: newUser.email,
        isAdmin: false,
        userRole: 5,
      };

      const token = jwt.sign(user, 'doNotShareYourSecret'); //protect this secret
      res.status(201).send({
        success: true,
        message: 'Account Created',
        token,
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

exports.loginUser = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send({
      success: false,
      message: 'Invalid Request',
    });
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
      const token = jwt.sign(user[0], 'doNotShareYourSecret'); //protect this secret
      res.send({
        success: true,
        message: 'Login Succesful',
        token, // user[0]sends back the first user with thomas@myspace.com
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

exports.getUsers = (req, res) => {
  //before protect..Make sure user sent authorization token
  if (!req.headers.authorization) {
    return res.status(403).send({
      success: false,
      message: 'No Authorization token found',
    });
  }
  //protect this route with JWT
  //In practice we would write a function called middleware... add in app.get / app.post

  const decode = jwt.verify(req.headers.authorization, 'doNotShareYourSecret');
  console.log('NEW REQUEST BY: ', decode.email);
  if (decode.userRole > 5) {
    return res.status(401).send({
      succes: false,
      message: 'Not Authorized',
    });
  }
  const db = connectDb();
  db.collection('users')
    .get()
    .then((snapshot) => {
      const users = snapshot.docs.map((doc) => {
        let user = doc.data();
        user.id = doc.id;
        user.password = undefined;
        return user;
      });
      res.send({
        success: true,
        message: 'Users returned',
        users,
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};
