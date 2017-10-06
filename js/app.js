function HangmanGame(wordToDiscover) {
    partialWordArray = []
    finalWordArray = []
    letterUndiscovered = "_"
    wrongTries = []
    totalScoreCookieName = "totalScore"
    partialScoreCookieName = "partialScore"

    function init(){
        wordLength = wordToDiscover.length
        for (i = 0; i < wordLength; i++){
            finalWordArray.push(wordToDiscover[i])
            partialWordArray.push(letterUndiscovered)
        }
        setPartialScore(100)
        updateScore(getTotalScore(), 100)
        loadWordDefinition()        
        updatePartialWord()
        addTryAction()
    }

    function loadWordDefinition(){
        $.ajax({
            "url": "http://api.pearson.com/v2/dictionaries/entries",
            data: {
                headword: wordToDiscover
            }
        })
            .done(function(obj) {
                var results = obj.results
                resultsLength = results.length
                for (i = 0; i < resultsLength; i++){
                    if (results[i].senses){
                        var senses = results[i].senses
                        sensesLength = senses.length
                        for (j = 0; j < sensesLength; j++){
                            var maches = 0
                            if(senses[j].definition){
                                var definition = String(senses[j].definition)
                                var regExp = new RegExp(wordToDiscover, "i");
                                var maches = definition.match(regExp);
                                if (maches == null) {
                                    dataset = String(results[i].datasets[0])
                                    dataSetInList = $.inArray(dataset, ["leasd", "laesd", "brpe", "lase", "brep", "laes", "ldec"])
                                    if(dataSetInList == -1){
                                        addWordDefinition(definition, dataset)
                                    }
                                }
                            }
                        }
                    }
                }
            })
            .fail(function() {
                alert( "error: definition request" );
            })
    }

    function addWordDefinition(definition, reference){
        switch(reference) {
            case "ldoce5":
                reference = "Longman Dictionary of Contemporary English (5th edition)"
                break;
            case "lasde":
                reference = "Longman Active Study Dictionary"
                break;
            case "wordwise":
                reference = "Longman Wordwise Dictionary"
                break;
            case "laad3":
                reference = "Longman Advanced American Dictionary"
                break;
            default:
                reference = "person API"   
        }
        $('.word-definition').append('<blockquote><p>' + definition + '</p><footer>From <cite title="Source Title">' + reference + '</cite></footer></blockquote>')
    }

    function addTryAction(){
        button = $('.btn-try-a-letter')
        button.on('click', tryALetter)
    }

    function tryALetter(){
        letter = ($('.next-letter').val()).toLowerCase()
        changes = 0
        wordLength = finalWordArray.length
        for (i = 0; i < wordLength; i++){
            if (finalWordArray[i].toLowerCase() == letter){
                changes = changes + 1
                partialWordArray[i] = finalWordArray[i]
            }
        } 
        updateStatus(changes, letter)
    }

    function updateStatus(changes, letter){
        if (changes > 0){
            updateSucess(letter)
        }
        else{
            updateError(letter)
        }
        cleanLetter()
    }

    function cleanLetter(){
        $('.next-letter').val("")
    }

    function updateError(letter){
        wrongTries.push(letter)
        $('.wrong-words').text("Wrong-words: " + wrongTries.toString())
        wrongAttempts = wrongTries.length
        if (wrongAttempts <= 6){
            updateImage(wrongAttempts)
            countError()
        }
        if (wrongAttempts >= 6){
            addRestartButton()
        }
    }

    function countError(){
        totalScore = getTotalScore()
        partialScore = getPartialScore()
        totalScore -= 20
        partialScore -= 20
        setTotalScore(totalScore)
        setPartialScore(partialScore)
        updateScore(totalScore, partialScore)
    }

    function getTotalScore(){
        totalScore = 0
        if (cookieExist(totalScoreCookieName)){
            totalScore = getCookie(totalScoreCookieName)
        }
        else {
            setTotalScore(totalScore)
        }
        return totalScore
    }

    function setTotalScore(value){
        setCookie(totalScoreCookieName, value)
    }

    function getPartialScore(){
        partialScore = 100
        if (cookieExist(partialScoreCookieName)){
            partialScore = getCookie(partialScoreCookieName)
            if (Number(partialScore) < 0){
                setPartialScore(100)
            }
        }
        else {
            setPartialScore(partialScore)
        }
        return partialScore
    }

    function setPartialScore(value){
        setCookie(partialScoreCookieName, value)
    }

    function updateScore(totalScore, partialScore){
        totalScoreContainer = $('.total-score')
        partialScoreContainer = $('.partial-score')
        totalScoreContainer.text(totalScore)
        partialScoreContainer.text(partialScore)
    }

    function addRestartButton(){
        var button = $('<button type="button" class="btn-restart btn btn-primary">Restart/Next</button>')
        button.on('click', function(){
            location.reload();
        })
        $('.btn-try-a-letter').remove()
        $('.try-form').append(button)
    }

    function updateSucess(){
        if (wordDiscovered()) {
            addRestartButton()
            updateImage("win")
            numberGame = getCookie("numberGame")
            setCookie("numberGame", Number(numberGame) + 1)
        }
        updatePartialWord()
    }

    function updateImage(imageName){
        $('.hangman-status').attr("src", "img/" + imageName + ".png")
    }

    function wordDiscovered(){
        wordLength = wordToDiscover.length
        rightExamples = 0
        for (i = 0; i < wordLength; i++){
            if (finalWordArray[i] == partialWordArray[i]){
                rightExamples += 1
            }
        } 
        return rightExamples == wordLength
    }

    function updatePartialWord(){
        var container = $('.parcial-word')
        container.html(createPartialWord())
    }

    function createPartialWord(){
        var container = "<div>"
        wordLength = partialWordArray.length
        for (i = 0; i < wordLength; i++){
            letterContainer = '<div class="word-letter thumbnail">#letter</div>'
            container = container + letterContainer.replace("#letter", partialWordArray[i])
        }
        container = container + "</div>"
        return container
    }


    return {
        run: function(){
            init()
        }
    }
}

username = getCookie("username")
if (username != ""){
    login()
}

$('.btn-login').on('click', function(){
    username = $('.username').val()
    login()
})

function login(){
    if (username == "Bia"){
        setCookie("username", "Bia")
        $('.game-container').removeClass('hide')
        $('.login-container').addClass('hide')
        if (cookieExist("numberGame")){
            numberGame = getCookie("numberGame")
        }
        else{
            setCookie("numberGame", 0)
            setCookie("totalScore", 300)
            numberGame = 0
        }
        game = HangmanGame(biaWords[numberGame]) //from bia.js
        game.run()
    }
    else if (username == "Marco"){
        setCookie("username", "Marco")
        $('.game-container').removeClass('hide')
        $('.login-container').addClass('hide')
        if (cookieExist("numberGame")){
            numberGame = getCookie("numberGame")
        }
        else{
            setCookie("numberGame", 0)
            numberGame = 0
        }
        game = HangmanGame(marcoWords[numberGame]) //from marco.js
        game.run()  
    }
    else{
        alert('Digite Bia ou Marco')
    }
}

function cookieExist(cookieName) {
    return getCookie(cookieName) != "";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + ((((1/24)/60)*20) * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}