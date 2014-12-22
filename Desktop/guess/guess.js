//the actual js/jquery codes!
/*TO DO:
1)debug stats screen. It's not calculating the win/loss ratio correctly.
2) reset (with wipe) needs to reset winLoss, and the text needs to say "resetting!". want confirm?
*/
var myGuess=0;//the guess
var numGuesses = 5;//guesses remaining
var correct;//the answer!
var listHints=['If you were to weigh yourself on the surface of the sun, you\'d be dead.','Bombardier beetles defend themselves by spraying burning material from their rears. Certain people defend themselves by spraying burning comments from their fronts.','The planet Earth weighs approximately the same as 5.35*10<sup>23</sup> dachshunds.','Certain sea sponges can live over 10,000 years.','The largest dinosaur is thought to have been around 65 tons. The blue whale weighs approximately 209 tons.','You really should stop reading this and make another guess.','Latin contains no word for \'yes\' or \'no\'.','The ancient Romans did not check their email.','Ketchup was sold in the 1830s as medicine.','A group of toads is called a knot.','Termites have been known to eat food twice as fast when heavy metal music is playing.','The past-tense of the English word <i>dare</i> is <i>durst</i>.','The semicircular bit of pink in the inside corner of your eye is known as the <i>plica semilunaris</i>, and is the remnant of the human third eyelid.','A crocodile cannot stick its tongue out at you. At least they\'re polite.','<i>Stewardesses</i> is the longest word typed with only the left hand.'];//list of unhelpful hints
var winLoss=[0,0];//number of wins and losses for this person.
var currCol=[34,34,34];//current bg color for the meter
var guessed=0;//boolean val: user cannot get hints without making at least ONE guess (per game);
var guessedList=[];//list of guesses
var title='';//the user's Title
var titleCols=['#b22','#a22','#922','#722','#522','#222','#225','#227','#229','#22a','#22b'];//colors for the Titles
var curTitCol='#222';//current title color
$(document).ready(function(){
    correct = Math.floor(Math.random()*100)+1;
    //check to see if this computer's played before!
    if (!localStorage.myScore) {
        //no score stored, so set to zero
        localStorage.myScore=[0,0];
    }
    else {
        //set current win loss record to what was stored in the myScore var.
        //interesting note: js does automatically interpret the stuff in localStorage as a STRING, so storing [0,0] in there, when retrieved, will be a STRING and
        //NOT an array!
        winLoss[0] = parseInt(localStorage.myScore[0]);
        winLoss[1] = parseInt(localStorage.myScore[2]);
    }
    updateRecords();
});

function hint(){
    //offers a hint to the user. This may either be helpful (i.e., you're about halfway off our number, X),
    //or completely unhelpful (i.e., Did you know that <random fact>?)
    if (guessed){
        var whichHint = Math.floor(Math.random()*26);
        /*first 15 possibilities (0-14) are the 'unhelpful' hints
            possibilities 15-25 are basically verbal versions of the meter (i.e., 'Guess a little/lot higher/lower!')
            possibility 26 is the answer*/
        if (whichHint<15) {
            //unhelpful!
            dialogue ('Random Fact:<br/>'+listHints[whichHint]);
        }
        else if (whichHint>24) {
            dialogue ('The answer is '+correct+'.');
        }
        else {
            var lowHigh =(correct-myGuess>0)? 'higher': 'lower';
            var hotCold= (Math.abs(correct-myGuess)>60)?' a lot':(Math.abs(correct-myGuess)<6)?' a little':'';
            dialogue ('Guess'+hotCold+' '+lowHigh+'.')
        }
    }
    else{
        dialogue ('Hey! No hints until you make a guess!');
    }
}
$(document).on("keydown", function(e){
if (e.which==13){
    guessMe();
}
});

function guessMe() {
    myGuess = $('#theGuess').val();
    guessed=1;
    if (numGuesses>=1) {
        //ok to guess
        if (isNaN(myGuess) || myGuess < 1 || myGuess > 100) {
            dialogue('Invalid guess! Numbers between 1 and 100, please!');
        }
        else if (guessedList.indexOf(myGuess)!=-1) {
            dialogue('You\'ve already guessed '+myGuess+'!');
        }
        else{
            //valid guess
            parseGuess(myGuess);
            numGuesses--;
            guessedList.push(myGuess);
            $('#guessesLeft').html('You have '+numGuesses+' guesses left!');
        }
    }
    else {
        document.getElementById('history').innerHTML += '<br/><span style="color:red;font-weight:bold;" title="You lost this game!">'+myGuess+'</span>'
        reset('You\'re out of guesses! The correct number was: '+correct, 1);
        winLoss[1]+=1;
        updateRecords();
        $("#theGuess").focus();
    }
}

function parseGuess(num) {
    (num>correct)? document.getElementById('history').innerHTML +='<br/>'+num+' v': (num< correct)? document.getElementById('history').innerHTML += '<br/>'+num+' ^':document.getElementById('history').innerHTML += '<br/><span style="color:green;font-weight:bold;" title="You won this game!">'+num+'</span>';
    if (num==correct) {
        //correct guess!
        //WIN CONDITION
        reset('Congrats! You win!',1);
        winLoss[0]+=1;
        updateRecords();
    }
    else {
        //incorrect guess, so let's do some jQuery!
        /*explanation:
        If the user is ABOVE the answer, needle rotates down
        If the user is BELOW the answer, needle rotates up
        needle BG changes to indicate hot (close) or cold (far away)*/
        var rotDif = Math.floor((correct-num)*1.7);
        var colB=Math.floor((Math.abs(correct-num)/100)*141)+34;
        var colR=175 - (Math.floor((Math.abs(correct-num)/100)*141)+34);
        currCol[0]=colR;
        currCol[2]=colB;
        $('#meter').css('background','rgb('+currCol[0]+','+currCol[1]+','+currCol[2]+')');
        $('#needleBack').css({'-ms-transform':'rotate('+rotDif+'deg)',' -webkit-transform:':'rotate('+rotDif+'deg)','transform':'rotate('+rotDif+'deg)'});
        //if the guess is within 5 of the val, glow with the current bg color (redish)
        //if the guess is more than 85 away, inner-glow bluish white (i.e., frosty)
        if (Math.abs(correct-num)<=5) {
            //crispy!
            $('#meter').css({'box-shadow':'0 0 7px 5px rgb('+currCol[0]+','+currCol[1]+','+currCol[2]+')','top':'-9px','animation':'flare 1s infinite'});
            $('#icicles').css({'height':'200px','width':'199px'});
        }
        else if (Math.abs(correct-num)>=75) {
            //frosty!
            $('#meter').css({'box-shadow':'0 0 12px 5px #DDF inset','animation':'none'});
            $('#icicles').css({'height':'250px','width':'199px'});
        }
        else{
            //meh
            $('#meter').css({'box-shadow':'none','top':'-9px','animation':'none'});
            $('#icicles').css({'height':'200px','width':'199px'});
        }
        (correct>num)? $('#higher').css('color','#fff'):$('#higher').css('color','#555');
        (correct>num)? $('#lower').css('color','#555'):$('#lower').css('color','#fff');
    }
    
}

function dialogue(whatToSay) {
    //this takes the dialogue and fills the diag div with. Also creates an 'okay' (close) button.
    var diagDiv = $('#diag');
    diagDiv.show(250);
    whatToSay = whatToSay + '<br/><hr/><button onclick=\'$(\"#diag\").hide(250);$(\"#theGuess\").focus();\' id=\'diagButton\'>Okay!</button>';
    $('#diagButton').focus();
    diagDiv.html(whatToSay );
}
function resetConf(){
    var wipeIt=confirm('Are you absolutely sure you want to wipe the epic and timeless memories of playing this guessing game?\nThis will wipe EVERYTHING!');
    (wipeIt)?reset("Clearing Data!",0):dialogue('Back to the game, then!');
}
function reset(toDiag,noWipe){
    //reset ALL the things!
    //this will occur whether we win, lose, or press reset
    if (!noWipe) {
        //go ahead and wipe data, including: list of guessed items,
        //win/loss record (session) and win/loss record (local)
        $('#history').innerHTML = 'Game History<hr/>';
        winLoss = [0,0];
        localStorage.myScore=winLoss;
    }

    dialogue(toDiag);
    numGuesses=5;
    myGuess=120;
    guessedList=[];
    guessed=0;
    correct = Math.floor(Math.random()*100)+1;
    $('#guessesLeft').html('You have 5 guesses left!');
}

function stats() {
    var totalGames  = winLoss[0] + winLoss[1];
    if (totalGames>=1 && winLoss[1]>0) {
        //played games, and 1 or more losses (to prevent divide by zero err)
        dialogue('Wins: '+winLoss[0]+'<br/>Losses: '+winLoss[1]+'<hr/>Win / Loss ratio: '+ Math.round((winLoss[0]/winLoss[1])*100)+'% wins.<br/><hr/>Your title: <br/><span  class = \'titles\' style=\'background-color:'+curTitCol+'\'>'+title+'</span>');
    }
    else if (totalGames>=1 && winLoss[1]==0) {
        //played games, no losses
        dialogue('Wins: '+winLoss[0]+'<br/>Losses: '+winLoss[1]+'<hr/>Win / Loss ratio: 100% wins.<br/><hr/>Your title: <br/><span class = \'titles\' style=\'background-color:'+curTitCol+'\'>'+title+'</span>');
    }
    else{
        dialogue('You need to play a game first!');
    }
}

function updateRecords(){
    //pos 0 = win, 1 = loss
    /*this function takes the current win/loss record and does a few things with it.
     Firstly, it updates the myScore var (stored locally) to reflect the winLoss var (temp, session var)
     Next, it uses an equation to determine your current "Title":
     */
    var scoreMag=0;//the magnitude of your win/loss. Determines the 'rank'
    localStorage.myScore = winLoss;
    var titles = ['Cursed','Unlucky','Losing Streak','Just A Bad Day','Could Do Better','Even Steven','Could Do Worse','A Good Day','Winning Streak','Lucky','Blessed']; //list of 'titles';
    if (winLoss[0] > winLoss[1] && winLoss[1]==0) {
        //wins, no losses
        curTitCol='#22b';
        title = titles[titles.length-1];
    } else if (winLoss[0] < winLoss[1] && winLoss[0]==0) {
        //losses, no wins
        curTitCol='#b22';
        title = titles[0];
    } else {
        
        //anything else, ranging basically from .1 (10%) to .9 (90%)
        scoreMag = Math.round((winLoss[0] / (winLoss[0]+winLoss[1])) * 10);
        curTitCol=titleCols[scoreMag];
        title = titles[scoreMag];
    }
    
}