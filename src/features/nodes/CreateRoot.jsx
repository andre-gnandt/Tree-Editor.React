import React, {useEffect, useState} from 'react'
import { Dialog } from 'primereact/dialog';
import { cloneNode } from './nodeSlice';
import './DetailsList.css'
import NodeDetails from './NodeDetails';
import { useDispatch } from 'react-redux';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';

const CreateRoot = ({nodeList, nodeDictionary, iconSize, rootNode, render, treeId}) => {
    const [createNode, setCreateNode] = useState(null);
    const [mobile, setMobile] = useState(window.innerHeight > 0.85 * window.innerWidth ? true : false);
    const dispatch = useDispatch();

    useEffect(() => {
            
        if(createNode)
        {
            window.addEventListener('resize', isMobile);
        }
        else 
        {
            window.removeEventListener('resize', isMobile);
        }
        
        return () => window.removeEventListener('resize', isMobile);
    });

    function isMobile()
    {
        if(window.innerHeight > 0.85 * window.innerWidth)
        {
            setMobile(true);
        }
        else
        {
            setMobile(false);
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
        window.removeEventListener('resize', isMobile);
        setCreateNode(false);
    }

    const OpenDialog = () => 
    {
        dispatch(cloneNode(newRoot));
        setCreateNode(true);
    }

    return (
        <>
            <button className='button-header button-root tooltip' style = {{marginRight: '1vw'}}>
                <i id = 'create-root-button' className='pi pi-warehouse diagram-header-icon' onClick = {() => { OpenDialog();}} />
                <span class="tooltip-left">New Root Node</span>
            </button> 
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog 
                    className={"dialogContent"} 
                    draggable showHeader = {false}  
                    style = {{width: mobile ? '88vw' : String(0.45*screen.width)+"px", height: mobile ? '73.9vw' : '86vh', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px'}} 
                    contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}} 
                    visible = {createNode} 
                    onHide={() => {if (!createNode) return; unMount();}} >                  
                        <NodeDetails mobile = {mobile} unMount = {unMount} rootNode = {rootNode} files = {newRoot.files} root = {true} render = {render} inputNode = {newRoot} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
                </Dialog>
            </Draggable>
        </>
    );
}

export default CreateRoot 