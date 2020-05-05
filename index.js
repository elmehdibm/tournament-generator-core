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

/**      The Process of handling the binary Tree       **/

// Global Variables :
var inMemoryNodesInSameLevel = [];
var lastNodesNumber = 1;
var totalActiveNodes = 0;
var nodesRegisterByTreeLevel = {};
var levelVariable = 0;
var index = 0;
function getInitialNodeInfo() {
    return {
        "state": "idle"
    };
};

// MODEL OF A NODE
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
function constructBinaryTree() {
    if (lastNodesNumber < totalActiveNodes) {
        var allChilds = [];
        for (var k = 0; k < inMemoryNodesInSameLevel.length; k++) {
            lastNodesNumber++;
            var nodeLeft = new Node(getInitialNodeInfo());
            var nodeRight = new Node(getInitialNodeInfo());
            index += 2;
            if (levelVariable === 0) {
                nodeLeft.level = 1;
                nodeRight.level = 1;
                nodesRegisterByTreeLevel[1] = [nodeLeft, nodeRight];
                levelVariable++;
            } else if (levelVariable >= 1) {
                var newLevel = Math.log2(inMemoryNodesInSameLevel.length) + 1;
                nodeLeft.level = newLevel;
                nodeRight.level = newLevel;
                if (nodesRegisterByTreeLevel[newLevel] === undefined) {
                    nodesRegisterByTreeLevel[newLevel] = [nodeLeft, nodeRight];
                } else {
                    nodesRegisterByTreeLevel[newLevel].push(nodeLeft, nodeRight);
                }
            }
            inMemoryNodesInSameLevel[k].subNodeLeft = nodeLeft;
            inMemoryNodesInSameLevel[k].subNodeRight = nodeRight;
            nodeLeft.parentNode = inMemoryNodesInSameLevel[k];
            nodeRight.parentNode = inMemoryNodesInSameLevel[k];

            allChilds.push(nodeLeft);
            allChilds.push(nodeRight);
        }
        inMemoryNodesInSameLevel = allChilds;
        constructBinaryTree();
    }
};

/**
 * 
 * @param {the node that we'll transform all its descendants} node 
 * @param {it's a function that receive a node and return the updated node} nodeTransformer 
 * 
 * note : The Rule in nodeTransformer : Don't modify any descendant node except the node in argument of nodeTransformer
 */
function updateDescendantNodesUsingBfs(node, nodeTransformer) {
    if(node !== null && node.subNodeLeft !== null){
        nodeTransformer(node.subNodeLeft);
        updateDescendantNodesUsingBfs(node.subNodeLeft, nodeTransformer);
    }
    if(node !== null && node.subNodeRight !== null){
        nodeTransformer(node.subNodeRight);
        updateDescendantNodesUsingBfs(node.subNodeRight, nodeTransformer);
    }
};

// Node Transformers

//  Decrement the level of a node and handle its position in tree registry
function decrementLevelNodeTransformer(node){
    var parent = node.parentNode;
    if(parent){
        var isLeftNode = (parent.subNodeLeft === node);
        // Getting his sibblingNode
        var sibblingNode = (
            isLeftNode
            ?   parent.subNodeRight
            :   parent.subNodeLeft
        );
        // Get Current Level Node In Registry Tree
        var currentRegistryLevel = nodesRegisterByTreeLevel[node.level];
        var upRegistryLevel = nodesRegisterByTreeLevel[node.level - 1];
        // Checking If its Sibbling is already in the up registry
        var indexOfSibblingInUpRegistry = upRegistryLevel.find(n => n === sibblingNode);
        if(Boolean(indexOfSibblingInUpRegistry)){
            // Means that node has already alocated space
            if(isLeftNode) {
                upRegistryLevel[indexOfSibblingInUpRegistry - 1] = node;
            }
            else {
                upRegistryLevel[indexOfSibblingInUpRegistry + 1] = node;
            }
        } else {
            // Alocating space for sibblingNode and placing the node in the up registry
            // It's a binary tree we'll have always 2 nodes to add then we'll alocate a table of 2 nodes
            // We divise by 2 because in binary tree we can predict the up level number of nodes
            var newIndexInUpRegistry = Math.round(currentRegistryLevel.findIndex(n => n === node) / 2);
            if(isLeftNode) {
                upRegistryLevel.splice(
                    newIndexInUpRegistry,
                    0,
                    node,
                    null
                );
            } else {
                upRegistryLevel.splice(
                    newIndexInUpRegistry,
                    0,
                    null,
                    node
                );
            }
        }
    }
    node.level = Math.max(0, node.level - 1);
};

function killNodeAndTransferParentDataToRemainingChildAndHydrateDescendantLevels(node) {
    var theParentNode = node.parentNode
    if(theParentNode){
        var sibblingNode = (
            (theParentNode.subNodeLeft === node)
            ? theParentNode.subNodeRight
            : theParentNode.subNodeLeft
        );
        // remove the node from nodesRegisterByTreeLevel and kill it
        nodesRegisterByTreeLevel[node.level].splice(
            nodesRegisterByTreeLevel[node.level].findIndex(n => n === node),
            1
        );
        node = null;
        // Transfer Parent Data to sibblingNode
        sibblingNode.info = theParentNode.info;
        // Link Parent of theParentNode with sibblingNode if exist
        if(theParentNode.parentNode) {
            // Update the parent of parentNode by updating its children
            if(theParentNode.parentNode.subNodeLeft === theParentNode) {
                theParentNode.parentNode.subNodeLeft = sibblingNode;
            } else {
                theParentNode.parentNode.subNodeRight = sibblingNode;
            }
        }
        // Update the sibblingNode by adding new Parent
        sibblingNode.parentNode = theParentNode.parentNode;
        // Updating the sibblingNode position in the nodesRegisterByTreeLevel
        var positionOfParentInRegistry = nodesRegisterByTreeLevel[theParentNode.level].findIndex(n => n === theParentNode);
        // Place it in the position
        nodesRegisterByTreeLevel[theParentNode.level][positionOfParentInRegistry] = sibblingNode;
        // Remove it from its old position
        nodesRegisterByTreeLevel[sibblingNode.level].splice(
            nodesRegisterByTreeLevel[sibblingNode.level].findIndex(n => n === sibblingNode),
            1
        );
        // Refresh his new level
        sibblingNode.level = theParentNode.level;
        // Now Killing theParentNode Since we tranfer its data and its antecedants
        theParentNode = null;
        // Hydration of the children of the updated sibblingNode to refresh their new levels
        updateDescendantNodesUsingBfs(sibblingNode, decrementLevelNodeTransformer);
        return 1;
    }
    return 0;
};

function extendLastNodeAndNewSibbling(node, infoNewSibbling) {
    if(node.subNodeLeft === null && node.subNodeRight === null){
        // We Transfer Its data to his subNodeLeft
        node.subNodeLeft = new Node(node.info);
        node.subNodeLeft.level = node.level + 1;
        // We Create the new Node with the new Info
        node.subNodeRight = new Node(infoNewSibbling);
        node.subNodeRight.level = node.level + 1;
        // We Set Idle the info of original node since we transfer its info
        node.info = getInitialNodeInfo();

        // Now Updating the nodesRegisterByTreeLevel
        // First Step : Searching if there is already a node in the upper level:
        var nodesRegisterLevelOfNewNodes = nodesRegisterByTreeLevel[node.level + 1];
        if(nodesRegisterLevelOfNewNodes){
            var nodesRegisterUpperLevel = nodesRegisterByTreeLevel[node.level];
            // Getting the index of original Node in the registry
            var indexOfOriginalNode = nodesRegisterUpperLevel.findIndex(
                n => n === node
            );
            var stepperNewLevelRegistry = nodesRegisterLevelOfNewNodes.length - 1;
            while(stepperNewLevelRegistry >= 0) {
                var node = nodesRegisterLevelOfNewNodes[stepperNewLevelRegistry];
                 // Getting the index of Parent Node in the registry
                var indexOfParentNodeInRegister = nodesRegisterUpperLevel.findIndex(
                    n => n === node.parentNode
                );
                // Compare its position with the index of original Node
                // To know the correct position of new nodes in the register 
                if(indexOfOriginalNode > indexOfParentNodeInRegister){
                    break;
                }
                stepperNewLevelRegistry = stepperNewLevelRegistry - 2;
            }
            nodesRegisterLevelOfNewNodes.splice(
                stepperNewLevelRegistry,
                0,
                node.subNodeLeft,
                node.subNodeRight
            );
        }else{
            nodesRegisterByTreeLevel[node.level + 1] = [node.subNodeLeft, node.subNodeRight];
        }
        return 1;
    }
    return 0;
};

/**  End of the management of tree  **/

// Preparing the 

var Players = [];
var nodesRegisterByPlayer = {};

// MODEL OF PLAYER
function Player(name) {
    this.name = name;
};

/** return {  }
 * 
 * note : 
 */
function getIdleInfoPlayer() {
    return {
        "player": new Player("x"),
        "state": "idle",
    };
};

function generateRandomelyPlayersList(array) {
    totalActiveNodes = array.length;
    const listOfRandomes = [];
    const newArray = [];
    var i = 0;
    while (i < totalActiveNodes) {
        var random = generateRandomIntTo(totalActiveNodes);
        if (!listOfRandomes.includes(random)) {
            newArray[random] = array[i];
            listOfRandomes.push(random);
            i++;
        };
    };
    Players = newArray;
};

// The Tournament Board System that will implements the binary TREE

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
        // Start the creation of the tree
        inMemoryNodesInSameLevel.push(this.tree);
        nodesRegisterByTreeLevel[0] = [this.tree];
        getInitialNodeInfo = getIdleInfoPlayer;
        constructBinaryTree();
        // End the creation of the tree
        this.nodesRegisterByTreeLevel = nodesRegisterByTreeLevel;
        var emptyPlayerNodes = [];
        // Now inMemoryNodesInSameLevel will presents the nodes in the final Level of tree ( the depth of tree )
        for (var k = 0; k < inMemoryNodesInSameLevel.length; k++) {
            if (this.players[k] === undefined) {
                inMemoryNodesInSameLevel[k].info.player.name = "NaN";
                inMemoryNodesInSameLevel[k].info.state = "looser";
                emptyPlayerNodes.push(inMemoryNodesInSameLevel[k]);
            } else {
                inMemoryNodesInSameLevel[k].info.player.name = this.players[k];
                nodesRegisterByPlayer[this.players[k]] = inMemoryNodesInSameLevel[k];
            }
        };
        console.group("Hydration of the tree");
        console.log("Managing players with no oponenents and empty cases");
        console.log("the List of players are :", this.players);
        console.log("the empty player nodes are :", emptyPlayerNodes);
        console.log("Inside the inMemoryNodesInSameLevel ", inMemoryNodesInSameLevel);
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
};


// The Function that clear memory by resetting global variables
function flushData() {
    lastNodesNumber = 1;
    index = 0;
    inMemoryNodesInSameLevel = [];
    levelVariable = 0;
    nodesRegisterByPlayer = {};
    nodesRegisterByTreeLevel = [];
    Players = [];
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
