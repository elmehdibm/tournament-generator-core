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
        if(level < this.getDept()){
            return Array.from(this.map[level].map(n => ({
                ...n
            })));    
        }
        return null;
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
        console.log("we insert the nodes in the level ", level, nodes);
        console.log("we must position them in", pos , "and in the level ", level);
        console.log("before in the level to change", this.getNodesInLevel(level));
        if(this.map[level]){
            this.map[level].splice(
                pos,
                0,
                ...nodes
            );
            console.log("inter in the level to change", this.getNodesInLevel(level));
            console.log("we get some node", this.getNode(level, nodes[0].position));
            (this.getNodesInLevel(level)).slice(pos).forEach((n, index) => {
                var node = this.getNode(level, n.position);
                node.position = pos + index;
            });
        }
        console.log("after in the level to change", this.getNodesInLevel(level));
        // We notice that after all the operations some nodes doesn't have the same level value
        console.log("trying to have all the nodes");
        this.getNodesInLevel(level).forEach(n => {
            var node = this.getNode(level, n.position);
            node.level = level;
        })
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
    console.log("Begin the recursive call");
    console.log("the InMemory Data", inMemoryNodesBfs);
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

function Triplet(parentNode, subNode1, subNode2) {
    this.parentNode = parentNode;
    this.subNode1 = subNode1;
    this.subNode2 = subNode2;   
};

// Other Helper to navigate Map

function MatrixNavigationByDirection(matrix) {
   // This Check needs Improvement
   this.matrix = matrix;
   this.x = 0;
   this.y = 0;

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
    this.construct = function construct(withScreenNavigation) {
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
            sibblingsNearestParent.position--;
            updateDescendantNodesUsingBfsBulkMode(
                sibblingsNearestParent,
                (nodes) => {
                    newRegister.removeNodes(...nodes);
                    newRegister.insertNodes(
                        nodes,
                        nodes[0].level - 1,
                        nodes[nodes.length - 1].parentNode.position + 1
                    );
                }
            );
            if(newRegister.getNodesInLevel(newRegister.getDept() - 1).length === 0){
                delete newRegister.map[newRegister.getDept() - 1];
            }
            (sibblingsNearestParent.parentNode).subNodeLeft = sibblingsNearestParent.subNodeLeft;
            (sibblingsNearestParent.parentNode).subNodeRight = sibblingsNearestParent.subNodeRight;
            (sibblingsNearestParent.subNodeLeft).parentNode = sibblingsNearestParent.parentNode;
            (sibblingsNearestParent.subNodeRight).parentNode = sibblingsNearestParent.parentNode;
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
        }
        console.groupEnd();
        if(withScreenNavigation){
            console.group("Creation of navigation System");
            var nav2dScreens = [];
            updateDescendantNodesUsingBfsBulkMode(this.tree, (nodes) => {
                const length = nodes.length;
                var copyNodes = Array.from(nodes);
                var screens = [];

                if(length >= 4) {
                    console.log("two tripplet");
                    for(let i = 0; (i + 4) <= length; i = i + 4){
                        console.log("Loop", i);
                        var node1 = copyNodes.shift();
                        var node2 = copyNodes.shift();
                        var node3 = copyNodes.shift();
                        var node4 = copyNodes.shift();
                        console.log(node1, node2, node3, node4);
                        screens.push({
                            "triplet1": new Triplet(node1.parentNode, node1, node2),
                            "triplet2": new Triplet(node3.parentNode, node3, node4)
                        });
                    }
                }
                if(length > 1 && length % 4 !== 0) {
                    console.log("one tripplet");
                    var node1 = copyNodes.shift();
                    var node2 = copyNodes.shift();
                    screens.push({
                        "tripplet": new Triplet(node1.parentNode, node1, node2)
                    });
                }
                console.log("the screens are", screens);
                if(screens.length > 0){
                    nav2dScreens.push(screens);
                }
                console.log("the nav2dScreens is", nav2dScreens);
            });
            console.log("result ", nav2dScreens);
            this.data["navigationSystem"] = new MatrixNavigationByDirection(nav2dScreens.reverse());
            console.groupEnd();    
        }
    };
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
        tournament.construct(withScreenNavigation);
        console.log("tree :", tournament.tree);
        console.log("players :", tournament.players);
        console.log("nodesRegisterByPlayer :", tournament.nodesRegisterByPlayer);
        console.log("nodesRegisterByTreeLevel :", tournament.nodesRegisterByTreeLevel);
        console.log("data tournament : ", tournament.data);
    }
    console.groupEnd();
    return tournament;
};

// Written By Mehdi BM :)
