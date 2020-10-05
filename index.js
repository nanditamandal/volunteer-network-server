const express = require('express')
const bodyParser = require('body-parser')
const cors =require('cors')

const MongoClient = require('mongodb').MongoClient;
const ObjectId= require('mongodb').ObjectId;
const admin = require('firebase-admin');
require('dotenv').config();

const app = express()
app.use(cors())
app.use(bodyParser.json())
const port = 5000


var serviceAccount = require("./configs/volunteernetwork-74cf1-firebase-adminsdk-po3nl-a42b9e7169.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kxnhm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("volunteer-network").collection("volunteringItem");
  const eventCollection = client.db('volunteer-network').collection('event');

  app.post('/addVolunteering', (req, res)=>{
      const volunteeringItem = req.body;
      console.log(volunteeringItem)
      collection.insertMany(volunteeringItem)
      .then( result=>{
        console.log(result.insertedCount)
        res.send(result);
        
    })
  })

  app.get('/allVolunteerItem',(req, res)=>{
    collection.find({})
    .toArray((err, result)=>{
      console.log(err);
      console.log(result);
     
      res.send(result);
    })
  })

  app.get('/findEven/:id', (req, res)=>{
    console.log(req.params.id);
    collection.find({_id: ObjectId(req.params.id)})
    .toArray((err, document)=>{
        res.send(document[0]);
    })
})

  app.post('/addEvent', (req, res)=>{
    const volunteeringItem = req.body;
    eventCollection.insertOne(volunteeringItem)
    .then( result=>{
      console.log(result.insertedCount)
      res.send("send data");
      
  })
})

app.get('/volunteerEvent',(req, res)=>{

  const bearer =req.headers.authorization;
 
  if(bearer && bearer.startsWith("Bearer ")){
    const idToken= bearer.split(' ')[1];
 
    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      // let uid = decodedToken.uid;
      let tokenEmail = decodedToken.email;
      if(tokenEmail == req.query.email)
      {
                
        eventCollection.find({email: req.query.email})
          .toArray((err, documents)=>{
            res.send(documents)
          })

      }
      console.log({uid})
      // ...
    }).catch(function(error) {
      // Handle error
    });
  }else{
    res.status(401).send("un-authorized access");
  }
})

app.delete('/deleteEvent/:id',(req, res)=>{
  
    eventCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then( result=>{
        res.send(result.deletedCount>0);
    })

} )

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  console.log("database is started ")
  
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})