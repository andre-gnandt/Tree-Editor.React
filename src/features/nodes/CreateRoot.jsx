import React, { useState} from 'react'
import { Dialog } from 'primereact/dialog';
import { cloneNode } from './nodeSlice';
import './DetailsList.css'
import NodeDetails from './NodeDetails';
import { useDispatch } from 'react-redux';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';

const CreateRoot = ({nodeList, nodeDictionary, iconSize, rootNode, render, treeId}) => {
    const [createNode, setCreateNode] = useState(null);
    const dispatch = useDispatch();

    const newRoot = 
    {
        data: null,
        title: null,
        level: 0,
        description: null,
        number: null,
        nodeId: null,
        rankId: null,
        children: [],
        files: [],
        thumbnailId: null,
        treeId: treeId,
    };

    const unMount = () => 
    {
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
                <i id = 'create-root-button' className='pi pi-warehouse' style = {{fontSize: '7.2vh'}} onClick = {() => { OpenDialog();}} />
                <span class="tooltip-left">New Root Node</span>
            </button> 
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog className={"dialogContent"} draggable showHeader = {false}  contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '1vw solid #274df5', borderRadius: '5vw', backgroundColor: '#E0E0E0'}} visible = {createNode} onHide={() => {if (!createNode) return; setCreateNode(false);}} >                  
                        <NodeDetails unMount = {unMount} rootNode = {rootNode} files = {newRoot.files} root = {true} render = {render} inputNode = {newRoot} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
                </Dialog>
            </Draggable>
        </>
    );
}

export default CreateRoot 