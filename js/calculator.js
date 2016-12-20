/**
 * Created by Aashish on 12/16/2016
 * File Name: calculator.js
 * Purpose: This file has the complete Calculator functionality.
 */

/*
 * The implementation was done with the initial idea to help user perform the calculation using keyboard inputs.
 * The project required button click integration and thus the initial development of using keyboard inputs has been
 * reused to listen to click events by simulating only the two necessary event attributes that are actually utilized.
 *
 * The calculator and the functionality is based on and tries to imitate a modern-day calculator
 * ( Windows Calculator app), but still has a few quirks that need to be resolved.
 *
 */

(function () {
  var txtInput = document.getElementById('currentInput'); // Separate text input for keyboard input
  var txtDisplay = document.getElementById('historyInput'); // Results Window is a textarea ('readonly')

  // Only these keys are allowed in from the HTML input
  // If the user tries to enter anything except these, the calculator will still allow
  // but will result in an evaluation error
  var allowedKeys = [
    '0', '1', '2', '3', '4',
    '5', '6', '7', '8', '9',
    '+', '-', '*', '/', '.',
    '=', 'Enter', 'Escape', 'Backspace'
  ];

  // This function is used to get a desired key that is displayed (based on the key pressed) in the textarea.
  var showTypedKey = function (key) {
    switch (key) {
      case 'Enter':
      case 'Escape':
      case 'Backspace':
      case '=':
        return '';
      case '+':
      case '-':
        return ' ' + key + ' ';
      case '*':
        return ' &times; ';
      case '/':
        return ' &divide ';
      default:
        return key;
    }
  };

  // This function returns the id of the button based on the key pressed
  var keyedButtonId = function (key) {
    var btn = 'btn-';
    switch (key) {
      case 'Enter':
      case '=':
        btn += 'equals';
        break;
      case '+':
        btn += 'plus';
        break;
      case '-':
        btn += 'minus';
        break;
      case '*':
        btn += 'multiply';
        break;
      case '/':
        btn += 'divide';
        break;
      case '.':
        btn += 'decimal';
        break;
      case 'Backspace':
        btn += 'del';
        break;
      case 'Escape':
        btn += 'clear';
        break;
      default:
        btn += key;
    }
    return btn;
  };

  // This function is introduced to reduce some repeated code
  // This function returns whether the last character in the parameter string is an operator or not
  var isLastCharacterOperator = function (string) {
    var lastCharacter = string.split(' ').join('').slice(-1);
    return isNaN(parseInt(lastCharacter)) && lastCharacter !== '.';
  };

  // This is the main function. It contains the complete functionality of the calculator and invokes other functions
  // This function is added as a callback to keydown event listener.
  //
  // This function is also utilized for all the button clicks on the calculator
  // by passing a simulated key event with the keyValue from the button
  var keyboardActions = function (event) {
    var currentKey = event.key; // grab the value of the key pressed
    if (allowedKeys.includes(currentKey)) { // check if the key is allowed
      // using the key value of the key pressed by the user, highlight the button on the UI for a visual feedback.
      var keyedButton = document.getElementById(keyedButtonId(currentKey));
      keyedButton.parentNode.classList.add('active'); // Highlights by adding an active class
      setTimeout(function () {
        keyedButton.parentNode.classList.remove('active');
      }, 250); // remove that active class after a short time

      // Use a try...catch block to properly handle errors, if any
      try {
        // toEvaluate variable is the last line of textarea which is yet to be evaluated
        // This variable represents the expression which is yet to finalized in output.
        // The finalization of the expression occurs when user presses '=' or 'Enter'
        var toEvaluate = txtDisplay.innerHTML.substring(txtDisplay.innerHTML.lastIndexOf('\n') + 1);

        // Need to use regular expressions and 'g' flag to replace all instances
        // of HTML multiply and divide signs to computer understandable multiply and divide operators
        toEvaluate = toEvaluate.replace(/\xD7/g, '*').replace(/\xF7/g, '/');

        // If the currentKey pressed is one of the operators, evaluate the current, unfinalized expression
        // and sow the result in the text input only.
        if (currentKey === '+' || currentKey === '-' ||
            currentKey === '*' || currentKey === '/') {
          toEvaluate = toEvaluate || txtInput.value;
          if (isLastCharacterOperator(toEvaluate)) {
            toEvaluate = toEvaluate.slice(0, -3);
            txtDisplay.innerHTML = txtDisplay.innerHTML.slice(0, -3);
          }
          console.log(toEvaluate);
          txtInput.value = eval(toEvaluate); // evaluate the expression using 'eval'
          event.preventDefault(); // this line doesn't let the operator to get printed in the text input
        }

        // If the currentKey pressed is '=' or 'Enter', finalize the expression in toEvaluate
        // and put the result in the textarea while clearing out the text input.
        else if (currentKey === '=' || currentKey === 'Enter') {
          toEvaluate = toEvaluate || txtInput.value;
          if (isLastCharacterOperator(toEvaluate)) {
            toEvaluate += txtInput.value;
            txtDisplay.innerHTML += txtInput.value;
          }
          txtInput.value = '';
          txtDisplay.innerHTML += ' = ' + eval(toEvaluate) + '\n';
          event.preventDefault(); // this line doesn't '=' or 'Enter' to get printed in the text input
        }

        // If the currentKey pressed is 'Backspace' or user clicks 'DEL' button
        // then remove the last character from both the text input and unfinalized expression in the textarea
        else if (currentKey === 'Backspace') {
          if (txtDisplay.innerHTML.slice(-1) !== '\n')
            txtDisplay.innerHTML = txtDisplay.innerHTML.slice(0, -1);
        }

        // If the currentKey pressed is 'Escape' or user clicks 'CLEAR' button
        // then remove the entire unfinalized expression from the textarea and empty the text input
        else if (currentKey === 'Escape') {
          txtInput.value = '';
          txtDisplay.innerHTML = txtDisplay.innerHTML.substring(0, (txtDisplay.innerHTML.lastIndexOf('\n') + 1));
        }

        // Lastly for any other key, i.e. any numeric key press, we necessarily don't have to do anything
        // except to check if the last character in unfinalized expression is an operator
        // it means that the text input right now contains an evaluated value
        // and the user is typing in another operand
        // so empty out the text input right before that happens
        // example '1 + 2 +' in the display area means that there is '3' in text input,
        // if user types '1', text input should display '1' and not '31'.
        else if (isLastCharacterOperator(txtDisplay.innerHTML)) {
          txtInput.value = '';
        }

        txtDisplay.innerHTML += showTypedKey(currentKey); // add the display keyValue into the textarea

        // this is a hack to keep the scroll (if the history is long)
        // to be at the lowermost expression being displayed
        txtDisplay.scrollTop = txtDisplay.scrollHeight;
      } catch (error) { // catch errors and display an Error in the result window (textarea)
        console.log(error);
        txtDisplay.innerHTML += ' = Error\n';
        event.preventDefault();
      }
    }
    return true;
  };

  txtInput.addEventListener('keydown', keyboardActions); // add keydown event listener on text input

  // Using forEach on the NodeList returned by 'querySelectorAll'
  // add a click event listener to each of the input buttons
  [].forEach.call(document.querySelectorAll('input[type="button"'), function (element) {
    // This is just a normal object representing 'event' object to help invoking above function
    // which uses keyboard event
    var simulateKeyEvent = {
      // Certain buttons have different display value and actual operator value
      key: element.getAttribute('data-value') || element.value,
      preventDefault: function () { // dummy function
      }
    };

    // add click event listener on button inputs and invoke keyboardActions function
    element.parentNode.addEventListener('click', function () {
      keyboardActions(simulateKeyEvent);
    });
  });
  // End of code
})();