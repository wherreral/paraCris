let RETHINKDB_HOST = "192.168.1.89";
let POSTGRESQL_HOST = "192.168.1.89";


async function create_table(table_name)
{
  try{
    log('inside create_table()');

    r = require('rethinkdb')

    //let table_name = new Date().getTime();
    log('table_name:'+table_name);

    var connection = null;

    var conn = await r.connect({ host: RETHINKDB_HOST, port: 28015 });

    //promise.then(function(conn)
    //{
      log('resolviendo promesa:');
      connection = conn;
      var createtables = await r.db('test').tableCreate(table_name.toString()).run(connection);
      //const promises = [createtables];

      //createtables.then(function (arr){
          log('table was created:'+table_name);
      //});

      //Promise.allSettled(promises)
      //.then(function (result){
     //   log('resolviendo promesa 1');
      //  return result;

    //  });

    //});

    //const promises = [promise];

    //Promise.allSettled(promises)
   // .then(function (result){
      log('DB is connected');
  //});

  }
  catch(error)
  {
    log('ERROR INSERTING');
    log(error);

    var fs = require('fs')
    var logger = fs.createWriteStream('log.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    logger.write('some data') // append string to your file
    logger.end()
  }
}

async function insert_data(person,table_name){


  try{
    log('Inside insert_data');
    r = require('rethinkdb')

    let resp = await r.connect({ host: RETHINKDB_HOST, port: 28015 }, function(err, conn) {
      r.table(table_name.toString()).insert(person).run(conn, function(err, res)
      {
          if(err) {
            log('error'+err);
            //throw err;
          }
         log('inserte')
          conn.close(function(err) { if (err) throw err; })
      });
    });

  }
  catch(error){
    log('Inside insert_data ERROR INSERTING');
    log(error);

    var fs = require('fs')
    var logger = fs.createWriteStream('log.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    logger.write('some data') // append string to your file
    logger.end()
  }
}


async function get_data(table_name){


  try{
    log('Inside get_data '+table_name);
    r = require('rethinkdb')

    var conn = await r.connect({ host: RETHINKDB_HOST, port: 28015 });
    conn.noreplyWait();
    var cursor = await r.table(table_name.toString()).run(conn);
    
    return await cursor.toArray();

  }
  catch(error){
    log('Inside get_data ERROR GET');
    log(error);

    var fs = require('fs')
    var logger = fs.createWriteStream('log.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    logger.write('some data') // append string to your file
    logger.end()
  }finally{
    conn.close();
  }
}



async function get_data_all(isbn){


  try{
    log('Inside get_data');
    pg = require('pg');
 
    const client = new pg.Client({
      host: POSTGRESQL_HOST,
      port: 5432,
      database: 'comics',
      user: 'user',
      password: 'user123!',
    })


    await client.connect()
     
    const result = await client.query('select a.isbn,a.title, a.price todo,b.price nube from public.todocomics a, public.nube b where a.isbn = b.isbn');
    //console.log(result)
     
    await client.end()

  }
  catch(error){
    log('Inside get_data ERROR GET: '+error);
    
  }
}



function log(message){
    console.log( '[' + new Date().toISOString().substring(11,23) + '] -', message )
}

module.exports = { create_table, insert_data, get_data, get_data_all, log };
