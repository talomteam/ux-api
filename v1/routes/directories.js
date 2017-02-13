let express = require('express');
let router = express.Router();
let pg = require('pg')
let path = require('path')
let md5 = require('md5');


const config = {
  user: '',
  database: 'ux_core',
  password: '',
  host: '127.0.0.1',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};


let pool = new pg.Pool(config);

router.get('/',(req,res,next) => {
  let results = {};
  results.directories = [];
  //const data = {text: req.body.text, complete: false};
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('SELECT * FROM directories ;');
    query.on('row', (row) => {

      results.directories.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.get('/:id',(req,res,next) => {
  let results = {};
  const id = req.params.id
  results.directories = [];
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('SELECT * FROM directories WHERE id = '+ id);
    query.on('row', (row) => {
      results.directories .push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.post('/',(req,res,next) => {
  let results = [];
  const data = req.body;
  let id = md5(data.name)
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    
    let query = client.query ('INSERT INTO directories (id,data) VALUES ($1,$2)',[id,data]);

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
  const id = req.params.id
  const data = req.body;
  pool.connect(function(err,client,done) {
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    let query = client.query ('UPDATE directories SET data=($1) where id =($2)',[data,id]);
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
    let query = client.query ('DELETE FROM directories where id =($1)',[id]);
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
