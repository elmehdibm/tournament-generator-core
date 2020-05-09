/* General Util Functions */

function is_Int(number) {
    return (number % 1 === 0);
};

function is_StrictlyFloat(number) {
    return (number % 1 !== 0);
};

function generateRandomIntTo(max) {
    return parseInt((Math.random() * 1000000).toFixed()) % max;
};

/**      The Process of handling Nodes       **/

function NodeRegistry(){
    this.map = {};
    this.insertNode = (node) => {
        if(this.map[node.level]){
            this.map[node.level][node.position] = node;
        }else{
            this.map[node.level] = [node];
        }
    };
    this.insertNodes = (...args) => {
        args.forEach(node => {
            this.insertNode(node);
        });
    };
    this.removeNode = (node) => {
        if(this.map[node.level]){
            this.map[node.level].splice(
                node.position,
                1
            );
        }
    };
}

// MODEL OF A Binary NODE
function Node(info) {
    this.info = info;
    this.subNodeLeft = null;
    this.subNodeRight = null;
    this.parentNode = null;
    this.level = 0;
    this.position = 0;
    this.toString = function toString() {
        if (this.info.player === undefined) {
            return "Node-x";
        }
        return "Node-" + this.info.player.name;
    }
};

/**
 * 
 * Construction of the binary tree where each node
 *      can have 2 children node or none
 * 
 * note 1 : It's not a pure function ( it uses global variables )
 * note 2 : It's a recursive function each call we manage one level and we repeat
 * note 3 : It constructs nodes level by level and keep in memory nodes on each level in the variable 'inMemoryNodesInSameLevel'
 * note 4 : It initially gives all nodes an idle information by 'getInitialNodeInfo'
 * 
 * ╟╟╟ Instructions to Implement it to other systems ╟╟╟
 *      1 - Create the principal node that represents all the tree ( it's the source node in the tree )
 *      2 - Add the principal node in inMemoryNodesInSameLevel and in nodesRegisterByTreeLevel
 *      3 - Override the getInitialNodeInfo
 *      4 - Call constructBinaryTree()
 */

/**
 * 
 * @param {the node that we'll transform all its descendants} node 
 * @param {it's a function that receive a node and update the node} nodeTransformer 
 * 
 * note : The Rule in nodeTransformer : Don't modify any descendant node except the node in argument of nodeTransformer
 */
function updateDescendantNodesUsingDfs(node, nodeTransformer) {
    if(node !== null && node.subNodeLeft !== null){
        nodeTransformer(node.subNodeLeft);
        updateDescendantNodesUsingDfs(node.subNodeLeft, nodeTransformer);
    }
    if(node !== null && node.subNodeRight !== null){
        nodeTransformer(node.subNodeRight);
        updateDescendantNodesUsingDfs(node.subNodeRight, nodeTransformer);
    }
};

/**
 * 
 * @param {the node that we'll transform all its descendants} node 
 * @param {it's a function that receive a node and update the node} nodeTransformer 
 * 
 * note : The Rule in nodeTransformer : Don't modify any descendant node except the node in argument of nodeTransformer
 */
function recursiveBfs(inMemoryNodesBfs, nextMemoryNodesBfs, nodeTransformer) {
    if(inMemoryNodesBfs.length > 0){
        console.log("Reading from inMemoryNodes", inMemoryNodesBfs);
        inMemoryNodesBfs.forEach(
            node => {
                if(nodeTransformer(node) === -1){
                    return;
                }
                if(node.subNodeLeft !== null){
                    nextMemoryNodesBfs.push(node.subNodeLeft);
                }
                if(node.subNodeRight !== null){
                    nextMemoryNodesBfs.push(node.subNodeRight);
                }                
            }
        );
        console.log("Constructing the nextMemoryNodesBfs", nextMemoryNodesBfs);
        recursiveBfs(nextMemoryNodesBfs, [], nodeTransformer);
    }
    console.log("We Stop the recursive calls");
};

function updateDescendantNodesUsingBfs(node, nodeTransformer) {
    var inMemoryNodesBfs = [];
    if(node.subNodeLeft !== null){
        inMemoryNodesBfs.push(node.subNodeLeft);
    }
    if(node.subNodeRight !== null){
        inMemoryNodesBfs.push(node.subNodeRight);
    }
    recursiveBfs(inMemoryNodesBfs, [], nodeTransformer);
};

function generateChildrenNode(node, getIdleNodeInfo) {
    var leftNode = new Node(getIdleNodeInfo());
    leftNode.level = node.level + 1;
    leftNode.parentNode = node;
    var rightNode = new Node(getIdleNodeInfo());
    rightNode.level = node.level + 1;
    rightNode.parentNode = node;
    node.subNodeLeft = leftNode;
    node.subNodeRight = rightNode;
}

function createDescendantNodesUsingBfs(principalNode, dept, getIdleNodeInfo) {
    if(dept === 0){return;}
    var nodeRegistry = new NodeRegistry();
    generateChildrenNode(principalNode, getIdleNodeInfo);
    principalNode.subNodeLeft.position = 0;
    principalNode.subNodeRight.position = 1;
    var nodePosition = 0;
    var flagLevel = 1;
    nodeRegistry.insertNodes(principalNode, principalNode.subNodeLeft, principalNode.subNodeRight);
    recursiveBfs([principalNode.subNodeLeft, principalNode.subNodeRight], [], (node) => {
        if(node.level === dept){return -1;}
        generateChildrenNode(node, getIdleNodeInfo);
        if(node.level !== flagLevel){
            nodePosition = 0;
            flagLevel = node.level;
        }
        node.subNodeLeft.position = nodePosition;
        node.subNodeRight.position = ++nodePosition;
        nodePosition++;
        nodeRegistry.insertNodes(node.subNodeLeft, node.subNodeRight);
        return 0;
    });
    return nodeRegistry;
};


// MODEL OF PLAYER
function Player(name) {
    this.name = name;
};

function generateRandomelyPlayersList(array) {
    const listOfRandomes = [];
    const newArray = [];
    var i = 0;
    while (i < array.length) {
        var random = generateRandomIntTo(array.length);
        if (!listOfRandomes.includes(random)) {
            newArray[random] = array[i];
            listOfRandomes.push(random);
            i++;
        };
    };
    return newArray;
};

// The Tournament Board System that will implements the binary TREE

function TournamentBoard(players) {
    this.players = generateRandomelyPlayersList(players);
    this.numberOfMutations = 0;
    this.previousTree = null;
    this.tree = null;
    this.nodesRegisterByTreeLevel = null;
    this.nodesRegisterByPlayer = {};
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
            } else if (parent
                && parent.subNodeRight !== node
                && parent.subNodeRight.info.player.name !== "x"
            ) {
                parent.info.player.name = namePlayer;
                parent.subNodeRight.info.state = "looser";
                parent.subNodeLeft.info.player.name = "";
                this.nodesRegisterByPlayer[namePlayer] = parent;
                this.numberOfMutations++;
            }
        }
    };
    this.construct = function construct() {
        this.numberOfMutations++;
        this.tree = new Node({
            "player": new Player("x"),
            "state": "winner"
        });
        var dept = Math.ceil(Math.log2(this.players.length));
        var newRegister = createDescendantNodesUsingBfs(this.tree, dept, () => ({
            "player": new Player("x"),
            "state": "idle",
        }));
        this.nodesRegisterByTreeLevel = newRegister.map;
        var nodesInTreeBottom = newRegister.map[dept];
        var emptyPlayerNodes = [];
        for (var k = 0; k < nodesInTreeBottom.length; k++) {
            if (this.players[k] === undefined) {
                nodesInTreeBottom[k].info.player.name = "NaN";
                nodesInTreeBottom[k].info.state = "looser";
                emptyPlayerNodes.push(nodesInTreeBottom[k]);
            } else {
                nodesInTreeBottom[k].info.player.name = this.players[k];
                this.nodesRegisterByPlayer[this.players[k]] = nodesInTreeBottom[k];
            }
        };
        // console.group("Hydration of the tree");
        // console.log("Managing players with no oponenents and empty cases");
        // console.log("the List of players are :", this.players);
        // console.log("the empty player nodes are :", emptyPlayerNodes);
        // // The Dept of correcting exceptions is just handling non presence of 4 players in the tree (it's working for a board of 8 players and below)
        // console.log("Number of empty players is ", emptyPlayerNodes.length);
        // var neighborsEmptyPlayers = [];
        // if(emptyPlayerNodes.length > 0){
        //     // Getting the neighbors players that will have to change their positions :
        //     var stepperNeighbors = emptyPlayerNodes.length;
        //     while(is_StrictlyFloat(Math.log2(stepperNeighbors)) || neighborsEmptyPlayers.length === 0){
        //         neighborsEmptyPlayers.push(nodesInTreeBottom.pop());
        //         stepperNeighbors++;
        //     }
        //     console.log("This is the neighbors : ", neighborsEmptyPlayers);
        // }
        // console.groupEnd();
    };
};


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
};

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
};

export default function Main(
    namesOfPlayers,
    withScreenNavigation
) {
    console.group("Tournament Generator Core Result");
    // Must Handle Errors of List ( Number of Players , No duplicate Players ...) , Must give a register of error names
    var tournament = new TournamentBoard(namesOfPlayers);
    // Data PROCESS
    // If Else for other errors :
    // INSUFISANT_PLAYERS
    // DUPLICATED_PLAYERS
    // TOO MUCH PLAYERS

    if(namesOfPlayers.length <= 1){
        tournament.data.errors.push({
            "code": "INSUFISANT_PLAYERS",
            "msg": "The generation of the tournament requires at least two players"
        });
    } else {
        tournament.construct();
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
