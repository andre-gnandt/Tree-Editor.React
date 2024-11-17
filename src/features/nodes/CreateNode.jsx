import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
//import './detailsList.css'
import '../trees/tree.css';
import NodeDetails from './NodeDetails';
import { Provider } from 'react-redux';
import { store } from '/LocalTreeData.React/src/store';
import 'primeicons/primeicons.css';

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
        isDeleted: false,
    };

    return (
        <>  
            <button className = {(rootId == null) ? 'button-header button-save tooltip' : 'button-header button-create tooltip'} disabled = {(rootId == null )}>
                <i className='pi pi-upload' style = {{fontSize: '7.2vh'}} onClick = {() => { setCreateNode(true);}} />
                <span class="tooltip-left">New Node</span>
            </button>
            <Dialog className={"dialogContent"} showHeader = {false} headerStyle={{background: 'white', height: '0px'}} contentStyle={{background: 'white'}} visible = {createNode} onHide={() => {if (!createNode) return; setCreateNode(false);}} > 
                <Provider store = {store}>
                    <NodeDetails rootNode = {tree} files = {newNode.files} create = {true} render = {ReRenderTree} input = {newNode} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
                </Provider>
            </Dialog>
        </>
    );
}

export default CreateNode 