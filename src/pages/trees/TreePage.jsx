import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  const Loading = () => 
    {
        document.getElementById('loading').hidden = false;
    }
    
    const DoneLoading = () => 
    {
        document.getElementById('loading').hidden = true;
    }

  async function GetFullTree(){
    Loading();
    return await fetch("http://localhost:11727/api/Trees/FullTree/"+id).then(res => res.json()).then(
        result => { 
          DoneLoading();
          return result;
        }
    );   
  };

  async function SetFullTree()
  {
    const getTree = await GetFullTree();
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
