import React, {useCallback, useEffect, useState} from 'react';
//import './DetailsList.css'
import '../trees/tree.css';
import { useDispatch } from 'react-redux';
import 'primeicons/primeicons.css';
import { cloneNode } from './nodeSlice';
import NodeDialog from './NodeDialog';

const CreateNode = ({nodeList, nodeDictionary, countries, rootNode, render, treeId}) => {
    const [createNode, setCreateNode] = useState(null);
    const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth ? true : false);
    const dispatch = useDispatch();

    const unMount = useCallback(() => 
    {
        window.removeEventListener('resize', isPortrait);
        setCreateNode(false);
    }, []);
    
    useEffect(() => {
        
        if(createNode)
        {
            window.addEventListener('resize', isPortrait);
        }
        else 
        {
            window.removeEventListener('resize', isPortrait);
        }
        
        return () => window.removeEventListener('resize', isPortrait);
    });
    

    const newNode = 
    {
        data: null,
        title: null,
        level: 0,
        description: null,
        number: null,
        nodeId: rootNode ? rootNode.id : null,
        rankId: null,
        country: null,
        region: null,
        children: [],
        files: [],
        thumbnailId: null,
        treeId: rootNode ? rootNode.treeId : null,
    };
   
    function isPortrait()
    {
        if(window.innerHeight > window.innerWidth)
        {
            setPortrait(true);
        }
        else
        {
            setPortrait(false);
        }
    }
    

    function CompareNodes(a, b)
    {
        if ( a.title < b.title ){                                                                   
            return -1;
          }
          if ( a.title > b.title ){
            return 1;
          }
          return 0;
    }

    function GetNodeList()
    {   
        const newList = [...nodeList];
        return newList.sort(CompareNodes);
    }

    const OpenDialog = () => 
    {
        isPortrait();
        dispatch(cloneNode(newNode));
        setCreateNode(true);
    }

    return (
        <>  
            <button className = {(newNode.nodeId == null) ? 'button-header button-save tooltip' : 'button-header button-create tooltip'} disabled = {(newNode.nodeId == null )}>
                <i className='pi pi-upload diagram-header-icon'  onClick = {() => { OpenDialog();}} />
                <span className="tooltip-left">New Node</span>
            </button>
            <NodeDialog
                create = {true}
                unMount = {unMount}
                countries = {countries}
                portrait = {portrait}
                open = {createNode}
                files = {newNode.files} 
                render = {render}
                inputNode = {newNode}
                nodeList = {GetNodeList()}
                nodeDictionary = {nodeDictionary}
            />  
        </>
    );
}

export default CreateNode 