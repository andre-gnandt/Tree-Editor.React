import { useState, useEffect, useRef } from 'react'
import TreesMenu from './features/trees/TreesMenu';

const Startup = () => {
  const [list, setList] = useState(null);   
  
  if(!list)
  {
    waitForTreeList();
  }
 
  async function GetTreeList(){
    await fetch("http://localhost:11727/api/Trees").then(res => res.json()).then(
        result => { 
          var trees = result;
          setList(trees);
        }
    );   
  };

  async function waitForTreeList()
  {
    await GetTreeList();
  }

  return (
    <>
    { (list) &&
        (
            <>
                <TreesMenu trees = {list}/>
            </>
        )
    }
    </>
  );
}

export default Startup
