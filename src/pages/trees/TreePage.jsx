import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetFullTree } from '../../api/trees/treesApi';
import Tree from '../../features/trees/Tree';

const TreePage = () => {
    const id = useParams().id;
    const [treeFetch, setTreeFetch] = useState(null);
  
  useEffect(() => {
      if(!treeFetch)
      {
        SetFullTree();
      }
  });

  async function SetFullTree()
  {
    const getTree = await GetFullTree(id);
    setTreeFetch(getTree);
  }

  return (
    <>
    { (treeFetch) &&
        (
            <>
                <Tree id = {id} treeFetch = {treeFetch}/>
            </>
        )
    }
    </>
  );
}

export default TreePage
