/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The UserData class stores all userData states for the user
     */
    function UserData(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
              favorites: [],
              lastStarted: -1
            };
        }
        this._session = session;
    }

    UserData.prototype = {
        isFirstLaunch: function () {
            var firstStory = false;
            var userData = this.data;
            if (userData.lastStarted === -1) {
              firstStory = true;
            }
            return firstStory;
        },
        save: function (callback) {
            //save the userData states in the session,
            //so next time we can save a read from dynamoDB
            this._session.attributes.currentUserData = this.data;
            dynamodb.putItem({
                TableName: 'FablesUserData',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadUserData: function (session, callback) {
            if (session.attributes.currentUserData) {
                console.log('get userData from session=' + session.attributes.currentUserData);
                callback(new UserData(session, session.attributes.currentUserData));
                return;
            }
            dynamodb.getItem({
                TableName: 'FablesUserData',
                Key: {
                    CustomerId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var currentUserData;
                if (err) {
                    console.log(err, err.stack);
                    currentUserData = new UserData(session);
                    session.attributes.currentUserData = currentUserData.data;
                    callback(currentUserData);
                } else if (data.Item === undefined) {
                    console.log("Undefined item for user ", session.user.userId);
                    currentUserData = new UserData(session);
                    session.attributes.currentUserData = currentUserData.data;
                    callback(currentUserData);
                } else {
                    console.log('get userData from dynamodb=' + data.Item.Data.S);
                    currentUserData = new UserData(session, JSON.parse(data.Item.Data.S));
                    session.attributes.currentUserData = currentUserData.data;
                    callback(currentUserData);
                }
            });
        },
        newUserData: function (session) {
            return new UserData(session);
        }
    };
})();
module.exports = storage;
