/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage'),
    tellFable = require('./tellFable');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.TellRandomIntent = function (intent, session, response) {
      storage.loadUserData(session, function (currentUserData) {
        // Get a random fable and tell it.
        var fable = tellFable.randomFable();
        currentUserData.data.lastStarted = fable.number;
        response.askWithCard(fable.speech, null, fable.title, fable.moral);
        currentUserData.save();
      });

    };

    intentHandlers.TellFavoriteIntent = function(intent, session, response) {
      storage.loadUserData(session, function (currentUserData) {
        // Load the favorites, then randomly select one and tell it
        var favorites = currentUserData.data.favorites;

        if (favorites.length == 0) {
          response.ask('You don\'t have any favorites yet.  After listening to a story, say "Remember that," and I\'ll save it for later.')
        } else {
          var fable = tellFable.randomFromList(favorites);
          currentUserData.data.lastStarted = fable.number;
          response.askWithCard(fable.speech, null, fable.title, fable.moral);
          currentUserData.save();
        }

      });
    };

    intentHandlers.TellAgainIntent = function(intent, session, response) {
      storage.loadUserData(session, function (currentUserData) {
        var fableNum = currentUserData.data.lastStarted
        var fable = tellFable.getFable(fableNum);
        response.askWithCard(fable.speech, null, fable.title, fable.moral);
      });
    };

    intentHandlers.AddFavoriteIntent = function(intent, session, response) {
      storage.loadUserData(session, function (currentUserData) {
        var lastFable = currentUserData.data.lastStarted;
        if (lastFable === -1) {
          // this is our first story
          response.ask('You can choose to save a story, but only after I\'ve told you one.  Say "Tell me a story" to begin.')
        } else {
          // this isn't our first story
          var lastFableTitle = tellFable.getFable(lastFable).title;

          // Check if the last fable is already a favorite
          var storyIndex = currentUserData.data.favorites.indexOf(lastFable);
          if (storyIndex === -1) {
            // If not, add it and save
            currentUserData.data.favorites.push(lastFable);
            currentUserData.save(function() {
              response.askWithCard('OK, I\'ve added ' + lastFableTitle + ' to your favorites.  You can ask for another story, or say "Stop" or "Help."', null, lastFableTitle, 'Added to favorites.');
            });
          } else {
            // If so, tell the user
            response.ask(lastFableTitle + ' is in your favorites.  You can ask for another story, or say "Stop" or "Help."');
          }
        }
      });
    };

    intentHandlers.RemoveFavoriteIntent = function(intent, session, response) {
      // Load data
      storage.loadUserData(session, function (currentUserData) {
        var lastFable = currentUserData.data.lastStarted;
        if ((currentUserData.data.favorites.length == 0) || (lastFable === -1)) {
          response.ask('You don\'t have any favorites yet.  Say "Tell me a story," then if you enjoy what you hear, say "Save that."');
        } else {
          // this isn't our first story
          var lastFableTitle = tellFable.getFable(lastFable).title;

          // Check if the last fable is already a favorite
          var storyIndex = currentUserData.data.favorites.indexOf(lastFable);
          if (storyIndex === -1) {
            // If not, tell the user
            response.ask(lastFableTitle + ' is not one of your favorites.  You can ask for another story, or say "Stop."');
          } else {
            // If so, remove it and save
            currentUserData.data.favorites.splice(storyIndex, 1)
            currentUserData.save(function() {
              response.askWithCard('OK, I\'ve removed ' + lastFableTitle + ' from your favorites.  You can ask for another story, or say "Stop."', null, lastFableTitle, 'Removed from favorites.');
            });
          }
        }
      });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.ask(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
      response.tell('Goodbye.');
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
      response.tell('Goodbye.');
    };
};
exports.register = registerIntentHandlers;
