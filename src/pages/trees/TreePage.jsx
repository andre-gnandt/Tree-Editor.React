import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetFullTree } from '../../api/trees/treesApi';
import { GetCountries } from '../../api/configsApi';
import Tree from '../../features/trees/Tree';

const TreePage = () => {
    const id = useParams().id;
    const [treeFetch, setTreeFetch] = useState(null);
    const [countries, setCountries] = useState(null);
  
  useEffect(() => {
      if(!countries && !treeFetch)
      {
        SetFullTree();
        SetCountries();
      }
  });

  async function SetCountries()
  {
    const countryFetch = await GetCountries();
    setCountries(countryFetch);
  }

  async function SetFullTree()
  {
    const getTree = await GetFullTree(id);
    setTreeFetch(getTree);
  }

  return (
    <>
    { (treeFetch && countries) &&
        (
            <>
                <Tree id = {id} treeFetch = {treeFetch} countries={countries}/>
            </>
        )
    }
    </>
  );
}

export default TreePage
