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
  const container = document.body;
  const root = createRoot(container);
  const firstRender = useRef(true);
  const [tree, setTree] = useState(null);
  const maxLevels = new Object();
  const childPositions = new Object();
  var dragInterval = null;
  var dragging = false;
  var dragNode = null;

  function OnDragging()
  {
    RepositionSubTree(dragNode)
  }

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

  //Add proper position check, depending on whether it is a left, right, or middle sided node to render the parent position for a middle pathway.
  function RenderChildren(parent, row = 1, parentLeft = window.innerWidth/2, path = 'middle')
  {
    
    if(parent == null){ return (<></>)}
    const children = parent.children;

    if(children == null){return (<></>)}

    parent["left"] = parentLeft;
    parent["top"] = (row-1)*160;
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

      var maxRight =  'Right' in maxLevel ? maxLevel.Right : null;
      var maxLeft = 'Left' in maxLevel ? maxLevel.Left : null; 
      
      if(path === 'middle')
      {
        var leftSpace = 0;
    
        if((i > 0 || children.length%2==0) && i%2 == 0){ leftSpace = childCountEven > 1 ? -1*leftCount*childCountEven/2 : -1*leftCount; }
        if((i > 0 || children.length%2==0) && i%2 == 1){ leftSpace = childCountOdd > 1 ? leftCount*childCountOdd/2 : leftCount; }

        var left = leftSpace+parentLeft;

        var pathSplitter = 'middle'; 

        if(i == 0) pathSplitter = 'middle';
        else if(i%2 == 0) pathSplitter = 'left';
        else if(i%2 == 1) pathSplitter = 'right';

        childElements.push((
          <>    
              {RenderChildren(child, row + 1, left, pathSplitter)}       
          </>));

        var childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();
        var positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
        if(positionAboveChildren != null && 
          (pathSplitter === "middle" && positionAboveChildren <= maxRight-elementWidth && positionAboveChildren >= maxLeft+elementWidth ) ||
          (pathSplitter === "left" && positionAboveChildren <= maxLeft-elementWidth  ) ||
          (pathSplitter === "right" && positionAboveChildren >= maxRight+elementWidth  ))
        {
           left = positionAboveChildren; 
        }

        if(maxLeft == null || left < maxLeft) maxLevel["Left"] = left;
        if(maxRight == null || left > maxRight) maxLevel["Right"] = left;

        if(i >= children.length-2 && i%2 == 0){ parentNodePosition["Left"] = left; }
        if(i >= children.length-2 && i%2 == 1){ parentNodePosition["Right"] = left; }
        if(i >= children.length-1)
        {
          childPositions[String(parent.id)] = parentNodePosition;
        }
      }
      else if(path === 'right')
      {
        var leftSpace = 0;
        var left = 0;
        leftSpace = leftCount*(-1*(children.length-1)/2+i);
        left = leftSpace+parentLeft; 

        var pathSplitter = 'right'; 
        
        if(maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        childElements.push((
          <>    
              {RenderChildren(child, row + 1, left, pathSplitter)}       
          </>));
        var childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();

        var positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
        if(positionAboveChildren != null && positionAboveChildren >= maxRight+elementWidth){
           left = positionAboveChildren; 
        }

        maxLevel["Right"] = left;

        if(maxLeft == null || left < maxLeft) maxLevels["Left"] = left;

        if(i==0){ parentNodePosition["Left"] = left; }
        if(i >= children.length-1)
        { 
          parentNodePosition["Right"] = left;
          childPositions[String(parent.id)] = parentNodePosition;
          //console.log("setParentPositions");
          //console.log("id: "+parent.id);
          //console.log("coordinates: "+parentNodePosition["Left"]+"  "+parentNodePosition["Right"]);
        }
      }
      else if(path === 'left')
        {
          var leftSpace = 0;
          var left = 0;
          //if((i > 0 || children.length%2==0) && i%2 == 0){ leftSpace = childCountEven > 1 ? -1*leftCount*childCountEven/2 : -1*leftCount; }
          //if((i > 0 || children.length%2==0) && i%2 == 1){ leftSpace = childCountOdd > 1 ? leftCount*childCountOdd/2 : leftCount; }
          leftSpace = leftCount*((children.length-1)/2-i);

          if(child.children.length > 0){ left = child["Left"]+(child["Right"]-child["Left"])/2; }
          else{ left = leftSpace+parentLeft; }
  
          var pathSplitter = 'left'; 
          
          if(maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
  
          childElements.push((
            <>    
                {RenderChildren(child, row + 1, left, pathSplitter)}       
            </>));
          var childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();
  
          var positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
          if(positionAboveChildren != null && positionAboveChildren <= maxRight-elementWidth){
             left = positionAboveChildren; 
          }
          //console.log("positionAboveChildren");
          //console.log("value: "+positionAboveChildren);
          //console.log("id: "+child.id);
          //console.log("coordinates: "+childPositionsOfNode["Left"]+"  "+childPositionsOfNode["Right"]);
  
          maxLevel["Left"] = left;
  
          if(maxLeft == null || left > maxRight) maxLevels["Right"] = left;
  
          if(i== 0){ parentNodePosition["Right"] = left; }
          if(i >= children.length-1)
          { 
            parentNodePosition["Left"] = left;
            childPositions[String(parent.id)] = parentNodePosition;
          }
        }

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

          <Draggable onDrag = {(drag) =>{ RepositionSubTree(drag, parent); if(parent.nodeId && document.getElementsByClassName(parent.nodeId+"_"+parent.id).length > 0){ document.getElementsByClassName(parent.nodeId+"_"+parent.id)[0].remove(); }}}>
            <div>
              <TreeNode props = {parent} css = {{top: String((row-1)*160)+'px', right: '0rem', left: String(parentLeft)+'px'}} />
            </div>
          </Draggable>
        
      </>
    )
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

  function RepositionSubTree(dragEvent, node)
  {
    const X = dragEvent.x;
    const Y = dragEvent.y;

    if(!('position' in node))
    {
      const nodeElement = document.getElementById(node.id);
      node['position'] = GetElementPosition(nodeElement);
    }  

    const position = node['position'];
    const xOffset = X-position.X;
    const yOffset = Y-position.Y;

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

  return (
    <>
      <div id = 'tree-root' onLoad={() => {SetPositions(tree)}}>
        {RenderChildren(tree)}
        {AddLines(tree)}
      </div>
    </>
  );
}

export default App
