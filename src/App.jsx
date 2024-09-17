import { useState, useEffect, useRef } from 'react'
//import { render} from 'react-dom';
import NodeDetails   from './features/nodes/NodeDetails'
//import  GetTrees   from './api/nodes/nodesApi';
import TreeNode from './features/nodes/TreeNode';
import './App.css'

function App() {
  const firstRender = useRef(true);
  const [tree, setTree] = useState(null);

  function GetTrees(){
    fetch("http://localhost:11727/api/Nodes/Trees").then(res => res.json()).then(
        result => { setTree(result[0]);}
    );
  };

  if(firstRender.current){
    GetTrees();
    firstRender.current = false;
  }
    
  /*
  
  function RenderChildren(parent, row = 1, parentLeft = window.innerWidth/2, parentRight = 0)
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
    children.forEach(child => {
      var leftSpace = 0;
      var childSpace =  0.00;
      if((i > 0 || children.length%2==0) && i%2 == 0){ childSpace = child.children.length > 1 ? -1*child.children.length*leftCount/2 : 0; childCountEven =  child.children.length;}
      if((i > 0 || children.length%2==0) && i%2 == 1){ childSpace = child.children.length > 1 ? child.children.length*leftCount/2 : 0; childCountOdd =  child.children.length; }
  
      if((i > 0 || children.length%2==0) && i%2 == 0){ leftSpace = childCountEven > 1 ? -1*leftCount*childCountEven/2 : -1*leftCount; }
      if((i > 0 || children.length%2==0) && i%2 == 1){ leftSpace = childCountOdd > 1 ? leftCount*childCountOdd/2 : leftCount; }
      //var right = widthCount > 0 ? widthCount + parentRight : 0;
      var right = 0;
      var left = childSpace+leftSpace+parentLeft;
      childElements.push((
      <>    
          {RenderChildren(child, row + 1, left, right)} 
          <TreeNode props = {child} css = {{top: String(row*10)+'rem', right: String(right)+'rem', left: String(left)+'px'}} />       
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
    

  return (
    <>
      
      {RenderChildren(tree)}
      <TreeNode props = {tree} css = {{top: '0rem', right: '0rem', left: String(window.innerWidth/2)+'px'}}/>
          
    </>
  )
}

export default App
