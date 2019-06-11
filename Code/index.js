/* 
Handler for Alexa skill calorieFinder.
AWS Lambda function

Uses the slot value (foodItem)of intent getCalories to look up foods in a DynamoDB table 
table used is 'caloriesandsugar'. After retrieving the data constriucts speech based on the food vareity
delivers the response.

*/

'use strict';
//import AWS
const awsSDK = require('aws-sdk');

//import ask-sdk-core
const Alexa = require('ask-sdk-core');

//skill name
const appName = 'Calorie Finder';

//DynamoDB table
const foodsTable = 'caloriesandsugar'
const docClient = new awsSDK.DynamoDB.DocumentClient();

//code for the launch handler
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        //welcome message
        let speechText = 'Hello - I am here to help you eat healthy. Ask me about common foods and drinks and I can tell you how many calories it has. Do you have a food in mind?';
        let repromptText = 'What food or drink do you want to know about?';
        //welcome screen message - not handling screen yet, will implement in next version
        let displayText = 'Hello from Calorie Finder'
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .withSimpleCard(appName, displayText)
            .getResponse();
    }
};

// custom intent handlers
// the main function - get Calories handler

const getCaloriesIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'getCalories'
    },
    async handle(handlerInput) {
      let speechText = '';
      let repromptText = 'Can I help you with a food?';
      let displayText = 'Hello from Calorie Finder';
      let fullDescription = '';
      
      let intent = handlerInput.requestEnvelope.request.intent;

      //convert to lower case to ensure match
      let foodtomatch = intent.slots.foodItem.value.toLowerCase();

      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      //console.log('food' + foodtomatch)
      // read DynamoDB
      let params = {
        TableName: foodsTable,
        Key: {
          food: foodtomatch
        }
      };
      
       await docClient.get(params).promise().then(data => {

        //form the food description
        console.log('data ' + ' ' + data.Item);
        if (data.Item.preorpost == 'pre') {
            fullDescription = data.Item.vareity + ' ' + data.Item.food;
        }
        else if (data.Item.preorpost == 'post')
        {
            fullDescription = data.Item.food + ' ' + data.Item.vareity  
        } else {
            fullDescription = data.Item.food
        };
        // form the full speech 
        speechText = data.Item.portionamount + ' ' + data.Item.unit+ ' ' + fullDescription + ' has ' + data.Item.calories + ' calories. '  + 'can I help you with another food?'    
         })
         .catch(err =>
            {
                speechText = `hmmm ... i don't know about this one, sorry, please ask me about another food`;
                
                console.log("Error reading data");
             return;
           });
        sessionAttributes.speechText =speechText;
       //Perform operation
       
  
        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .withSimpleCard(appName, displayText)    
        .withShouldEndSession(false)
        .getResponse();
  
    }
  };
  

//end Custom handlers

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        //help text 
        let speechText = 'You can ask me about a food or a drink that you want to know calories for';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};
// repeat intent - to repeat what was said
const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        //help text for your skill
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speechText = 'Sure, '+ sessionAttributes.speechText;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};

// Another food? Yes
const YesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
         let speechText = 'Ok, ask me about a food';

        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(appName, speechText)
        .withShouldEndSession(false)
        .getResponse();
        
    }
};

// No intent - to stop 
const NoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        //signing off
         let speechText = 'Ok bye, hope to see you soon';
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(appName, speechText)
        .withShouldEndSession(true)
        .getResponse();
        
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        let speechText = 'Goodbye';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

//Lambda handler function
exports.handler = Alexa.SkillBuilders.custom()
     .addRequestHandlers(LaunchRequestHandler,
                         getCaloriesIntentHandler,
                         HelpIntentHandler,
                         RepeatIntentHandler,
                         YesIntentHandler,
                         NoIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler).lambda();
