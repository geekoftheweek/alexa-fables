'use strict';

var aesop = require('./aesop');

var fables = aesop;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getFable(num) {
  var fable = fables[num];
  return {
      title: fable.title,
      moral: fable.moral,
      type: 'PlainText',
      speech: 'Fable number ' + (num+1) + '.\n\n' + fable.title + '.\n\n' + fable.story + '\n\nThe moral of the story is: ' + fable.moral
      //speech: '<speak><p>Fable number ' + (num+1) + '.</p><p>' + fable.title + '.</p>' + fable.story + '<p> The moral of the story is: ' + fable.moral + '</p></speak>'
  };
}

function randomFable() {
  var storyNumber = getRandomInt(0, fables.length);
  var speech = getFable(storyNumber);
  return {
    number: storyNumber,
    speech: speech,
    title: speech.title,
    moral: speech.moral
  }
}

function randomFromList(indexList) {
  var listIndex = getRandomInt(0, indexList.length);
  var storyNumber = indexList[listIndex];
  var speech = getFable(storyNumber);
  return {
    number: storyNumber,
    speech: speech,
    title: speech.title,
    moral: speech.moral
  }
}

module.exports = {
  randomFable : randomFable,
  randomFromList : randomFromList,
  getFable : getFable
};
