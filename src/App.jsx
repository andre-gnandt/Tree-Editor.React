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
    
  function RenderChildren(parent)
  {
    if(parent == null){ return (<></>)}
    const children = parent.children;
    console.log("children");
    console.log(children);

    if(children == null){return (<></>)}
    return(
      <>
        {children.map(child => 
            <div key = {child.id}> <div> CHILD 
              <TreeNode props = {child} /> </div>
              {RenderChildren(child)}
            </div>
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
