//const sfdx = require('sfdx-node');
 const sfdx = require('sfdx-node')

// options - all options to use for the relevant commands
//   (see sfdx config documentation)
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const ConfigPath = path.join(__dirname, '/config/project-scratch-def.json');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .use((req, res) => res.sendFile(ConfigPath) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const io = socketIO(server);

io.on('connection', function(socket) {  
  console.log(sfdx.auth.webLogin());
   console.log('Client connected...');

      socket.on('CheckStatus',function(){
        var list_of_config = sfdx.config.get({
          json: 'defaultdevhubusername'
        })
        list_of_config
          .then(function(configList){
             // console.log(configList);
              io.emit('configList',configList);
          });
      }); 
      socket.on('OpenThisOrg', function(radioValue){
        sfdx.org.open({
            TARGETUSERNAME : radioValue
          })

          //.then(function(OpenDevHubResponse){
            console.log('Opening Org');
            //io.emit('OpenDevHubResponse',OpenDevHubResponse);
          //});
      })
      
      socket.on('ListAllOrgs', function() {
        var list_of_orgs = sfdx.org.list();
        list_of_orgs
          .then(function(listMyOrgReturn){       
                  //send a message to ALL connected clients
                  console.log('inside list');
                  io.emit('listMyOrgReturn', listMyOrgReturn);
              });
          });

       socket.on('ModelList', function() {
        var list_of_orgs = sfdx.org.list({
          all : true
        });
        list_of_orgs
          .then(function(data){       
                  //send a message to ALL connected clients
                  //console.log(data);
                  io.emit('ListData', data);
              });
          });

      socket.on('OpenDevHub',function(){
          sfdx.org.open({
            targetusername : 'alekh.newdx@cognizant.com'
          }).then(function(OpenDevHubResponse){
            console.log('OpenDevHubResponse');
            io.emit('OpenDevHubResponse',OpenDevHubResponse);
          });
      });

      socket.on('CreateNewOrg',function(){
            
              
              sfdx.org.create({
                  definitionfile: ConfigPath,
                  setalias: 'orgAlias'
                }) 
              .then(function(CreateNewOrgResponse){
                console.log('Created Scratch org');
                io.emit('CreateNewOrgResponse',CreateNewOrgResponse)  
              });
      });
  
      socket.on('AuthMyOrg', function()
      {
          sfdx.auth.web.login({
           CLIENTID :"3MVG9d8..z.hDcPLdOuWz_l8Vx.P_3CaFwALqbCT_fC3QXclpPvDWq_9YRsDAoaGEgD8rHW9MncygfddMhHaE"
          
          }).then(function(data) {
          console.log(data);
          })
      });

      socket.on('SourcePull',function() {
       sfdx.source.pull().then(function(data) {
        console.log(data);
        console.log(' pull done!');
   });

});

});

