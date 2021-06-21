const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqsch.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const employerCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("employer");
  const userCollection = client.db(`${process.env.DB_NAME}`).collection("user");
  const adminCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("admin");
  const jobsCollection = client.db(`${process.env.DB_NAME}`).collection("jobs");

  app.post("/userCreateAccount", (req, res) => {
    userCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount > 0);
    });
  });

  app.post("/createAccount", (req, res) => {
    employerCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount > 0);
    });
  });

  //seeker login code

  app.post("/seekerLogin", (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);
    userCollection
      .find({ email: req.body.email })
      .toArray()
      .then((result) => {
        if (result.length < 1) {
          console.log("user not found");
          return res.send(false);
        }
        userCollection
          .find({ password: req.body.password })
          .toArray()
          .then((documents) => {
            if (documents.length < 1) {
              console.log("password not found");
              return res.send(false);
            } else {
              res.send(true);
              console.log("successfully logged in");
            }
          });
      });
  });

  //employer login code
  app.post("/employerLogin", (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);
    employerCollection
      .find({ email: req.body.email })
      .toArray()
      .then((result) => {
        if (result.length < 1) {
          console.log("user not found");
          return res.send(false);
        }
        employerCollection
          .find({ password: req.body.password })
          .toArray()
          .then((documents) => {
            if (documents.length < 1) {
              console.log("password not found");
              return res.send(false);
            } else {
              res.send(true);
              console.log("successfully logged in");
            }
          });
      });
  });

  app.post("/postJob", (req, res) => {
    jobsCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount > 0);
    });
  });

  app.get("/pendingJobs", (req, res) => {
    jobsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //update  job status code from here

  app.patch("/updateStatus/:id", (req, res) => {
    console.log(req.body.optionValue);
    jobsCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: { status: req.body.optionValue },
        }
      )
      .then((result) => {
        console.log(result.modifiedCount > 0);
        res.send(result.modifiedCount > 0);
      });
  });
  app.get("/approvedJobs", (req, res) => {
    jobsCollection
      .find({ status: req.query.status })
      .toArray((err, documents) => {
        console.log(documents.length > 0);
        res.send(documents);
      });
    console.log(req.query);
  });

  app.post("/allJobs", (req, res) => {
    const search = req.body.search;
    const status = req.body.status;
    jobsCollection
      .find({
        status: status,
        positionName: { $regex: search },
      })
      .toArray((err, documents) => {
        console.log(documents.length > 0);
        res.send(documents);
      });
  });
  app.get("/checkEmployee", (req, res) => {
    employerCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        console.log(documents.length > 0);
        res.send(documents.length > 0);
      });
  });
  app.get("/checkAdmin", (req, res) => {
    adminCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        console.log(documents.length > 0);
        res.send(documents.length > 0);
      });
  });

  app.get("/employerJobs", (req, res) => {
    jobsCollection
      .find({ userEmail: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
    console.log(req.query.email);
  });

  //Admin login code

  app.post("/adminLogin", (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);
    adminCollection
      .find({ email: req.body.email })
      .toArray()
      .then((result) => {
        if (result.length < 1) {
          console.log("user not found");
          return res.send(false);
        }
        adminCollection
          .find({ password: req.body.password })
          .toArray()
          .then((documents) => {
            if (documents.length < 1) {
              console.log("password not found");
              return res.send(false);
            } else {
              res.send(true);
              console.log("successfully logged in");
            }
          });
      });
  });

  app.get("/profileInfo", (req, res) => {
    employerCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        if (documents.length > 1) {
          res.send(documents[0]);
          console.log("tumi employeer");
        } else {
          userCollection
            .find({ email: req.query.email })
            .toArray((err, result) => {
              if (result.length > 1) {
                res.send(result[0]);
                console.log("tumi job seeker");
              } else {
                adminCollection
                  .find({ email: req.query.email })
                  .toArray((err, data) => {
                    if (data.length > 1) {
                      res.send(data[0]);
                      console.log("tumi ADmin");
                    } else {
                      console.log("shomossha ki");
                    }
                  });
              }
            });
        }
      });
  });
});

app.listen(process.env.PORT || port);
