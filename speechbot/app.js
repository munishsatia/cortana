/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var requestpromise = require('request-promise');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});


const DATA_URL ="http://botdata.azurewebsites.net/data";


// Listen for messages from users 
server.post('/api/messages', connector.listen());


var luisAppId = "e9023dff-fda0-457f-8968-d7cec58a343d";
var luisAPIKey = "";


var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?verbose=true&spellCheck=false&subscription-key=' + luisAPIKey;
console.log(LuisModelUrl);

var bot = new builder.UniversalBot(connector);
var recoginizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recoginizer);
var intents = new builder.IntentDialog({ recoginzers : [recoginizer]});
console.log (intents);
bot.dialog('none', [
    function (session, args) {
        console.log(args.intent);
        //var name = builder.EntityRecognizer.findEntity(args.entities, 'Name');
          session.say( "I can help you in finding Opportunities e.g. like  Health System opportunity !!",
                     "I can help you in finding Opportunities e.g. like  Health System opportunity !!",
                     { inputHint: builder.InputHint.acceptingInput }
                   );
    }
]).triggerAction({ // <-- this right here
    matches: 'None'
});

bot.dialog('help', [
    function (session, args) {
        console.log(args.intent);
        //var name = builder.EntityRecognizer.findEntity(args.entities, 'Name');
        session.say( "I can help you in finding Opportunities e.g. like  Health System opportunity !!",
                     "I can help you in finding Opportunities e.g. like  Health System opportunity !!",
                     { inputHint: builder.InputHint.acceptingInput }
                   );
        
    }
]).triggerAction({ // <-- this right here
    matches: 'help'
});


bot.dialog('hello', [
    function (session, args) {
         console.log(args.intent);
        session.say( "Hi... My name is Nova. What can I do for you ? ",
                     "Hi... My name is Nova. What can I do for you ? ",
                     { inputHint: builder.InputHint.expectingInput }
                   );
    }
]).triggerAction({ // <-- this right here
    matches: 'Hello'
});

bot.dialog('/', [
    function (session, args) {
         console.log("Error");
         console.log(args);
        session.send('Oops. Something went wrong in finding response and we need to start over. ');
    }
    
]);



bot.dialog('search', [
    function (session, args) {
        session.say('Please wait while I search a response',"Please wait while I search a response");
        var agency = builder.EntityRecognizer.findEntity(args.intent.entities, 'Agency');
        var duration = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.datetimeV2.daterange');
        var status = builder.EntityRecognizer.findEntity(args.intent.entities, 'Status');
        console.log(args.intent);
        //debugIntents(agency,duration,status);
       var agencycode = "HHS",status,startDate,endDate;
        if (agency)
             agencycode = agency.resolution.values[0];
       if (status)
        status = status.resolution.values[0] || '';
       if (duration){
        startDate = duration.resolution.values[0].start;
        endDate =duration.resolution.values[0].end;
       }
       searchData(agencycode,startDate,endDate,status,session);
    }
]).triggerAction({ // <-- this right here
    matches: 'search'
});

function searchData(agency,startdate,enddate,status,session){
    var request = require('request-promise');
    var dataURLParams = DATA_URL +"/"+agency+"/"+startdate+"/"+enddate;
    console.log(dataURLParams);
    request({
        "method" : "GET",
        "uri" : dataURLParams,
        "json" : true
    }).then(function(jsonData){
        console.log(jsonData);
        //var title = jsonData;
       //var data = '[{"Title":"American Schools and Hospitals Abroad Program Worldwide","AGENCYCODE":"USAID"}]'
        var title ="";
        var count =1;
        //var jsonData = JSON.parse(data)
        var recordcount =jsonData.length;
        if (recordcount > 10) {
            recordcount=10;
            title ="Total " + jsonData.length +" Opportunities Found. \n\n Showing Top 10 Opportunities : \n\n\n\n";
            }
        console.log(recordcount);
        for(var i = 0; i < recordcount; i++) {
         title += "\n\n ["+jsonData[i].OPPORTUNITYNUMBER + "](https://www.grants.gov/view-opportunity.html?oppId="+jsonData[i].ID +")  "+jsonData[i].Title;
         count = count + 1;
        }
        if (jsonData.length==0)
            session.say("No Opportunities Found","No Opportunities Found", { inputHint: builder.InputHint.acceptingInput });
        else 
            session.say(title,jsonData.length +" Opportunities Found", { inputHint: builder.InputHint.acceptingInput });
        
    },console.log);
    // .catch(function (err) {
    //    var msg = "Oops..Some error occured. Can you please try again ? "
    //    session.say(msg,msg, { inputHint: builder.InputHint.acceptingInput });
    // });

    // var js = require('jsonpath');
    // var oppdata = require('./grantsgov.json');    
    // var oppPath=  '$..opp[?(@.AGENCYCODE=="'+agency+'")]';
    // var data1 = js.query(oppdata,oppPath);
    // console.log(data1);
}

function extractTitle(jsonData,session){
    // var jsonData = JSON.parse(data);
    
}


function debugIntents(agency,duration,status){
     console.log("Agency ----" );
         //console.log(agency);
          console.log(agency.resolution.values[0]);
        console.log("duration ----");
         console.log(duration);
          console.log("duration start----");
          console.log(duration.resolution.values[0].start);
           console.log("duration end----");
           console.log(duration.resolution.values[0].end);
        console.log("status ----");
        console.log(status.resolution.values[0]);
        //console.log("intent ----" );
        // console.log(args.intent);
       // console.log("entities ----" );
        // console.log(args.intent.entities.values);
}
