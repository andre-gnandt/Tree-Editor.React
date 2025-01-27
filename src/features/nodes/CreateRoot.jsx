import React, {useEffect, useState} from 'react'
import { cloneNode } from './nodeSlice';
import './DetailsList.css'
import { useDispatch } from 'react-redux';
import NodeDialog from './NodeDialog';
import 'primeicons/primeicons.css';

const CreateRoot = ({nodeList, nodeDictionary, countries, rootNode, render, treeId}) => {
    const [createNode, setCreateNode] = useState(null);
    const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth ? true : false);
    const dispatch = useDispatch();

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

    const newRoot = 
    {
        data: null,
        title: null,
        level: 0,
        description: null,
        number: null,
        nodeId: null,
        rankId: null,
        country: null,
        region: null,
        children: [],
        files: [],
        thumbnailId: null,
        treeId: treeId,
    };

    const unMount = () => 
    {
        window.removeEventListener('resize', isPortrait);
        setCreateNode(false);
    }

    const OpenDialog = () => 
    {
        isPortrait();
        dispatch(cloneNode(newRoot));
        setCreateNode(true);
    }

    return (
        <>
            <button className='button-header button-root tooltip' style = {{marginRight: '0.3rem'}}>
                <i id = 'create-root-button' className='pi pi-warehouse diagram-header-icon' onClick = {() => { OpenDialog();}} />
                <span className="tooltip-left">New Root Node</span>
            </button> 
            <NodeDialog
                root = {true}
                unMount = {unMount}
                countries = {countries}
                portrait = {portrait}
                open = {createNode}
                rootNode = {rootNode}
                files = {newRoot.files} 
                render = {render}
                inputNode = {newRoot}
                nodeList = {nodeList}
                nodeDictionary = {nodeDictionary}
            />
        </>
    );
}

export default CreateRoot 