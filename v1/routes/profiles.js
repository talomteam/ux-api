let express = require('express');
let router = express.Router();
let pg = require('pg')
let path = require('path')
let md5 = require('md5');


const config = {
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: 10,
  idleTimeoutMillis: 30000
};

console.log(config);

let pool = new pg.Pool(config);

router.get('/',(req,res,next) => {
  const results = {};
  results.profiles = [];
  //const data = {text: req.body.text, complete: false};
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('SELECT * FROM profiles ;');
    query.on('row', (row) => {

      results.profiles.push(row);
    });
    query.on('end', () => {
      done();
      
      return res.json(results);
    });
  });
});

router.get('/:id',(req,res,next) => {
  const results = {};
  const id = req.params.id
  results.profiles = [];
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('SELECT * FROM profiles WHERE id = '+ id);
    query.on('row', (row) => {
      results.profiles .push(row);
    });
    query.on('end', () => {
      done();
      
      return res.json(results);
    });
  });
});

router.post('/',(req,res,next) => {
  const results = [];
  let data = req.body;
  console.log(req.body);
  let id = md5(data.name)
  console.log(id)
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    
    let query = client.query ('INSERT INTO profiles (id,data) VALUES ($1,$2)',[id,data]);

    query.on('error',(err) => {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
    });
   
    query.on('end', () => {
      done();
      
      return res.json({success: true, data: ''});
    });
    
  });
});

router.put('/:id',(req,res,next) => {
  let results = [];
  let id = req.params.id
  const data = req.body;
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('UPDATE profiles SET data=($1) where id =($2)',[data,id]);
    query.on('error', (row) => {
       return res.status(500).json({success: false, data: err});
    });
    query.on('end', () => {
      done();
      
      return res.json({success: true, data: ''});
    });
  });
});

router.delete('/:id',(req,res,next) => {
  let results = [];
  const id = req.params.id

  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('DELETE FROM profiles where id =($1)',[id]);
    query.on('error', (row) => {
       console.log("query error");
       return res.status(500).json({success: false, data: err});
    });
    query.on('end', () => {
      done();
      
      return res.json({success: true, data: ''});
    });
  });
});


module.exports = router;
