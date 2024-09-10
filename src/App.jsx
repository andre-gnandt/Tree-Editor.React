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
        result => { console.log("result"); console.log(result[0]); setTree(result[0]);}
    );
  };

  if(firstRender.current){
    GetTrees();
    firstRender.current = false;
  }
    
  function RenderChildren(parent, level = 1)
  {
    if(parent == null){ return (<></>)}
    const children = parent.children;
    console.log("children");
    console.log(children);

    var count = 0;
    if(children == null){return (<></>)}

    const childElements =[];
    children.forEach(child => {
      childElements.push((
      <>
        <TreeNode props = {child} /> 
        {RenderChildren(child, level + 1)}
      </>));
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
      <div id = 'tree-root'>
        <TreeNode props = {tree} />
        {RenderChildren(tree)}
      </div>      
    </>
  )
}

export default App
