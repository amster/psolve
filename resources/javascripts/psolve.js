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
        },
        SEMAPHORE_CODE_MAP = {
            'sw/s':  'A',
            'w/s':   'B',
            'nw/s':  'C',
            'n/s':   'D',
            'ne/s':  'E',
            'e/s':   'F',
            'se/s':  'G',
            'w/sw':  'H',
            'nw/sw': 'I',
            'n/e':   'J',
            'n/sw':  'K',
            'ne/sw': 'L',
            'e/sw':  'M',
            'se/sw': 'N',
            'nw/w':  'O',
            'n/w':   'P',
            'ne/w':  'Q',
            'e/w':   'R',
            'w/se':  'S',
            'n/nw':  'T',
            'nw/ne': 'U',
            'n/se':  'V',
            'ne/e':  'W',
            'ne/se': 'X',
            'nw/e':  'Y',
            'e/se':  'Z'
        },
        BRAILLE_CODE_MAP = {
            'x.....': 'A',
            'x.x...': 'B',
            'xx....': 'C',
            'xx.x..': 'D',
            'x..x..': 'E',
            'xxx...': 'F',
            'xxxx..': 'G',
            'x.xx..': 'H',
            '.xx...': 'I',
            '.xxx..': 'J',
            'x...x.': 'K',
            'x.x.x.': 'L',
            'xx..x.': 'M',
            'xx.xx.': 'N',
            'x..xx.': 'O',
            'xxx.x.': 'P',
            'xxxxx.': 'Q',
            'x.xxx.': 'R',
            '.xx.x.': 'S',
            '.xxxx.': 'T',
            'x...xx': 'U',
            'x.x.xx': 'V',
            '.xxx.x': 'W',
            'xx..xx': 'X',
            'xx.xxx': 'Y',
            'x..xxx': 'Z'
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
    
    function itemsToBraille(items) {
        var chars = [],
            braille,
            i;
            
        for (i=0; i<items.length; i++) {
            braille = BRAILLE_CODE_MAP[items[i]];
            if (braille) {
                chars.push(braille);
            }
        }
        
        return chars.length > 0 ? chars.join('') : null;
    }
    
    function itemsToMorse(items) {
        var chars = [],
            mcode,
            i;
            
        for (i=0; i<items.length; i++) {
            mcode = MORSE_CODE_MAP[items[i]];
            if (mcode) {
                chars.push(mcode);
            }
        }
        
        return chars.length > 0 ? chars.join('') : null;
    }
    
    function itemsToSemaphores(items) {
        var chars = [],
            sema,
            i;
            
        for (i=0; i<items.length; i++) {
            sema = SEMAPHORE_CODE_MAP[items[i]];
            if (sema) {
                chars.push(sema);
            }
        }
        
        return chars.length > 0 ? chars.join('') : null;
    }
    
    function updateExporter() {
        var rows = [];
        
        $('tbody tr').each(function () {
            var $tr = $(this),
                line_items = [];
            $('td', $tr).each(function () {
                var $td = $(this),
                    $input = $('input[type=text]', $td),
                    item;
                    
                item = $input.length===1 ? $input.val() : $td.text();
                
                // Escape it?
                if (item.indexOf(',')>=0 || item.indexOf('"')>=0) {
                    // Escape the double quotes if there are any, then quote the thing.
                    item = '"' + item.replace(/"/, '""') + '"';
                }
                line_items.push(item);
            });
            rows.push(line_items.join(','));
        });
        
        $('.exporter').text(rows.join("\n"));
    }

    function processLineInput(ev) {
        var keycode = (window && window.event && window.event.keyCode) || ev.which,
            $tgt = $(ev.target),
            $tgtrow = $tgt.parents('tr'),
            val = $tgt.val(),
            items, sums, indexed, allsum, sum26, morsec, sema, brailles, $brailletd,
            i, curclass;
         
        // Select next row?
        if (keycode===13) {
            console.log('Next');
            curclass = $tgt[0].className;
            $('input.'+curclass, $tgtrow.next()).focus();
        }
         
        // Process the values   
        $('.nsum', $tgtrow).text('');
        $('.nsum26', $tgtrow).text('');
        $('.nindex', $tgtrow).text('');
        $('.morse', $tgtrow).text('');
        $('.semaphore', $tgtrow).text('');
        
        if (!blank(val)) {
            items = breakIntoItems(val);
            if (items) {
                try {
                    // Sums
                    sums = itemsToSums(items);
                    
                    allsum = 0;
                    for (i=0; i<sums.length; i++) {
                        allsum += sums[i];
                    }
                    $('.nsum', $tgtrow).text(allsum);

                    // Sum Mod
                    sum26 = allsum%26;
                    $('.nsum26', $tgtrow).text(sum26 + getIndexedChar(sum26));

                    // Indexed
                    indexed = itemsToIndexed(items);
                    if (indexed===null && sum26>=0 && sum26<=25) {
                        $('.nindex', $tgtrow).text(sum26 + '->' + (sum26+1) + ': '+getIndexedChar(sum26+1));
                    } else {
                        $('.nindex', $tgtrow).text(indexed ? (indexed + getIndexedChar(indexed)) : '');
                    }
                    
                    // Morse
                    morsec = itemsToMorse(items);
                    if (morsec) {
                        $('.morse', $tgtrow).text(morsec);
                    }
                    
                    // Semaphore
                    sema = itemsToSemaphores(items);
                    if (sema) {
                        $('.semaphore', $tgtrow).text(sema);
                    }

                    // Braille
                    brailles = itemsToBraille(items);
                    $brailletd = $('.braille', $tgtrow);
                    if (brailles) {
                        $brailletd.text(brailles);
                        $brailletd.addClass( 'braille-'+(brailles.replace(/\W/,'')) );
                    } else {
                        // Wipe out all classes.s
                        $brailletd[0].className = 'braille';
                    }
                } catch (e) {
                    window.console.log(e);
                }
            }
        }
        
        // Exporting
        updateExporter();
    }
    
    function invertSemaphoreMap() {
        var k;
        
        for (k in SEMAPHORE_CODE_MAP) {
            var new_k_elements = k.split('/');
            SEMAPHORE_CODE_MAP[new_k_elements[1] + '/' + new_k_elements[0]] = SEMAPHORE_CODE_MAP[k];
        }
    }
    
    // Main!
    invertSemaphoreMap();
    // Add rows to start
    for (n=0; n<NUM_STARTING_ROWS; n++) {
        addNewRow();
    }
    
    // Hook up listeners
    $('input[type=text]', $tbody).live('keyup', processLineInput);
    $('.add-more input[type=button]').click(function (ev) {
        var n, max_rows = parseInt($(ev.target).attr('data-numrows'), 10);
        for (n=0; n<max_rows; n++) {
            addNewRow();
        }
    });
    
    $('.new-tab').attr('href', window.location.href);
});