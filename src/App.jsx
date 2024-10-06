import { useState, useEffect, useRef } from 'react'
//import { render} from 'react-dom';
import NodeDetails   from './features/nodes/NodeDetails'
//import  GetTrees   from './api/nodes/nodesApi';
import TreeNode from './features/nodes/TreeNode';
import LineTo from 'react-lineto';
import './App.css'

function App() {
  const firstRender = useRef(true);
  const [tree, setTree] = useState(null);
  const maxLevels = new Object();
  const childPositions = new Object();

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
    
  /*
  
  function RenderChildren(parent, row = 1, parentLeft = window.innerWidth/2, maxLevels = new Object(), firstNode = false, path = 'middle')
  {
    
    if(parent == null){ return (<></>)}
    const children = parent.children;
    console.log("children");
    console.log(children);

    if(children == null){return (<></>)}

    var elementWidth = 160;
    //var 
    let widthCount = (children.length-1)*elementWidth;
    const childElements = [];
    const childTrees = [];
    var i = 0;
    var leftCount = elementWidth;
    var childCountOdd = 0;
    var childCountEven = 0;

    var maxLevel = String(row-1) in maxLevels ? maxLevels[String(row-1)] : {}
    var maxRight =  'Right' in maxLevel ? maxLevel.Right : null;
    var maxLeft = 'Left' in maxLevel ? maxLevel.Left : null; 

    children.forEach(child => {
      var leftSpace = 0;
      var childSpace =  0.00;
      if((i > 0 || children.length%2==0) && i%2 == 0){ childSpace = child.children.length > 1 ? -1*child.children.length*leftCount/2 : 0; childCountEven =  child.children.length;}
      if((i > 0 || children.length%2==0) && i%2 == 1){ childSpace = child.children.length > 1 ? child.children.length*leftCount/2 : 0; childCountOdd =  child.children.length; }

      //if(i >= children.length && i%2==0 && ){ }
  
      if((i > 0 || children.length%2==0) && i%2 == 0){ leftSpace = childCountEven > 1 ? -1*leftCount*childCountEven/2 : -1*leftCount; }
      if((i > 0 || children.length%2==0) && i%2 == 1){ leftSpace = childCountOdd > 1 ? leftCount*childCountOdd/2 : leftCount; }
      //var right = widthCount > 0 ? widthCount + parentRight : 0;
      var left = childSpace+leftSpace+parentLeft;
      childElements.push((
      <>    
          {RenderChildren(child, row + 1, left)} 
          <TreeNode props = {child} css = {{top: String(row*10)+'rem', right: '0rem', left: String(left)+'px'}} />       
      </>));

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
    )
  }

  */

  function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

  //Add proper position check, depending on whether it is a left, right, or middle sided node to render the parent position for a middle pathway.
  function RenderChildren(parent, row = 1, parentLeft = window.innerWidth/2, path = 'middle')
  {
    
    if(parent == null){ return (<></>)}
    const children = parent.children;

    if(children == null){return (<></>)}

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
        //console.log("positionAboveChildren");
        //console.log("value: "+positionAboveChildren);
        //console.log("id: "+child.id);
        //console.log("coordinates: "+childPositionsOfNode["Left"]+"  "+childPositionsOfNode["Right"]);

        if(maxLeft == null || left < maxLeft) maxLevel["Left"] = left;
        if(maxRight == null || left > maxRight) maxLevel["Right"] = left;

        if(i >= children.length-2 && i%2 == 0){ parentNodePosition["Left"] = left; }
        if(i >= children.length-2 && i%2 == 1){ parentNodePosition["Right"] = left; }
        if(i >= children.length-1)
        {
          childPositions[String(parent.id)] = parentNodePosition;
          //console.log("setParentPositions");
          //console.log("id: "+parent.id);
          //console.log("coordinates: "+parentNodePosition["Left"]+"  "+parentNodePosition["Right"]);
        }
        

        childElements.push((
          <>    
              <TreeNode props = {child} css = {{top: String(row*10)+'rem', right: '0rem', left: String(left)+'px'}} />      
          </>
        ));
      }
      else if(path === 'right')
      {
        var leftSpace = 0;
        var left = 0;
        //if((i > 0 || children.length%2==0) && i%2 == 0){ leftSpace = childCountEven > 1 ? -1*leftCount*childCountEven/2 : -1*leftCount; }
        //if((i > 0 || children.length%2==0) && i%2 == 1){ leftSpace = childCountOdd > 1 ? leftCount*childCountOdd/2 : leftCount; }
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
        //console.log("positionAboveChildren");
        //console.log("value: "+positionAboveChildren);
        //console.log("id: "+child.id);
        //console.log("coordinates: "+childPositionsOfNode["Left"]+"  "+childPositionsOfNode["Right"]);

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

        childElements.push((
          <>    
              <TreeNode props = {child} css = {{top: String(row*10)+'rem', right: '0rem', left: String(left)+'px'}} />         
          </>
        ));
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
            //console.log("setParentPositions");
            //console.log("id: "+parent.id);
            //console.log("coordinates: "+parentNodePosition["Left"]+"  "+parentNodePosition["Right"]);
          }
  
          childElements.push((
            <>    
                <TreeNode props = {child} css = {{top: String(row*10)+'rem', right: '0rem', left: String(left)+'px'}} />      
            </>
          ));
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
      </>
    )
  }
    
  function AddLines(node)
  {
    if(node == null || !('children' in node)){return (<></>)}
    const lines = [];
    
      node.children.forEach(child => 
      {           
          lines.push(
            <>
              <LineTo id = {""} delay from={node.id} to={child.id} className={node.id+"_"+child.id} /> 
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

  return (
    <>
      
      {RenderChildren(tree)}
      <TreeNode props = {tree} css = {{top: '0rem', right: '0rem', left: String(window.innerWidth/2)+'px'}}/>
      {AddLines(tree)}
    </>
  );
}

export default App
