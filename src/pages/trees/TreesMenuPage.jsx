import { useEffect, useState } from 'react'
import { GetTreeList } from '../../api/trees/treesApi';
import TreesMenu from '../../features/trees/TreesMenu';

const TreesMenuPage = () => {
  const [list, setList] = useState(null);
  const maxCount = 1000;   
  const itemsPerPage = 20;
  
  useEffect(() => {
      if(!list)
      {
        SetTreeList();
      }
  });

  async function SetTreeList()
  {
    const getList = await GetTreeList(maxCount);
    setList(getList);
  }

  return (
    <>
    { (list) &&
        (
            <>
                <TreesMenu trees = {list} maxCount = {maxCount} itemsPerPage={itemsPerPage}/>
            </>
        )
    }
    </>
  );
}

export default TreesMenuPage
