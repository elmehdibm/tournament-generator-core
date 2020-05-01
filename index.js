var LastNodesNumber = 1;

var PlayersNumber = 0;

var index = 0;

var inMemoryBFS = [];

var Players = [];

var principalNode = null;

var nodesRegisterByPlayer = {};

var nodesRegisterByTreeLevel = {};

var levelVariable = 0;

function Node(info) {
    this.info = info;
    this.subNodeLeft = null;
    this.subNodeRight = null;
    this.parentNode = null;
    this.level = 0;
    this.toString = function toString() {
        if (this.info.player === undefined) {
            return "Node-x";
        }
        return "Node-" + this.info.player.name;
    }
}

function Player(name) {
    this.name = name;
}

function is_Int(number) {
    return (number % 1 === 0);
}

function is_StrictlyFloat(number) {
    return (number % 1 !== 0);
}

function generateRandomIntTo(max) {
    return parseInt((Math.random() * 1000000).toFixed()) % max;
}

function generateRandomelyPlayersList(array) {
    PlayersNumber = array.length;
    const listOfRandomes = [];
    const newArray = [];
    var i = 0;
    while (i < PlayersNumber) {
        var random = generateRandomIntTo(PlayersNumber);
        if (!listOfRandomes.includes(random)) {
            newArray[random] = array[i];
            listOfRandomes.push(random);
            i++;
        };
    };
    Players = newArray;
}

function constructTree() {
    if (LastNodesNumber < PlayersNumber) {
        var allChilds = [];
        for (var k = 0; k < inMemoryBFS.length; k++) {
            LastNodesNumber++;
            var nodeLeft = new Node(
                {
                    "player": new Player("x"),
                    "state": "idle"
                }
            );
            var nodeRight = new Node(
                {
                    "player": new Player("x"),
                    "state": "idle"
                }
            );
            index += 2;
            if (levelVariable === 0) {
                nodeLeft.level = 1;
                nodeRight.level = 1;
                nodesRegisterByTreeLevel[1] = [nodeLeft, nodeRight];
                levelVariable++;
            } else if (levelVariable >= 1) {
                var newLevel = Math.log2(inMemoryBFS.length) + 1;
                nodeLeft.level = newLevel;
                nodeRight.level = newLevel;
                if (nodesRegisterByTreeLevel[newLevel] === undefined) {
                    nodesRegisterByTreeLevel[newLevel] = [nodeLeft, nodeRight];
                } else {
                    nodesRegisterByTreeLevel[newLevel].push(nodeLeft, nodeRight);
                }
            }
            inMemoryBFS[k].subNodeLeft = nodeLeft;
            inMemoryBFS[k].subNodeRight = nodeRight;
            nodeLeft.parentNode = inMemoryBFS[k];
            nodeRight.parentNode = inMemoryBFS[k];

            allChilds.push(nodeLeft);
            allChilds.push(nodeRight);
        }
        inMemoryBFS = allChilds;
        constructTree();
    }
}

function TournamentBoard(players) {
    this.players = players;
    this.numberOfMutations = 0;
    this.previousTree = null;
    this.tree = null;
    this.nodesRegisterByTreeLevel = null;
    this.nodesRegisterByPlayer = null;
    this.data = {
        "errors": []
    };
    this.qualifyPlayer = function qualifyPlayer(namePlayer) {
        var node = this.nodesRegisterByPlayer[namePlayer];
        if (node) {
            var parent = node.parentNode;
            if (parent
                && parent.subNodeLeft !== node
                && parent.subNodeLeft.info.player.name !== "x"
            ) {
                parent.info.player.name = namePlayer;
                parent.subNodeLeft.info.state = "looser";
                parent.subNodeRight.info.player.name = "";
                this.nodesRegisterByPlayer[namePlayer] = parent;
                this.numberOfMutations++;
                if (this.numberOfMutations > 1000000) {
                    this.numberOfMutations = 0;
                }
            } else if (parent
                && parent.subNodeRight !== node
                && parent.subNodeRight.info.player.name !== "x"
            ) {
                parent.info.player.name = namePlayer;
                parent.subNodeRight.info.state = "looser";
                parent.subNodeLeft.info.player.name = "";
                this.nodesRegisterByPlayer[namePlayer] = parent;
                this.numberOfMutations++;
                if (this.numberOfMutations > 1000000) {
                    this.numberOfMutations = 0;
                }
            }
        }
    };
    this.construct = function construct() {
        this.numberOfMutations++;
        if (this.numberOfMutations > 1000000) {
            this.numberOfMutations = 0;
        }
        this.tree = new Node({
            "player": new Player("x"),
            "state": "winner"
        });
        principalNode = this.tree;
        nodesRegisterByTreeLevel[0] = [this.tree];
        inMemoryBFS.push(principalNode);
        constructTree();
        this.nodesRegisterByTreeLevel = nodesRegisterByTreeLevel;
        var emptyPlayerNodes = [];
        for (var k = 0; k < inMemoryBFS.length; k++) {
            if (this.players[k] === undefined) {
                inMemoryBFS[k].info.player.name = "NaN";
                inMemoryBFS[k].info.state = "looser";
                emptyPlayerNodes.push(inMemoryBFS[k]);
            } else {
                inMemoryBFS[k].info.player.name = this.players[k];
                nodesRegisterByPlayer[this.players[k]] = inMemoryBFS[k];
            }
        };
        console.group("Hydration of the tree");
        console.log("Managing players with no oponenents and empty cases");
        console.log("the List of players are :", this.players);
        console.log("the empty player nodes are :", emptyPlayerNodes);
        // The Dept of correcting exceptions is just handling non presence of 4 players in the tree (it's working for a board of 8 players and below)
        console.log("Number of empty players is ", emptyPlayerNodes.length);
        
        var inMemoryPlayers = this.players;
        var neighborsEmptyPlayers = [];
        if(emptyPlayerNodes.length > 0){
            // Getting the neighbors players that will have to change their positions :
            var stepperNeighbors = emptyPlayerNodes.length;
            while(is_StrictlyFloat(Math.log2(stepperNeighbors)) || neighborsEmptyPlayers.length === 0){
                neighborsEmptyPlayers.push(inMemoryPlayers.pop());
                stepperNeighbors++;
            }
            console.log("This is the neighbors : ", neighborsEmptyPlayers);
        }

        // We Clear the Unused Vars
        inMemoryPlayers = undefined;
        
        // for (var j = emptyLooserNodes.length - 1; j > -1; j--) {
        //     var node = emptyLooserNodes[j];
        //     var parent = node.parentNode;
        //     if (parent && parent.subNodeLeft !== node) {
        //         if (parent.subNodeLeft.info.player.name === "") {
        //             parent.info.player.name = "N/A";
        //             parent.info.state = "looser";
        //         } else {
        //             parent.info.player.name = parent.subNodeLeft.info.player.name;
        //             parent.info.state = "idle";
        //             parent.subNodeLeft.info.player.name = "";
        //             parent.subNodeLeft.info.state = "looser";
        //             var parentOfParent = parent.parentNode;
        //             if (
        //                 parentOfParent
        //                 && (
        //                     (parentOfParent.subNodeLeft
        //                         && parentOfParent.subNodeLeft.info.player.name === "N/A")
        //                     || (parentOfParent.subNodeRight
        //                         && parentOfParent.subNodeRight.info.player.name === "N/A")
        //                 )
        //             ) {
        //                 parentOfParent.info.player.name = parent.info.player.name;
        //                 parentOfParent.info.state = "idle";
        //                 parent.info.state = "looser";
        //                 parent.info.player.name = "N/A";
        //                 nodesRegisterByPlayer[parentOfParent.info.player.name] = parentOfParent;
        //             } else {
        //                 nodesRegisterByPlayer[parent.info.player.name] = parent;
        //             }
        //         }
        //     } else if (parent && parent.subNodeRight !== node) {
        //         if (parent.subNodeRight.info.player.name === "") {
        //             parent.info.player.name = "N/A";
        //             parent.info.state = "looser";
        //         } else {
        //             parent.info.player.name = parent.subNodeRight.info.player.name;
        //             parent.info.state = "idle";
        //             parent.subNodeRight.info.player.name = "";
        //             parent.subNodeRight.info.state = "looser";
        //             var parentOfParent = parent.parentNode;
        //             if (
        //                 parentOfParent
        //                 && (
        //                     (parentOfParent.subNodeLeft
        //                         && parentOfParent.subNodeLeft.info.player.name === "N/A")
        //                     || (parentOfParent.subNodeRight
        //                         && parentOfParent.subNodeRight.info.player.name === "N/A")
        //                 )
        //             ) {
        //                 parentOfParent.info.player.name = parent.info.player.name;
        //                 parentOfParent.info.state = "idle";
        //                 parent.info.state = "looser";
        //                 parent.info.player.name = "N/A";
        //                 nodesRegisterByPlayer[parentOfParent.info.player.name] = parentOfParent;
        //             } else {
        //                 nodesRegisterByPlayer[parent.info.player.name] = parent;
        //             }
        //         }
        //     }
        // }
        console.groupEnd();
        this.nodesRegisterByPlayer = nodesRegisterByPlayer;
    };
}

function flushData() {
    LastNodesNumber = 1;
    index = 0;
    inMemoryBFS = [];
    principalNode = null;
    levelVariable = 0;
    nodesRegisterByPlayer = {};
    nodesRegisterByTreeLevel = [];
    Players = [];
}

function Triplet(parentNode, subNode1, subNode2) {
     this.parentNode = parentNode;
     this.subNode1 = subNode1;
     this.subNode2 = subNode2;   
};

function MatrixNavigationByDirection(matrix) {
    // This Check needs Improvement
    if( !Array.isArray(matrix) || !Array.isArray(matrix[0]) ){
        throw new Error("It's not a matrix");
    }
    this.canMoveUp = function canMoveUp() {
        if(this.y > 0){
            return 1;
        }
        return 0;
    };
    this.up = function moveUp() {
        if(this.y > 0){
            this.y--;
            return 1;
        }
        return 0;
    };

    this.canMoveDown = function canMoveDown() {
        if(this.y < this.matrix[this.x].length - 1){
            return 1;
        }
        return 0;
    };
    this.down = function moveDown() {
        if(this.y < this.matrix[this.x].length - 1){
            this.y++;
            return 1;
        }
        return 0;
    };

    this.canMoveLeft = function canMoveLeft() {
        if(this.x > 0){
            return 1;
        }
        return 0;
    }
    this.left = function moveLeft() {
        if(this.x > 0){
            this.x--;
            if(
                !this.matrix[this.x][this.y]
            ){
                // If there is nothing on the right Case we must parse the Top map until we found a Good Case
                while(!this.matrix[this.x][this.y]){
                    this.y--;
                }
            }
            return 1;
        }
        return 0;
    }

    this.canMoveRight = function canMoveRight() {
        if(this.x < this.matrix.length - 1){
            return 1;
        }
        return 0;
    }
    this.right = function moveRight() {
        if(this.x < this.matrix.length - 1){
            this.x++;
            if(
                !this.matrix[this.x][this.y]
            ){
                // If there is nothing on the right Case we must parse the Top map until we found a Good Case
                while(!this.matrix[this.x][this.y]){
                    this.y--;
                }
            }
            return 1;
        }
        return 0;
    }
    this.getElement = function getElement(){
        return this.matrix[this.x][this.y];
    }
    this.matrix = matrix;
    this.x = 0;
    this.y = 0;
}

function createNavigationScreenSystem(nodesRegisterByTreeLevel) {
    console.group("Navigation Screens System Creation");
    var arrayT = Object.values(nodesRegisterByTreeLevel);
    console.log("the length of the registry is", arrayT.length);
    arrayT.reverse();
    var nav2dScreens = new Array(arrayT.length - 1);
    if(arrayT.length >= 4){
        for(var i = 0; i < nav2dScreens.length; i++){
            var arrayOfIndexI = arrayT[i];
            var arrayHorizontalScreen;
            if(i === 0){
                arrayHorizontalScreen = new Array(arrayOfIndexI.length / 4);
                var stepperArrayTOfIndexI = 0;
                for (var j = 0; j < arrayHorizontalScreen.length; j++) {
                    var screenElement = {
                        "triplet1": new Triplet(),
                        "triplet2": new Triplet()
                    };
                    var limitStepper = stepperArrayTOfIndexI + 4;
                    if(stepperArrayTOfIndexI < limitStepper){
                        screenElement.triplet1.subNode1 = arrayOfIndexI[stepperArrayTOfIndexI];
                        screenElement.triplet1.subNode2 = arrayOfIndexI[stepperArrayTOfIndexI + 1];
                        screenElement.triplet1.parentNode = arrayOfIndexI[stepperArrayTOfIndexI].parentNode;
                        screenElement.triplet2.subNode1 = arrayOfIndexI[stepperArrayTOfIndexI + 2];
                        screenElement.triplet2.subNode2 = arrayOfIndexI[stepperArrayTOfIndexI + 3];
                        screenElement.triplet2.parentNode = arrayOfIndexI[stepperArrayTOfIndexI + 2].parentNode;
                    }
                    stepperArrayTOfIndexI = limitStepper;
                    arrayHorizontalScreen[j] = screenElement;
                }
            }else {
                arrayHorizontalScreen = new Array(arrayOfIndexI.length / 2);
                var stepperArrayTOfIndexI = 0;
                for (var j = 0; j < arrayHorizontalScreen.length; j++) {
                    var screenElement = {
                        "triplet": new Triplet()
                    };
                    var limitStepper = stepperArrayTOfIndexI + 2;
                    if(stepperArrayTOfIndexI < limitStepper){
                        screenElement.triplet.subNode1 = arrayOfIndexI[stepperArrayTOfIndexI];
                        screenElement.triplet.subNode2 = arrayOfIndexI[stepperArrayTOfIndexI + 1];
                        screenElement.triplet.parentNode = arrayOfIndexI[stepperArrayTOfIndexI].parentNode;
                    }
                    stepperArrayTOfIndexI = limitStepper;
                    arrayHorizontalScreen[j] = screenElement;
                }
            }
            nav2dScreens[i] = arrayHorizontalScreen;
        };
    }else{
        // Then the arrayT has length 2
        var screenSingleElement = {
            "triplet": new Triplet()
        };
        screenSingleElement.triplet.subNode1 = arrayT[0];
        screenSingleElement.triplet.subNode2 = arrayT[1];
        screenSingleElement.triplet.parentNode = arrayT[0].parentNode;
        nav2dScreens[0] = [screenSingleElement];
    }
    console.log("the nav2dScreens is : ", nav2dScreens);
    console.groupEnd();
    return new MatrixNavigationByDirection(nav2dScreens);
}

export default function Main(
    namesOfPlayers,
    withScreenNavigation
) {
    console.group("Tournament Generator Core Result");
    // Must Handle Errors of List ( Number of Players , No duplicate Players ...) , Must give a register of error names
    generateRandomelyPlayersList(
        namesOfPlayers
    );
    var tournament = new TournamentBoard(Players);
    // Data PROCESS
    // If Else for other errors :
    // INSUFISANT_PLAYERS
    // DUPLICATED_PLAYERS
    // TOO MUCH PLAYERS

    if(Players.length <= 1){
        tournament.data.errors.push({
            "code": "INSUFISANT_PLAYERS",
            "msg": "The generation of the tournament requires at least two players"
        });
    } else {
        tournament.construct();
        flushData();
        console.log("tree :", tournament.tree);
        console.log("players :", tournament.players);
        console.log("nodesRegisterByPlayer :", tournament.nodesRegisterByPlayer);
        console.log("nodesRegisterByTreeLevel :", tournament.nodesRegisterByTreeLevel);    
        if(withScreenNavigation){
            tournament.data = {"navigationSystem": createNavigationScreenSystem(tournament.nodesRegisterByTreeLevel)};
        }
    }
    console.groupEnd();
    return tournament;
};


// Written By Mehdi BM :)
