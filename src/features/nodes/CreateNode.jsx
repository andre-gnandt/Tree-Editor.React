import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
//import './detailsList.css'
import '../trees/tree.css';
import NodeDetails from './NodeDetails';
import { Provider } from 'react-redux';
import { store } from '../../store';
import 'primeicons/primeicons.css';
import Draggable from 'react-draggable';

const CreateNode = (props) => {
    const [createNode, setCreateNode] = useState(null);
    const nodeList = props.nodeList;
    const nodeDictionary = props.nodeDictionary;
    const iconSize = props.iconSize;
    const tree = props.rootNode;
    const ReRenderTree = props.render;
    const rootId = tree ? tree.id : null;

    const newNode = 
    {
        data: null,
        title: null,
        level: 0,
        description: null,
        number: null,
        nodeId: rootId,
        rankId: null,
        children: [],
        files: [],
        thumbnailId: null,
        treeId: props.treeId,
        isDeleted: false,
    };

    const unMount = () => 
    {
        setCreateNode(false);
    }

    return (
        <>  
            <button className = {(rootId == null) ? 'button-header button-save tooltip' : 'button-header button-create tooltip'} disabled = {(rootId == null )}>
                <i className='pi pi-upload' style = {{fontSize: '7.2vh'}} onClick = {() => { setCreateNode(true);}} />
                <span class="tooltip-left">New Node</span>
            </button>
            <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
                <Dialog className={"dialogContent"} draggable showHeader = {false}  contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '1vw solid #274df5', borderRadius: '5vw', backgroundColor: '#E0E0E0'}} visible = {createNode} onHide={() => {if (!createNode) return; setCreateNode(false);}} > 
                    <Provider store = {store}>
                        <NodeDetails unMount = {unMount} rootNode = {tree} files = {newNode.files} create = {true} render = {ReRenderTree} input = {newNode} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
                    </Provider>
                </Dialog>
            </Draggable>
        </>
    );
}

export default CreateNode 