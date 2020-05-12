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
    this.getDept = () => {
        return Object.values(this.map).length;
    };
    this.putNode = (node) => {
        if(this.map[node.level]){
            this.map[node.level][node.position] = node;
        }else{
            this.map[node.level] = [node];
        }
    };
    this.getNodesInLevel = (level) => {
        if(level >= this.getDept()){
            return null;
        }
        return Array.from(this.map[level].map(n => ({
            ...n
        })));
    };
    this.getNode = (level, position) => {
        return this.map[level].find(n => n.position === position);
    };
    this.getNodeCopy = (level, position) => {
        return this.getNodesInLevel(level)[position];
    };
    this.putNodes = (...args) => {
        args.forEach(node => {
            this.putNode(node);
        });
    };
    this.removeNodes = (...args) => {
        console.log("the nodes to kill are", args);
        var level = args[0].level;
        if(args.length > 0 && this.map[level]){
        this.map[level].splice(
            args[0].position,
            args.length
        );
        (this.getNodesInLevel(level)).slice(args[0].position).forEach((n) => {
            this.getNode(level, n.position).position--;
        });
        }
    };
    this.insertNode = (node, pos) => {
        this.insertNodes([node], node.level, pos);
    };
    this.insertNodes = (nodes, level, pos) => {
        if(this.map[level]){
            this.map[level].splice(
                pos,
                0,
                ...nodes
            );
            (this.getNodesInLevel(level)).slice(pos).forEach((n, index) => {
                this.getNode(level, n.position).level = level;
                this.getNode(level, n.position).position = pos + index;
            });
        }
    };
    this.insertNodesInLast = (nodes, level) => {
        if(!this.map[level]){
            this.map[level] = [];
        }
        this.insertNodes(nodes, level, this.map[level].length);
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
function recursiveBfs(inMemoryNodesBfs, nextMemoryNodesBfs, nodeTransformer, bulknodeTransformer) {
    if(inMemoryNodesBfs.length > 0){
        if(bulknodeTransformer){
            const value = bulknodeTransformer(inMemoryNodesBfs);
            if(value === -1){
                return;
            }
        };
        inMemoryNodesBfs.forEach(
            node => {
                if(nodeTransformer(node) === -1){
                    return;
                };
                if(node.subNodeLeft !== null){
                    nextMemoryNodesBfs.push(node.subNodeLeft);
                }
                if(node.subNodeRight !== null){
                    nextMemoryNodesBfs.push(node.subNodeRight);
                }               
            }
        );
        recursiveBfs(nextMemoryNodesBfs, [], nodeTransformer, bulknodeTransformer);
    }
};

function updateDescendantNodesUsingBfsBulkMode(node, bulknodeTransformer) {
    var inMemoryNodesBfs = [];
    if(node.subNodeLeft !== null){
        inMemoryNodesBfs.push(node.subNodeLeft);
    }
    if(node.subNodeRight !== null){
        inMemoryNodesBfs.push(node.subNodeRight);
    }
    recursiveBfs(inMemoryNodesBfs, [], _ => 0, bulknodeTransformer);
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
/**
 * 
 * Construction of the binary tree where each node
 *      can have 2 children node or none
 * 
 *  @param {} principalNode 
 *  @param {} dept 
 *  @param {} getIdleNodeInfo 
 * 
 * note : It's a recursive function each call we manage one level and we repeat
 * 
 */
function createDescendantNodesUsingBfs(principalNode, dept, getIdleNodeInfo) {
    if(dept === 0){return;}
    var nodeRegistry = new NodeRegistry();
    generateChildrenNode(principalNode, getIdleNodeInfo);
    principalNode.subNodeLeft.position = 0;
    principalNode.subNodeRight.position = 1;
    var nodePosition = 0;
    var flagLevel = 1;
    nodeRegistry.putNodes(principalNode, principalNode.subNodeLeft, principalNode.subNodeRight);
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
        nodeRegistry.putNodes(node.subNodeLeft, node.subNodeRight);
        return 0;
    });
    return nodeRegistry;
};

function findNearestRelatedParent(...nodes){
    if(nodes.length === 0){return -1};
    var initialNode = nodes[0];
    var isTrueParent = true;
    nodes.forEach(node => {
        if(!node.parentNode || !initialNode.parentNode){
            return -1;
        }
        if(node.parentNode !== initialNode.parentNode){
            isTrueParent = false;
        }
    });
    if(isTrueParent){
        return initialNode.parentNode;
    }
    return findNearestRelatedParent(...(Array.from(new Set(nodes.map(n => n.parentNode)))));
};

function getSibbling(node){
    if(node.parentNode){
        return (node.parentNode.subNodeLeft === node) ? node.parentNode.subNodeRight : node.parentNode.subNodeLeft;
    }
    return null;
};

function exchangeInfoBetweenTwoNodes(node1 , node2){
    var info = node1.info;
    node1.info = node2.info;
    node2.info = info;
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
        var lastNodes = Array.from(newRegister.map[dept]);
        var lastActiveNodes = [];
        var emptyPlayerNodes = [];
        for (var k = 0; k < lastNodes.length; k++) {
            if (this.players[k] === undefined) {
                lastNodes[k].info.player.name = "NaN";
                lastNodes[k].info.state = "looser";
                emptyPlayerNodes.push(lastNodes[k]);
            } else {
                lastActiveNodes.push(lastNodes[k]);
                lastNodes[k].info.player.name = this.players[k];
                this.nodesRegisterByPlayer[this.players[k]] = lastNodes[k];
            }
        };
        console.group("Hydration of the tree");
        console.log("Managing players with no oponenents and empty cases");
        // Getting the neighbors players that will have to change their positions :
        var neighborsEmptyPlayers = [];
        if(emptyPlayerNodes.length > 0){
            var stepperNeighbors = emptyPlayerNodes.length;
            while(is_StrictlyFloat(Math.log2(stepperNeighbors)) || neighborsEmptyPlayers.length === 0){
                neighborsEmptyPlayers.push(lastActiveNodes.pop());
                stepperNeighbors++;
            }
        }
        if(neighborsEmptyPlayers.length > 0){
            var nearestParent = findNearestRelatedParent(...[
                ...neighborsEmptyPlayers,
                ...emptyPlayerNodes
            ]);
            // Process Of Killing nodes and replacing positions
            updateDescendantNodesUsingDfs(nearestParent, (node) => {
                newRegister.removeNodes(node);
                node = null;
            });
            var sibblingsNearestParent = getSibbling(nearestParent);
            if(nearestParent.parentNode.subNodeLeft === nearestParent){
                newRegister.removeNodes(nearestParent, sibblingsNearestParent);
            }else {
                newRegister.removeNodes(sibblingsNearestParent, nearestParent);
            }
            updateDescendantNodesUsingBfsBulkMode(
                sibblingsNearestParent,
                (nodes) => {
                    console.log("we operate the nodes", nodes);
                    newRegister.removeNodes(...nodes);
                    newRegister.insertNodes(
                        nodes,
                        nodes[0].level - 1,
                        nodes[0].position
                    );
                }
            );
            if(newRegister.getNodesInLevel(newRegister.getDept() - 1).length === 0){
                delete newRegister.map[newRegister.getDept() - 1];
            }
            (sibblingsNearestParent.parentNode).subNodeLeft = sibblingsNearestParent.subNodeLeft;
            (sibblingsNearestParent.parentNode).subNodeRight = sibblingsNearestParent.subNodeRight;
            sibblingsNearestParent.subNodeLeft.parentNode = sibblingsNearestParent.parentNode;
            sibblingsNearestParent.subNodeRight = sibblingsNearestParent.parentNode;
            nearestParent = null;
            sibblingsNearestParent = null;
            console.log("The rest of nodes ", neighborsEmptyPlayers);
            var nodesToInsert = [];
            var impactedNodes = lastActiveNodes.slice(lastActiveNodes.length - neighborsEmptyPlayers.length);
            neighborsEmptyPlayers.forEach((node, index) => {
                var newNode = new Node({
                    "player": new Player("x"),
                    "state": "idle",
                });
                exchangeInfoBetweenTwoNodes(newNode, impactedNodes[index]);
                newNode.level = node.level;
                newNode.position = node.position + index;
                newNode.parentNode = impactedNodes[index];
                node.parentNode = impactedNodes[index];
                impactedNodes[index].subNodeLeft = newNode;
                impactedNodes[index].subNodeRight = node;
                nodesToInsert.push(newNode, node);
                this.nodesRegisterByPlayer[newNode.info.player.name] = newNode;
            });
            newRegister.insertNodesInLast(nodesToInsert, neighborsEmptyPlayers[0].level);
            // End
        }
        console.groupEnd();
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
    // DUPLICATED_PLAYERS No 
    // TOO MUCH PLAYERS You can have it hhh

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
