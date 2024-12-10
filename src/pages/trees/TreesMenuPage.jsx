import { useEffect, useState } from 'react'
import { GetTreeList } from '../../api/trees/treesApi';
import TreesMenu from '../../features/trees/TreesMenu';

const TreesMenuPage = () => {
  const [list, setList] = useState(null);   
  
  useEffect(() => {
      if(!list)
      {
        SetTreeList();
      }
  });

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
