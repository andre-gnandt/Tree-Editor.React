import { useEffect, useState } from 'react'
import TreesMenu from './features/trees/TreesMenu';

const TreesMenuPage = () => {
  const [list, setList] = useState(null);   
  
  useEffect(() => {
      if(!list)
      {
        SetTreeList();
      }
  });
 
  async function GetTreeList(){
    return await fetch("http://localhost:11727/api/Trees").then(res => res.json()).then(
        (result) => { 
          return result;
        }
    );   
  };

  async function SetTreeList()
  {
    const getList = await GetTreeList();
    setList(getList);
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

export default TreesMenuPage
