/*jslint devel: true, undef: true, browser: true, unparam: false, vars: true, white: true, plusplus: true, maxerr: 50, indent: 4 */
$(function () {
    "use strict";
    
    var NUM_STARTING_ROWS = 30,
        MORSE_CODE_MAP = {
            '.-':   'A',
            '-...': 'B',
            '-.-.': 'C',
            '-..':  'D',
            '.':    'E',
            '..-.': 'F',
            '--.':  'G',
            '....': 'H',
            '..':   'I',
            '.---': 'J',
            '-.-':  'K',
            '.-..': 'L',
            '--':   'M',
            '-.':   'N',
            '---':  'O',
            '.--.': 'P',
            '--.-': 'Q',
            '.-.':  'R',
            '...':  'S',
            '-':    'T',
            '..-':  'U',
            '...-': 'V',
            '.--':  'W',
            '-..-': 'X',
            '-.--': 'Y',
            '--..': 'Z'
        };

    var n,
        $model_row = $('.model-row'),
        $tbody = $('tbody');
        
    function blank(s) {
        return typeof(s)==='undefined' || s===null || $.trim(s)==='';
    }
        
    function numTbodyRows() {
        return $('tr', $tbody).length;
    }

    function addNewRow() {
        var $tr = $('<tr>'+$model_row.html()+'</tr>');
        $('.lineno', $tr).text(numTbodyRows() + 1);
        $tbody.append($tr);
    }
    
    function setMessage($element, s, is_error) {
        if ($element[0].tagName!=='TR') {
            $element = $element.parents('tr');
            if (!$element || $element.length < 1) {
                return;
            }
        }
        
        var $msg = $('.message', $element);
        if (blank($msg)) {
            $msg.text('');
            return;
        }
        
        if (is_error) {
            $msg.addClass('error');
        } else {
            $msg.removeClass('error');
        }
        
        $msg.html(s);
    }
    
    function breakIntoItems(s) {
        var potential_items = [],
            items = [],
            item,
            i;

        potential_items = s.indexOf(',')>=0 ? s.split(',') : s.split(' ');
        for (i=0; i<potential_items.length; i++) {
            item = $.trim(potential_items[i]);
            
            if (!blank(item)) {
                items.push(item);
            }
        }
        
        return items.length > 0 ? items : null;
    }
    
    function getIndexedChar(i) {
        return i >= 1 && i <= 26 ? (' ('+String.fromCharCode(i - 1 + 65)+')') : (i===0 ? ' (Z)' : '');
    }
    
    function itemsToSums(items) {
        var sums = [],
            indexes = [],
            i;
        
        for (i=0; i<items.length; i++) {
            var item = items[i];
            if (blank(item)) {
                throw 'Encountered a blank item.';
            }
            
            if (item.match(/\d+/)) {
                sums.push(parseInt(item, 10));
            } else if (item.length===1) {
                sums.push(item.charCodeAt());
            }
        }
        
        return sums;
    }
    
    function itemsToIndexed(items) {
        var item;
        
        if (items.length===1) {
            item = items[0];
            if (item.match(/[a-z]/)) {
                return item.charCodeAt() - 'a'.charCodeAt() + 1;
            } else if (item.match(/[A-Z]/)) {
                return item.charCodeAt() - 'A'.charCodeAt() + 1;
            } else if (item.match(/\d+/)) {
                item = parseInt(item, 10) % 26;
                return item === 0 ? 26 : item;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    
    function itemsToMorse(items) {
        var chars = [],
            mcode,
            i;
            
        for (i=0; i<items.length; i++) {
            window.console.log('Trying ' + items[i] + ' to ' + MORSE_CODE_MAP[items[i]]);
            mcode = MORSE_CODE_MAP[items[i]];
            if (mcode) {
                chars.push(mcode);
            }
        }
        
        return chars.length > 0 ? chars.join('') : null;
    }
    
    function processLineInput(ev) {
        var $tgt = $(ev.target),
            $tgtrow = $tgt.parents('tr'),
            val = $tgt.val(),
            items, sums, indexed, allsum, sum26, morsec,
            i;
            
        setMessage($tgt, null);
        $('.nsum', $tgtrow).text('');
        $('.nsum26', $tgtrow).text('');
        $('.nindex', $tgtrow).text('');
        $('.morse', $tgtrow).text('');
        
        if (!blank(val)) {
            items = breakIntoItems(val);
            if (items) {
                try {
                    sums = itemsToSums(items);
                    
                    allsum = 0;
                    for (i=0; i<sums.length; i++) {
                        allsum += sums[i];
                    }
                    
                    sum26 = allsum%26;
                    
                    $('.nsum', $tgtrow).text(allsum);
                    $('.nsum26', $tgtrow).text(sum26 + getIndexedChar(sum26));

                    indexed = itemsToIndexed(items);
                    if (indexed===null && sum26>=0 && sum26<=25) {
                        $('.nindex', $tgtrow).text(sum26 + '->' + (sum26+1) + ': '+getIndexedChar(sum26+1));
                    } else {
                        $('.nindex', $tgtrow).text(indexed ? (indexed + getIndexedChar(indexed)) : '');
                    }
                    
                    morsec = itemsToMorse(items);
                    if (morsec) {
                        $('.morse', $tgtrow).text(morsec);
                    }
                } catch (e) {
                    window.console.log(e);
                    setMessage($tgt, e);
                }
            }
        }
    }
    
    // Add rows to start
    for (n=0; n<NUM_STARTING_ROWS; n++) {
        addNewRow();
    }
    
    // Hook up listeners
    $('input.inputs', $tbody).live('keyup', processLineInput);
    $('.add-more input[type=button]').click(function (ev) {
        var n, max_rows = parseInt($(ev.target).attr('data-numrows'), 10);
        for (n=0; n<max_rows; n++) {
            addNewRow();
        }
    });
    
    $('.new-tab').attr('href', window.location.href);
});