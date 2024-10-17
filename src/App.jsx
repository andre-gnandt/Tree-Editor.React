import { useState, useEffect, useRef } from 'react'
//import { render} from 'react-dom';
import NodeDetails   from './features/nodes/NodeDetails'
//import  GetTrees   from './api/nodes/nodesApi';
import TreeNode from './features/nodes/TreeNode';
import LineTo from 'react-lineto';
import './App.css'
import Draggable from 'react-draggable';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom'

function App() {
  const firstRender = useRef(true);
  const [tree, setTree] = useState(null);
  var maxLevels = new Object();
  var childPositions = new Object();
  var nodeDictionary = new Object();
  var dragging = false;
  var mouseOverNode = null;

  console.log("Render Tree: ");
  console.log(tree);

  function SetParentNodes(node)
  {
    node.children.forEach(child => {
      child.parent = node;
      SetParentNodes(child);
    });
  }

  function GetTrees(){
    fetch("http://localhost:11727/api/Nodes/Trees").then(res => res.json()).then(
        result => { 
          var nodes = result[1];
          //SetParentNodes(nodes);
          setTree(nodes);
        }
    );   
  };

  if(firstRender.current){
    GetTrees();
    firstRender.current = false;
  }

  function OnDropNode(mouse, node)
  {
    dragging = false;
    
    if(mouseOverNode)
    {
      console.log(nodeDictionary);

      const oldParentNode = nodeDictionary[node.nodeId];
      const newParentNode = nodeDictionary[mouseOverNode];

      console.log('old parent node');
      console.log(oldParentNode);
      console.log('new parent node');
      console.log(newParentNode);
      
      
      node.nodeId = mouseOverNode;
      const removeOldChildIndex = oldParentNode.children.findIndex((object) => object.id === node.id);
      console.log('remove index:'+removeOldChildIndex);
      if(removeOldChildIndex > -1)  oldParentNode.children.splice(removeOldChildIndex, 1);
      newParentNode.children.push(node);
      

      mouseOverNode = null;

      const newTree = {...tree}
      
      maxLevels = new Object();
      childPositions = new Object();
      nodeDictionary = new Object();
      dragging = false;
      mouseOverNode = null;
      
      console.log("new tree:");
      console.log(tree);

      setTree(newTree);
      //const treeRoot = createRoot(document.getElementById('tree-root'));
      //treeRoot.render(RenderChildren());
    }
    else
    {

    }

  }

  function AppendChildNode(child, left, row)
  {
    return (
      <>
        <Draggable onStop = {(drag) => {OnDropNode(drag, child); }} onDrag = {(drag) =>{ dragging = true; RepositionSubTree(drag, child); if(child.nodeId && document.getElementsByClassName(child.nodeId+"_"+child.id).length > 0){ document.getElementsByClassName(child.nodeId+"_"+child.id)[0].remove(); }}}>
          <div id = {child.id} className={child.id} onMouseLeave={() => {mouseOverNode = null;}} onMouseEnter={() => {mouseOverNode = child.id}} style = {{position:'absolute',top: String((row)*160)+'px' , left: String(left)+'px', display: 'table', border: '1px solid red', height: '80px', width: '80px'}}>
            <TreeNode props = {child} css = {{ left: String(left)+'px'}} />
          </div>
        </Draggable>
      </>
    );
  }

  //Add proper position check, depending on whether it is a left, right, or middle sided node to render the parent position for a middle pathway.
  function RenderChildren(parent = null, row = 0, parentLeft = window.innerWidth/2, path = 'middle')
  {
    var children = null;
    if(parent != null)
    { 
      children = parent.children;
      nodeDictionary[parent.id] = parent;
    }
    else if(tree != null && tree.children != null)
    {
      children = [tree];
    }
    else{return (<></>);}

    if(children == null){return (<></>);}

    var elementWidth = 160;
    //var 
    let widthCount = (children.length-1)*elementWidth;
    const childElements = [];
    const childTrees = [];
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

      if(row === 2)
      {
        console.log('-------------');
        console.log("Node title: "+child.title);
        console.log("Maxleft: "+maxLeft);
        console.log("Maxright: "+maxRight);
        console.log('-------------');
      }

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

        childElements.push((AppendChildNode(child, left, row)));
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

        childElements.push((AppendChildNode(child, left, row)));
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

          childElements.push((AppendChildNode(child, left, row)));
        }

        child["left"] = left;
        child["top"] = (row)*160;

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

  function DepthFirstMethod(method, node, data)
  {
    if(node == null || !('children' in node)){return (<></>)}

    node.children.forEach(child => 
      {
        DepthFirstMethod(method, child, data);
        method(data, node, child);
      });
  }

  function RepositionDescendants(data, parent, child)
  {
    /*
    if(document.getElementsByClassName(parent.id+"_"+child.id).length > 0)
    {
      document.getElementsByClassName(parent.id+"_"+child.id)[0].remove();
    }
      */

    const X = data.X;
    const Y = data.Y;

    const childElement = document.getElementById(child.id);
    const line = document.getElementsByClassName(parent.id+"_"+child.id).length > 0 ? document.getElementsByClassName(parent.id+"_"+child.id)[0] : null;
  
    childElement.style.top = String((child["top"]+Y))+"px";
    childElement.style.left = String((child["left"]+X))+"px";

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
  
    //ReactDOM.createPortal(<LineTo delay id={parent.id+"_"+child.id} from={parent.id} to={child.id} className={parent.id+"_"+child.id} />, document.body);
    //root.render(createPortal(<LineTo delay id={parent.id+"_"+child.id} from={parent.id} to={child.id} className={parent.id+"_"+child.id} />) );
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
    /*
    node.children.forEach(child => {
      const childElement = document.getElementById(child.id);
      
      const position = node['position'];
      const xOffset = X-position.X;
      const yOffset = Y-position.Y;

      childElement.style.top = String((child["top"]+yOffset))+"px";
      childElement.style.left = String((child["left"]+xOffset))+"px";
    });
    */
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

    return(
      <>
        {lines.map(child => {
            
            return (
            <>
              {child}
            </> );
            }
        )}
      </>
    )
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

  //{AddLines(tree)}
  return (
    <>
      <div id = 'line-container'>
      </div>
      <div onMouseEnter = {() => {mouseOverNode = null;}} id = 'tree-root'>
        {RenderChildren()}  
      </div>
    </>
  );
}

export default App
