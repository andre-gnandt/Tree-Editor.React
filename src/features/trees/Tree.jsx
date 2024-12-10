import {useEffect} from 'react'
import TreeNode from '../nodes/TreeNode';
import { Provider} from 'react-redux';
import { store } from '../../store';
import LineTo from 'react-lineto';
import Draggable from 'react-draggable';
import { createRoot } from 'react-dom/client';
import CreateNode from '../nodes/CreateNode';
import CreateRoot from '../nodes/CreateRoot';
import EditTree from '../trees/EditTree';
import { useNavigate } from 'react-router-dom';
import HeaderInfo from '../utils/HeaderInfo';
import { updateManyNodes } from '../../api/nodes/nodesApi';
import 'primeicons/primeicons.css';
import '../trees/tree.css';

/*extra node properties include:
'position'
'left'
'top'
'line'
'dialog'
'path'
*/

//Due to strange issues and positioning with the CSS transform 
//property of tree nodes on re renders, this component will NEVER Re render
//Re renders of the tree diagram must be done manually
const Tree = ({id, treeFetch}) => {
  const navigate = useNavigate();
  const treeDetails = treeFetch != null && treeFetch.tree != null ? treeFetch.tree : null;
  var originalTree = treeFetch != null && treeFetch.root != null ? treeFetch.root : null;
  var tree = originalTree != null ? structuredClone(originalTree) : null;
  const pixelsToCentimetres = PixelSizeInCentimetres();
  var maxLevels = new Object();
  var scrollXBefore = 0;
  var scrollYBefore = 0;
  var scrollDistanceX = 0;
  var scrollDistanceY = 0;
  var treeWidth = 0;
  var treeHeight = 0;
  var treeWidthMin = null;
  var treeWidthMax = null;
  var childPositions = new Object();
  var nodeDictionary = new Object();
  var originalDictionary = {...nodeDictionary};
  var changeTracker = new Object();
  var nodeList = [];
  var dragging = false;
  var mouseOverNode = null;
  const minimumNodeSize = 1.15/pixelsToCentimetres; //1.4 cm in pixels
  var nodeDimension = 80;
  const iconDimension = 0.08*window.innerHeight;
  const horizontalBorder = 15; //in pixels
  var testRender = false;

  useEffect(() => {
    
    if(tree) AddLines(tree);
    if(treeDetails)
    {
      document.getElementById('save-tree-positions').disabled = true;
      document.getElementById('revert-tree-positions').disabled = true;
    }

    window.addEventListener('resize', ReRenderTree);
    return () => window.removeEventListener('resize', ReRenderTree);
  });

  function PixelSizeInCentimetres() {
    var cpi = 2.54; // centimeters per inch
    var dpi = 96; // dots per inch
    var ppd = window.devicePixelRatio; // pixels per dot
    return (cpi / (dpi * ppd));
  }

  //used for a non parent changed update of node content
  function UpdateChangeTrackerCallback(node)
  {
    originalDictionary[node.id] = {...node};
    delete changeTracker[node.id];

    if(Object.keys(changeTracker).length === 0) 
    {
      document.getElementById('save-tree-positions').disabled = true;
      document.getElementById('revert-tree-positions').disabled = true;
    }
  }

  function SetNodePropertiesForUpdate(src, dest)
  {
    dest.id = src.id;
    dest.title = src.title;
    dest.files = src.files;
    dest.number = src.number;
    dest.data = src.data;
    dest.rankId = src.rankId;
    dest.thumbnailId = src.thumbnailId;
    dest.level = src.level;
    dest.treeId = src.treeId;
  }

  function ReRenderTree(callback = null, newNode = null, nodeId = null, newParentId = null, oldParentId = null)
  {
    const treeContainer = createRoot(document.getElementById('tree-root'));
    if(!tree && !newNode)
    {
       treeContainer.render((RenderTree(tree)));
       return;
    }
    else if(tree)
    {
      
      RemoveLines(tree);
    }

    nodeList = [];
    nodeDictionary = [];
    var inputTree = tree;
    var node = null;

    //change the trees frontend structure to match the changes that were made in the database (without any api calls)
    //triggered from a saved change of parent node or creation of a new node from the node details dialog (from a POST node or PUT node request)
    if(callback)
    {
      inputTree = structuredClone(tree);
      tree = inputTree;

      if(callback === "update")
      {
        RemoveLine({id: nodeId, nodeId: oldParentId});
        node = AlterTreeStructureForParentNodeChange(inputTree, nodeId, newParentId, oldParentId);
        const originalNode = AlterTreeStructureForParentNodeChange(originalTree, nodeId, newParentId, oldParentId);

        SetNodePropertiesForUpdate(newNode, node);
        SetNodePropertiesForUpdate(newNode, originalNode);
      }
      else if(callback === "create")
      {
        node = AlterTreeStructureForCreateNode(inputTree, newNode);
        AlterTreeStructureForCreateNode(originalTree, {...newNode});
      }
      else if(callback === "new root")
      {
        node = AlterTreeAtructureForCreateRoot(inputTree, newNode);
        inputTree = newNode;
        tree = newNode;

        const copyNewNode = structuredClone(newNode);
        copyNewNode.children = [];
        const originalTreeRoot = AlterTreeAtructureForCreateRoot(originalTree, copyNewNode);
        originalTree = originalTreeRoot;

      }
      else if(callback === "delete single")
      {
        node = AlterTreeStructureForDeleteSingle(inputTree, nodeId, oldParentId);
        AlterTreeStructureForDeleteSingle(originalTree, nodeId, oldParentId);
      }
      else if(callback === "delete cascade")
      {
        node = AlterTreeStructureForDeleteCascade(inputTree, nodeId, oldParentId);
        AlterTreeStructureForDeleteCascade(originalTree, nodeId, oldParentId);
      }
    }

    maxLevels = new Object();
    childPositions = new Object();
    nodeDictionary = new Object();
    //RemoveLines(inputTree);
    treeContainer.render((RenderTree(inputTree)));
    CorrectTransforms(inputTree);
    ResetElementPositions(inputTree);
    AddLines(inputTree);
    RenderCreationButtons();

    //update the change tracker (for drag and drop of subtrees) to remove any changes already saved in the database
    if(callback === "update")
    {
      delete changeTracker[node.id];
      originalDictionary[node.id] = {...nodeDictionary[node.id]};
    }
    else if(callback === "create")
    {
      originalDictionary[node.id] = {...nodeDictionary[node.id]};
    }
    else if(callback === "new root")
    {
      originalDictionary[node.id] = {...nodeDictionary[node.id]};
    }
    else if(callback === "delete single")
    {
      UpdateChangeTrackerForDeleteSingle(node);
    }
    else if(callback === "delete cascade")
    {
      UpdateChangeTrackerForDeleteCascade(node);
    }

    var treeUnsaved = false;

    if(changeTracker && Object.keys(changeTracker).length > 0)
    {
      treeUnsaved = true;
    }

    document.getElementById('save-tree-positions').disabled = !(treeUnsaved);
    document.getElementById('revert-tree-positions').disabled = !(treeUnsaved);
  }

  function CompareNodes(a, b)
    {
        if ( a.id < b.id ){                                                                   
            return -1;
          }
          if ( a.id > b.id ){
            return 1;
          }
          return 0;
    }

  function FindNodeInTree(id, tree)
  {
    if(tree.id === id) return tree; 
    var node = null;

    for(var i = 0; i < tree.children.length; i++)
    {     
        node = FindNodeInTree(id, tree.children[i]);
        if(node){ return node; };
    }
    return node;
  } 

  function UpdateChangeTrackerForDeleteCascade(node)
  {
    delete changeTracker[node.id];
    delete originalDictionary[node.id];

    node.children.forEach(child => {
      UpdateChangeTrackerForDeleteCascade(child);
    });
  }

  function  UpdateChangeTrackerForDeleteSingle(node)
  {
    delete changeTracker[node.id];
    delete originalDictionary[node.id];

    node.children.forEach(child => {
      delete changeTracker[child.id];
      originalDictionary[child.id] = {...nodeDictionary[child.id]};
    })
  }

  function ResetElementPositions(node)
  {
    if(node)
    {
      delete node['line'];
      delete node['position'];

      node.children?.forEach(child => {
        ResetElementPositions(child);
      })
    }
  }

  function AddNodeToChildren(parentNode, childNode)
  {
    parentNode.children.push(childNode);
    parentNode.children.sort(CompareNodes);
  }

  function RemoveChildFromNode(oldParentNode, childId)
  {
      const removeOldChildIndex = oldParentNode.children.findIndex((object) => object.id === childId);
      if(removeOldChildIndex > -1)  oldParentNode.children.splice(removeOldChildIndex, 1);
      oldParentNode.children.sort(CompareNodes);
  }

  function AlterTreeStructureForDeleteCascade(tree, nodeId, parentNodeId, node = null, parentNode = null)
  {
    if(!parentNode) parentNode = FindNodeInTree(parentNodeId, tree);
    if(!node) node = FindNodeInTree(nodeId, tree);
    
    RemoveChildFromNode(parentNode, nodeId);
    node.nodeId = null;

    return node;
  }

  function AlterTreeStructureForDeleteSingle(tree, nodeId, parentNodeId, node = null, parentNode = null)
  {
    if(!parentNode) parentNode = FindNodeInTree(parentNodeId, tree);
    if(!node) node = FindNodeInTree(nodeId, tree);
    
    RemoveChildFromNode(parentNode, nodeId);
    node.nodeId = null;
    
    node.children.forEach(child => {
      child.nodeId = parentNodeId;
      AddNodeToChildren(parentNode, child);
    });   
    return node; 
  }

  /*
  function AlterTreeStructureForNodeChangedToRoot(tree, nodeId, oldParentNodeId, node = null, oldParentNode = null)
  {
    if(!node) node = FindNodeInTree(nodeId, tree);
    if(!oldParentNode) oldParentNode = FindNodeInTree(oldParentNodeId, tree);

    RemoveChildFromNode(oldParentNode, node.id);
    const oldRootNode = tree;
    AddNodeToChildren(node, oldRootNode);
    oldRootNode.nodeId = node.id;
  }
  */

  function AlterTreeAtructureForCreateRoot(tree, newNode)
  {
    if(tree != null && ('id' in tree))
    {
      const oldRootNode = tree;
      AddNodeToChildren(newNode, oldRootNode);
      oldRootNode.nodeId = newNode.id;
    }

    return newNode;
  }

  function AlterTreeStructureForCreateNode(tree, newNode, parentNode = null)
  {
    if(!parentNode) parentNode = FindNodeInTree(newNode.nodeId, tree);
    AddNodeToChildren(parentNode, newNode);

    return newNode;
  }

  function AlterTreeStructureForParentNodeChange(tree, nodeId, newParentNodeId, oldParentNodeId, node = null, oldParentNode = null, newParentNode = null)
  {
      if(!node) node = FindNodeInTree(nodeId, tree);

      if(!oldParentNodeId || !newParentNodeId){ return node;}
      if(!oldParentNode) oldParentNode = FindNodeInTree(oldParentNodeId, tree);
      if(!newParentNode) newParentNode = FindNodeInTree(newParentNodeId, tree);
      
      node.nodeId = newParentNodeId;
      RemoveChildFromNode(oldParentNode, node.id);
      AddNodeToChildren(newParentNode, node);
      
      return node;
  }

  function OnDropNode(mouse, node)
  {
    dragging = false;
    SetZIndices(node, 4, 0, 'auto');
    
    if(mouseOverNode && mouseOverNode !== node.id)
    {
      const oldParentNode = nodeDictionary[node.nodeId];
      const newParentNode = nodeDictionary[mouseOverNode];    
      AlterTreeStructureForParentNodeChange(tree, node.id, mouseOverNode, node.nodeId, node, oldParentNode, newParentNode);
      
      const originalNode = originalDictionary[node.id];
      if(originalNode.nodeId !== mouseOverNode)
      {
        changeTracker[node.id] = mouseOverNode;
      }
      else
      {
        delete changeTracker[node.id];
      }

      mouseOverNode = null;
      ReRenderTree();
    }
    else
    {
      ResetSubtree(node);
      AddLine(node);
    }
  }

  function SetZIndices(node, nodeIndex, lineIndex, pointerEvents)
  { 
    const nodeElement = document.getElementById(node.id);
    nodeElement.style.zIndex = nodeIndex;
    nodeElement.style.pointerEvents = pointerEvents;

    const line = document.getElementsByClassName(node.nodeId+"_"+node.id);
      if(line && line.length > 0) line[0].style.zIndex = lineIndex;

    node.children.forEach(child => {
      SetZIndices(child, nodeIndex, lineIndex)
    })
  }

  function StartDrag(node)
  {
    dragging = true;

    SetZIndices(node, 12, 8, 'none');
    RemoveLine(node);
  }

  function RemoveLine(node)
  {
    if(node.nodeId)
    {
      const line = document.getElementsByClassName(node.nodeId+"_"+node.id);
      if(line && line.length > 0) line[0].remove();
    }
  }

  function AppendChildNode(tree, child, left, row, nodeSize, verticalOffset)
  {
    
    return (
      <>
        <Draggable 
            position={{x: 0, y: 0}} 
            onStart = {() => { if(child["dialog"])return false; scrollXBefore = window.scrollX; scrollYBefore = window.scrollY;}} 
            onStop = {(drag) => {if(dragging){OnDropNode(drag, child);} }} 
            onDrag = {(drag) =>{if(!dragging){StartDrag(child);} RepositionSubTree(drag, child);}}
        >
          <div 
            id = {child.id} 
            className={child.id+" treenode-container"} 
            onMouseOver={() => {mouseOverNode = child.id;}}
            onMouseOut={() => {mouseOverNode = null;}} 
            style = {{display: 'flex', justifyContent: 'center', alignItems: 'center',backgroundColor: '#F0F0F0', borderRadius: String(nodeSize*0.2)+'px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', zIndex: 4, position:'absolute',top: String((row*nodeSize*1.5)+verticalOffset)+'px' , left: String(left)+'px', display: 'table', border: '2px solid red',  height: String(nodeSize)+'px', width: String(nodeSize)+'px'}}
          >
            <Provider store ={store}>
              <TreeNode 
                setChangeTracker = {UpdateChangeTrackerCallback}
                rootNode = {tree} 
                render = {ReRenderTree} 
                inputNode = {child} 
                css = {{nodeSize: nodeSize}} 
                nodeList = {nodeList} 
                nodeDictionary = {nodeDictionary}
              />
            </Provider> 
          </div>
        </Draggable>
      </>
    );
  }

  //units used are pixels
  function GetNodeDimensions()
  {
    const maximumNodeSize = window.innerHeight*0.5
    const verticalSpace = 0.92*window.innerHeight-0.04*window.innerWidth;
    const horizontalSpace = window.innerWidth -  (2*horizontalBorder);

    const maxHeight = verticalSpace/treeHeight;
    const maxWidth = horizontalSpace/treeWidth;

    const maxDimension = (maxHeight < maxWidth ? maxHeight : maxWidth);
    const minimumCheck = maxDimension < minimumNodeSize ? minimumNodeSize : maxDimension;
    const maximumCheck = minimumCheck > maximumNodeSize ? maximumNodeSize  : minimumCheck;

    return maximumCheck;
  }

  function RenderTree(tree, parent = null, row = 0, parentLeft = window.innerWidth/2, path = 'middle')
  {
    if(tree)
    {
      testRender = false;
      maxLevels = new Object();
      childPositions = new Object();
      nodeDictionary = new Object();
      SetTreeDimensions(tree);
   
      maxLevels = new Object();
      childPositions = new Object();
      nodeDictionary = new Object();
     
      testRender = true;
      PrepRenderChildren(tree, parent, row, parentLeft, path);
      testRender = false;

      const newTreeWidth = treeWidth*nodeDimension;
      const horizontalSpace = window.innerWidth -  (2*horizontalBorder);
      var offSet = 0;

      if(newTreeWidth > horizontalSpace)
      {
        offSet = horizontalBorder-treeWidthMin;
      }
      else
      {
        const bufferSpace = horizontalSpace-newTreeWidth;
        const leftMost = bufferSpace/2+horizontalBorder;
        offSet = leftMost-treeWidthMin;
      }

      return RenderChildren(tree, tree, 0, offSet);
    }
    else if(treeDetails)
    {
      return EmptyTreeJSX();
    }

    return <></>;
  }

  function SetTreeDimensions(tree)
  {
    nodeDimension = 1;
    treeWidthMax = null;
    treeWidthMin = null;
    treeHeight = 0;
    treeWidth = 0;

    PrepRenderChildren(tree);
    treeWidth = treeWidthMax-treeWidthMin+1;
    treeHeight = treeHeight > 1 ? ((treeHeight-1)*1.5)+1 : treeHeight;
    nodeDimension = GetNodeDimensions(); 
  }

  function SetTreeWidths(value)
  {
    if(treeWidthMax == null)
    {
      treeWidthMax = value;
      treeWidthMin = value;
    }
    else
    {
      treeWidthMax = value > treeWidthMax ? value : treeWidthMax;
      treeWidthMin = value < treeWidthMin ? value : treeWidthMin;
    }
  }

  function RenderChildren(tree, node, row = 1, offset = 0)
  {  
      const verticalOffset = 0.11*window.innerHeight+0.04*window.innerWidth;
      const elements = [];
      elements.push((AppendChildNode(tree, node, node["left"]+offset, row, nodeDimension, verticalOffset)));
      
      node["left"] = node['left'] + offset;
      node["top"] = node["top"] + verticalOffset;
      node.children.forEach(child => {
        elements.push((
          <>
            {RenderChildren(tree, child, row+1, offset)}
          </>
        ));
      });

      return(
        <>       
            {elements.map(child => {
                
                return (
                <>
                  {child}
                </> );
                }
            )}        
        </>
      );
  }

  function PrepRenderChildren(tree, parent = null, row = 0, parentLeft = window.innerWidth/2, path = 'middle')
  {
    
    var children = null;
    if(parent != null)
    { 
      children = parent.children;
      
      if(testRender)
      {
        nodeDictionary[parent.id] = parent;
        if(!(String(parent.id) in originalDictionary)) originalDictionary[parent.id] = {...parent};     
        nodeList.push(parent);
      }
    }
    else if(tree != null && tree.children != null)
    {
      children = [tree];
    }
    else{return (<></>);}

    if(children == null){return (<></>);}

    treeHeight = (row) > treeHeight ? (row) : treeHeight;
    
    var nodeSize = nodeDimension;
    var elementWidth = nodeSize*1.5;

    const childElements = [];

    var i = 0;
    var leftCount = elementWidth;
    var childCountOdd = 0;
    var childCountEven = 0;

    if( !(String(row-1) in maxLevels) ) maxLevels[String(row-1)] = {};
    var maxLevel = maxLevels[String(row-1)];

    var parentNodePosition = new Object();
    
    while(i < children.length)
    {
      var child = children[i];

      var maxRight =  'Right' in maxLevel ? maxLevel['Right'] : null;
      var maxLeft = 'Left' in maxLevel ? maxLevel['Left'] : null; 
      var left = 0;

      if(path === 'middle')
      {
        var middleIndex = Math.floor(children.length/2);
        if(children.length%2 == 0){ middleIndex--;}

        var j = 0;
        if(i <= middleIndex)
        {
          j = middleIndex-i;
        }
        else
        {
          j  = i;
        }

        child = children[j];

        var leftSpace = 0;
    
        if((i > 0 && children.length%2==1) && i <= middleIndex){ leftSpace = i > 1 ? -1*leftCount*i : -1*leftCount; }
        if((i > 0 && children.length%2==1) && i > middleIndex){ leftSpace = (i - middleIndex) > 1 ? leftCount*(i - middleIndex) : leftCount; }
        if(children.length%2==0 && i <= middleIndex){ leftSpace = i > 1 ? -1*leftCount*(i-0.75) : -1*leftCount*0.25; }
        if(children.length%2==0 && i > middleIndex){ leftSpace = (i - middleIndex) > 1 ? leftCount*(i - middleIndex - 0.75) : leftCount*0.25; }

        left = leftSpace+parentLeft;
        var pathSplitter = 'middle'; 

        if(i == 0){ pathSplitter = 'middle';}
        else if(i<= middleIndex){ pathSplitter = 'left';}
        else if(i> middleIndex){ pathSplitter = 'right';}

        if(pathSplitter === 'left' && maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
        if(pathSplitter === 'right' && maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        PrepRenderChildren(tree, child, row + 1, left, pathSplitter, false);

        var childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();
        var positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
        if(positionAboveChildren != null && 
         ( (pathSplitter === "middle" ) ||
          (pathSplitter === "left" && ( maxLeft == null || positionAboveChildren <= maxLeft-elementWidth ) ) ||
          (pathSplitter === "right" && ( maxRight == null || positionAboveChildren >= maxRight+elementWidth ) )))
        {
           left = positionAboveChildren; 
        }

        if(maxLeft == null || left < maxLeft) maxLevel["Left"] = left;
        if(maxRight == null || left > maxRight) maxLevel["Right"] = left;

        if(parent){
          if(i == middleIndex && children.length > 1 ){ parentNodePosition["Left"] = left; }
          if(i == children.length-1 && children.length > 1 ){ parentNodePosition["Right"] = left; }
          if(children.length == 1){ parentNodePosition["Left"] = left; parentNodePosition["Right"] = left; }
          if(i >= children.length-1)
          {
            childPositions[String(parent.id)] = parentNodePosition;
          }
        }
      }
      else if(path === 'right')
      {
        var leftSpace = 0;
        leftSpace = leftCount*(-1*(children.length-1)/2+i);
        left = leftSpace+parentLeft; 

        var pathSplitter = 'right'; 
        
        if(maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        PrepRenderChildren(tree, child, row + 1, left, pathSplitter, false);
        var childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();

        var positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
        if(positionAboveChildren != null && (maxRight == null ||  positionAboveChildren >= maxRight+elementWidth)){
           left = positionAboveChildren; 
        }

        maxLevel["Right"] = left;

        if(maxLeft == null || left < maxLeft) maxLevel["Left"] = left;

        if(children.length == 1 && parent){parentNodePosition["Left"] = left; parentNodePosition["Right"] = left;}
        if(children.length > 1 && i==0 && parent){ parentNodePosition["Left"] = left; }
        if(children.length > 1 && i >= children.length-1 && parent)
        { 
          parentNodePosition["Right"] = left;
        }
        if(i >= children.length-1 && parent)  childPositions[String(parent.id)] = parentNodePosition;
      }
      else if(path === 'left')
        {
          var leftSpace = 0;
          leftSpace = leftCount*((children.length-1)/2-i);
          left = leftSpace+parentLeft;
  
          var pathSplitter = 'left'; 
          
          if(maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
  
          PrepRenderChildren(tree, child, row + 1, left, pathSplitter, false);    
            
          var childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();
  
          var positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
          if(positionAboveChildren != null && (maxLeft == null || positionAboveChildren <= maxLeft-elementWidth)){
             left = positionAboveChildren; 
          }
  
          maxLevel["Left"] = left;
  
          if(maxLeft == null || left > maxRight) maxLevel["Right"] = left;
  
          if(children.length == 1 && parent){parentNodePosition["Right"] = left; parentNodePosition["Left"] = left; }
          if(children.length > 1 && i== 0 && parent){ parentNodePosition["Right"] = left; }
          if(children.length > 1 && i >= children.length-1 && parent)
          { 
            parentNodePosition["Left"] = left;
          }
          if(i >= children.length-1 && parent) childPositions[String(parent.id)] = parentNodePosition;
        }

        if(testRender)
        {
          child["left"] = left; 
          child["top"] = (row)*elementWidth;
          child['dialog'] = false;
        }
              
        SetTreeWidths(left);
        
        
      i++;
    
    }
  }

  async function SaveTreePositions()
  {
    const updateNodesList = [];
    Object.keys(changeTracker).forEach(key => {
      const parentId = changeTracker[key];
      const updateNode = {...nodeDictionary[key]};
      updateNode.nodeId = parentId;
      updateNode['children'] = [];

      delete updateNode['position'];
      delete updateNode['line'];
      delete updateNode['left'];
      delete updateNode['top'];
      delete updateNode['dialog'];
      delete updateNode['path'];
      
      updateNodesList.push(updateNode);
    });

    var result = [];
    if(updateNodesList.length > 0)
    {
      var result = await updateManyNodes(updateNodesList[0].id, updateNodesList);
      if(!result) return;
      
      changeTracker = new Object();
      originalDictionary = structuredClone(nodeDictionary);
      originalTree = structuredClone(tree);
      document.getElementById('save-tree-positions').disabled = true;
      document.getElementById('revert-tree-positions').disabled = true;
    }
  }

  function GetElementPosition(element)
  {
    var position = element.getBoundingClientRect();
    var x = position.left;
    var y = position.top;

    return {X:x, Y:y};
  }

  function DepthFirstMethod(method, node, data = null, sendChild = true, returnerMethod = null)
  {
    if(node == null || !('children' in node)){return (<></>)}

    node.children.forEach(child => 
      {
        DepthFirstMethod(method, child, data, sendChild, returnerMethod);
        if(data && sendChild){ method(data, node, child); }
        else if(data && !sendChild){ method(data, node); }
        else if(!data && sendChild){ method(node, child); }
        else{ method(node);}
      });

    //return returnerMethod;
  }

  function ResetSubtree(node)
  {

    const nodeElement = document.getElementById(node.id);
    nodeElement.style.left = String(node['left'])+"px";
    nodeElement.style.top = String(node['top'])+"px";

    const lineElements = node.nodeId ? document.getElementsByClassName(node.nodeId+"_"+node.id) : [];
    if(lineElements && lineElements.length > 0)
    {
      const line = lineElements[0];
      const lineStyle = node['line'];
      line.style.top = String(lineStyle.top)+"px";
      line.style.left = String(lineStyle.left)+"px";
    }
    
    node.children.forEach(child => {
      ResetSubtree(child);
    })
  }

  function RepositionDescendants(data, parent, child)
  {
    const X = data.X;
    const Y = data.Y;

    const childElement = document.getElementById(child.id);
    const line = document.getElementsByClassName(parent.id+"_"+child.id).length > 0 ? document.getElementsByClassName(parent.id+"_"+child.id)[0] : null;
  
    childElement.style.top = String((child["top"]+Y))+"px";
    childElement.style.left = String((child["left"]+X))+"px";
    childElement.style.transform = 'none';

    if(line)
    {
      if(!('line' in child))
      {
        child['line'] = {left: Number(line.style.left.substring(0, line.style.left.length-2)), top: Number(line.style.top.substring(0, line.style.top.length-2))}
      }

      const top = child['line'].top;
      const left = child['line'].left

      line.style.top = String(top+Y)+"px";
      line.style.left = String(left+X)+"px";
    }
  }

  function RepositionSubTree(dragEvent, node, scroll = null)
  {

    scrollDistanceX = window.scrollX-scrollXBefore;
    scrollDistanceY = window.scrollY-scrollYBefore;

    const nodeElement = document.getElementById(node.id);
    const positionAfter = GetElementPosition(nodeElement);
    const X = positionAfter.X;
    const Y = positionAfter.Y;

    if(!('position' in node))
    {
      node['position'] = positionAfter;
    }  

    const positionBefore = node['position'];
    const xOffset = X-positionBefore.X+scrollDistanceX;
    const yOffset = Y-positionBefore.Y+scrollDistanceY;

    DepthFirstMethod(RepositionDescendants, node, {X: xOffset, Y: yOffset});
    
    //scrollXBefore = window.scrollX;
    //scrollYBefore = window.scrollY;
  }

  function RemoveLines(node)
  {
    //DepthFirstMethod(RemoveLine, tree, null, false);
    RemoveLine(node);
    node.children?.forEach(child => {
      RemoveLines(child);
    })

  } 

  function AddLine(node)
  {
    if(node.nodeId) createRoot(document.getElementById('line-container-insert')).render
    (
      <LineTo within={'line-container'}  style ={{zIndex: 0}} delay id = {node.nodeId+"_"+node.id} from={node.nodeId} to={node.id} className = {node.nodeId+"_"+node.id+" tree-line"} />
    );
  }
  
  function AddLines(node)
  {
    
    if(node == null || !('children' in node)){return (<></>)}
    const lines = [];
    
      node.children.forEach(child => 
      {           
          lines.push(
            <>
              <LineTo within = {'line-container'} style = {{zIndex: 0}} delay id={node.id+"_"+child.id} from={node.id} to={child.id} className={node.id+"_"+child.id+" tree-line"} /> 
              {AddLines(child)}
            </>
          )        
      }
    );

    const lineJSX = 
      (<>
        {lines.map(child => {
            
            return (
            <>
              {child}
            </> );
            }
        )}
      </>
    );

    const lineContainer = createRoot(document.getElementById('line-container-insert'));
    lineContainer.render(lineJSX);
  }

  function RenderCreationButtons()
  {
    const createContainer = createRoot(document.getElementById('create-container'));
    createContainer.render(CreationButtons());
  }

  const CreationButtons = () => 
  {
    return (
      <>
        <Provider store ={store}>
          <CreateRoot treeId = {id} iconSize = {iconDimension} render = {ReRenderTree} rootNode = {tree} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
        </Provider>
        <Provider store ={store}>
          <CreateNode  treeId = {id} iconSize = {iconDimension} render = {ReRenderTree} rootNode = {tree} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
        </Provider>
      </> 
    );
  }

  function SetPositions(node)
  {
    if(node != null && 'id' in node){  
      const nodeElement = document.getElementById(node.id);
      node['position'] = GetElementPosition(nodeElement);
      nodeElement.children.forEach(child => 
        {
          SetPositions(child);
        });
      }
  };

  function CorrectTransforms(node)
  {
    if(node != null && ('children' in node))
    {
      const nodeElement = document.getElementById(node.id);
      if(nodeElement){ nodeElement.style.transform = 'none'; }
      

      node.children?.forEach(child => {
        CorrectTransforms(child);
      })
    }
  }

  const EmptyTreeJSX = () => 
  {
    const windowWidth = window.innerWidth;
    const maximumNodeSize = window.innerHeight*0.5;

    return (
      <>
            <div style = {{position: 'absolute', left: String(windowWidth/2-(maximumNodeSize/2))+'px', top: String(maximumNodeSize/4+window.innerWidth*0.04)+'px', height: String(maximumNodeSize)+'px', width: String(maximumNodeSize)+'px'}}>
              <button onClick={(event) => {document.getElementById('create-root-button').click();}} className='button-root-empty' style = {{padding: '0 0 0 0', backgroundColor: 'lightGrey', color: '#d68a16'}}>
                  <i className='pi pi-warehouse' style = {{fontSize: String(maximumNodeSize)+'px'}} onClick = {() => { setCreateNode(true);}} />
              </button> 
            </div >
              <span style = {{fontSize: '5vh', color: '#d68a16', position: 'absolute', left: String(windowWidth/2-(maximumNodeSize/2))+'px', top: String((5*maximumNodeSize/4)+20+window.innerWidth*0.04)+'px', width: String(maximumNodeSize)+'px'}}>
                This tree is empty, click the icon above to create the root node!
              </span>
          </>
    );
  }

  function RevertTreePositions()
  {
    RemoveLines(tree);
    tree = structuredClone(originalTree);
    ReRenderTree();
    changeTracker = new Object();
    document.getElementById('save-tree-positions').disabled = true;
    document.getElementById('revert-tree-positions').disabled = true;
  }

  return (
    <>
      { (treeFetch && treeDetails) && (
        <>
        <div id = 'button-container' style ={{position: 'fixed', backgroundColor: 'silver', zIndex: 100}}>
          <HeaderInfo 
            middleText={"Drag and drop nodes upon eachother in order to change the tree structure. Save or undo these changes using the 2 buttons located directly beneath this text."}
          />
          <div id = 'button-container-inner' style = {{position: 'relative', display:'flex', top: '0px', width: '100vw', height: '8vh', justifyContent: 'center', alignItems: 'center'}}>
            <div style = {{marginRight: 'auto', height: '100%', display:'flex', width: String((iconDimension*2)+(0.01*window.innerHeight))+"px",}}>
                {/*<Link to ="/">*/}
                  <button 
                    onClick={(event) => { navigate("/");}}
                    className='button-header button-save tooltip' 
                    style = {{height: '100%', width: '8vh', padding: '0 0 0 0'}}
                  >
                    <i className='pi pi-home save-icon' style = {{fontSize: '8vh'}} />
                    <span class="tooltip-right">Home</span>
                  </button>
                {/*</Link>*/}
              <EditTree id = {id} tree = {treeDetails}/>
            </div>          
            <div style = {{height: '100%', width: '41vh', display: 'flex',  marginRight: 'auto'}}>
              <button onClick={() => { RevertTreePositions();}} id = 'revert-tree-positions' className='button-header button-save tooltip' style = {{height: '100%', width: '8vh', padding: '0 0 0 0'}}>
              { //style = {{float: 'left', fontSize: iconSize, color: 'lightGrey'}}
                }
                <i className='pi pi-replay save-icon' style = {{fontSize: '8vh'}} />
                <span class="tooltip-bottom">Revert Tree Positions</span>
              </button>
              <button onClick={() => { SaveTreePositions();}} id = 'save-tree-positions' className='button-header button-save tooltip' style = {{height: '100%', width: '100%', padding: '0 0 0 0'}}>
              { //style = {{float: 'left', fontSize: iconSize, color: 'lightGrey'}}
                }
                <i className='pi pi-save save-icon' style = {{fontSize: '8vh'}} />
                <div style = {{fontSize: '3vh',height: '100%', width: '100%', padding: '0 0 0 0'}}>
                  Save Position Changes
                </div>
                <span class="tooltip-bottom">Save Tree Positions</span>
              </button>
            </div>
            <div id = 'create-container' style = {{height: '100%', display:'flex', width: String((iconDimension*2)+(0.01*window.innerHeight))+"px",  marginRight: '2vw'}}>
                {CreationButtons()}
            </div>
          </div>
        </div>
        <div id = 'line-container' className='line-container'>
          <div id = 'line-container-insert' className='line-container-insert'>
          </div>
        </div>
        <div id = 'tree-root'>
        
              {RenderTree(tree)}            
      
        </div>
        <div id = 'dialog-container'>
        </div>
      </>
      )
      }
    </>
  );
}

export default Tree
