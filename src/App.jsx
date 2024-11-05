import { useState, useEffect, useRef } from 'react'
import TreeNode from './features/nodes/TreeNode';
import LineTo from 'react-lineto';
import './App.css'
import Draggable from 'react-draggable';
import { useSelector, useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import { store } from '/LocalTreeData.React/src/store';
import { Dialog } from 'primereact/dialog';
import { createRoot } from 'react-dom/client';
import NodeDetails from './features/nodes/NodeDetails';
import CreateNode from './features/nodes/CreateNode';
import 'primeicons/primeicons.css';

function App() {
  const firstRender = useRef(true);
  const [tree, setTree] = useState(null);
  const [createNode, setCreateNode] = useState(null);
  var maxLevels = new Object();
  var childPositions = new Object();
  var nodeDictionary = new Object();
  var nodeList = [];
  var dragging = false;
  var mouseOverNode = null;
  const nodeDimension = 80;
  const iconSize = nodeDimension*0.7;

  const newNode = 
  {
    id: "00000000-0000-0000-0000-000000000000",
    data: null,
    title: null,
    level: 0,
    description: null,
    number: null,
    nodeId: tree ? tree.id : null,
    rankId: null,
    children: [],
    isDeleted: false,
  };

  useEffect(() => {
    AddLines(tree);
  });
  
  function ReRenderTree()
  {
    const treeContainer = createRoot(document.getElementById('tree-root'));
    maxLevels = new Object();
    childPositions = new Object();
    nodeDictionary = new Object();
    RemoveLines(tree);
    treeContainer.render((RenderChildren()));
    CorrectTransforms(tree);
    ResetElementPositions(tree);
    AddLines(tree);
  }

  function GetTrees(){
    fetch("http://localhost:11727/api/Nodes/Trees").then(res => res.json()).then(
        result => { 
          var nodes = result[2];
          setTree(nodes);
        }
    );   
  };

  if(firstRender.current){
    GetTrees();
    firstRender.current = false;
  }

  function ResetElementPositions(node)
  {
    if(node){

      delete node['line'];
      delete node['position'];

      node.children.forEach(child => {
        ResetElementPositions(child);
      })
    }
  }

  function OnDropNode(mouse, node)
  {
    dragging = false;
    const nodeElement = document.getElementById(node.id);
    nodeElement.style.zIndex = 0;
    nodeElement.style.pointerEvents = 'auto';
    
    if(mouseOverNode && mouseOverNode !== node.id)
    {
      const oldParentNode = nodeDictionary[node.nodeId];
      const newParentNode = nodeDictionary[mouseOverNode];
      node.nodeId = mouseOverNode;

      mouseOverNode = null;

      const removeOldChildIndex = oldParentNode.children.findIndex((object) => object.id === node.id);
      if(removeOldChildIndex > -1)  oldParentNode.children.splice(removeOldChildIndex, 1);
      newParentNode.children.push(node);
      
      ReRenderTree();
    }
    else
    {
      ResetSubtree(node);
      AddLine(node);
    }
  }

  function StartDrag(node)
  {
    dragging = true;
    const nodeElement = document.getElementById(node.id);
    nodeElement.style.zIndex = 1;
    nodeElement.style.pointerEvents = 'none';
    
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

  function AppendChildNode(child, left, row, nodeSize)
  {
    return (
      <>
        <Draggable position={{x: 0, y: 0}} onStart = {() => { if(child["dialog"])return false; }} onStop = {(drag) => {if(dragging){OnDropNode(drag, child);} }} 
          onDrag = {(drag) =>{if(!dragging){StartDrag(child);} RepositionSubTree(drag, child);}}>
          
          <div id = {child.id} className={child.id} onMouseLeave={() => {mouseOverNode = null;}} onMouseEnter={() => {mouseOverNode = child.id;}} 
            style = {{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', zIndex: 0, position:'absolute',top: String((row)*nodeSize*2)+'px' , left: String(left)+'px', display: 'table', border: '1px solid red', maxHeight: String(nodeSize)+'px', maxWidth: String(nodeSize)+'px', height: String(nodeSize)+'px', width: String(nodeSize)+'px'}}>
            
            <TreeNode render = {ReRenderTree} props = {child} css = {{nodeSize: nodeSize}} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
          </div>
        </Draggable>
      </>
    );
  }

  function RenderChildren(parent = null, row = 0, parentLeft = window.innerWidth/2, path = 'middle')
  {
    var children = null;
    if(parent != null)
    { 
      children = parent.children;
      nodeDictionary[parent.id] = parent;
      nodeList.push(parent);
    }
    else if(tree != null && tree.children != null)
    {
      children = [tree];
    }
    else{return (<></>);}

    if(children == null){return (<></>);}

    var nodeSize = nodeDimension;
    var elementWidth = nodeSize*2;

    const childElements = [];

    var i = 0;
    var leftCount = elementWidth;
    var childCountOdd = 0;
    var childCountEven = 0;

    if( !(String(row-1) in maxLevels) ) maxLevels[String(row-1)] = {};
    var maxLevel = maxLevels[String(row-1)];

    var parentNodePosition = new Object();

    
    
    children.forEach(child => {

      var maxRight =  'Right' in maxLevel ? maxLevel['Right'] : null;
      var maxLeft = 'Left' in maxLevel ? maxLevel['Left'] : null; 
      var left = 0;

      if(path === 'middle')
      {
        var leftSpace = 0;
    
        if((i > 0 || children.length%2==0) && i%2 == 0){ leftSpace = childCountEven > 1 ? -1*leftCount*childCountEven : -1*leftCount; childCountEven++; }
        if((i > 0 || children.length%2==0) && i%2 == 1){ leftSpace = childCountOdd > 1 ? leftCount*childCountOdd : leftCount; childCountOdd++; }

        left = leftSpace+parentLeft;

        var pathSplitter = 'middle'; 

        if(i == 0){ pathSplitter = 'middle';}
        else if(i%2 == 0){ pathSplitter = 'left';}
        else if(i%2 == 1){ pathSplitter = 'right';}

        if(pathSplitter === 'left' && maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
        if(pathSplitter === 'right' && maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        childElements.push((
          <>    
              {RenderChildren(child, row + 1, left, pathSplitter, false)}       
          </>));

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
          if(i >= children.length-2 && children.length > 1  && i%2 == 0){ parentNodePosition["Left"] = left; }
          if(i >= children.length-2 && children.length > 1 && i%2 == 1){ parentNodePosition["Right"] = left; }
          if(children.length == 1){ parentNodePosition["Left"] = left; parentNodePosition["Right"] = left; }
          if(i >= children.length-1)
          {
            childPositions[String(parent.id)] = parentNodePosition;
          }
        }

        childElements.push((AppendChildNode(child, left, row, nodeSize)));
      }
      else if(path === 'right')
      {
        var leftSpace = 0;
        leftSpace = leftCount*(-1*(children.length-1)/2+i);
        left = leftSpace+parentLeft; 

        var pathSplitter = 'right'; 
        
        if(maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        childElements.push((
          <>    
              {RenderChildren(child, row + 1, left, pathSplitter, false)}       
          </>));
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

        childElements.push((AppendChildNode(child, left, row, nodeSize)));
      }
      else if(path === 'left')
        {
          var leftSpace = 0;
          leftSpace = leftCount*((children.length-1)/2-i);
          left = leftSpace+parentLeft;
  
          var pathSplitter = 'left'; 
          
          if(maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
  
          childElements.push((
            <>    
                {RenderChildren(child, row + 1, left, pathSplitter, false)}       
            </>));
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

          childElements.push((AppendChildNode(child, left, row, nodeSize)));
        }

        child["left"] = left;
        child["top"] = (row)*elementWidth;
        child["dialog"] = false;

      i++;
    });

    return(
      <>       
          {childElements.map(child => {
              
              return (
              <>
                {child}
              </> );
              }
          )}        
      </>
    );
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
    if(scroll != null){
      console.log("SCROLL DRAG! "+scroll);
    }
    const nodeElement = document.getElementById(node.id);
    const positionAfter = GetElementPosition(nodeElement);
    const X = positionAfter.X;
    const Y = positionAfter.Y;

    if(!('position' in node))
    {
      node['position'] = positionAfter;
    }  

    const positionBefore = node['position'];
    const xOffset = X-positionBefore.X;
    const yOffset = Y-positionBefore.Y;

    DepthFirstMethod(RepositionDescendants, node, {X: xOffset, Y: yOffset});
    
  }

  function RemoveLines(node)
  {
    //DepthFirstMethod(RemoveLine, tree, null, false);

    RemoveLine(node);
    node.children.forEach(child => {
      RemoveLines(child);
    })

  } 

  function AddLine(node)
  {
    if(node.nodeId) createRoot(document.getElementById('line-container')).render
    (
      <LineTo delay id = {node.nodeId+"_"+node.id} from={node.nodeId} to={node.id} className = {node.nodeId+"_"+node.id} />
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
              <LineTo delay id={node.id+"_"+child.id} from={node.id} to={child.id} className={node.id+"_"+child.id} /> 
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

    const lineContainer = createRoot(document.getElementById('line-container'));
    lineContainer.render(lineJSX);
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
      nodeElement.style.transform = 'none';

      node.children.forEach(child => {
        CorrectTransforms(child);
      })
    }
  }

  /*
  function RenderCreateDialog()
  {
    if(tree && tree.id && newNode)
    {
      return(
        <>
          <Dialog className={"dialogContent"} showHeader = {false} headerStyle={{background: 'white', height: '0px'}} contentStyle={{background: 'white'}} visible = {createNode} onHide={() => {if (!createNode) return; setCreateNode(false);}} > 
            <Provider store = {store}>
              <NodeDetails create = {true} render = {ReRenderTree} input = {newNode} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
            </Provider>
          </Dialog>
        </>
      );
    }

    return <></>;
  }
  */

  return (
    <>
      <div id = 'button-container' style = {{top: '0px', width: '100vw', height: String(iconSize)+"px"}}>
        <div style = {{height: '100%', width: String(iconSize)+"px", float: 'right', marginRight: '35px'}}>
          <CreateNode iconSize = {iconSize} render = {ReRenderTree} tree = {tree} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
        </div>
      </div>
      <div id = 'line-container'>
      </div>
      <div id = 'tree-root'>
        {RenderChildren()} 
      </div>
    </>
  );
}

export default App
