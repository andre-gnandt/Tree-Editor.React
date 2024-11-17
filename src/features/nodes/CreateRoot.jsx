import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import './detailsList.css'
import NodeDetails from './NodeDetails';
import { Provider } from 'react-redux';
import { store } from '/LocalTreeData.React/src/store';
import 'primeicons/primeicons.css';

const CreateRoot = (props) => {
    const [createNode, setCreateNode] = useState(null);
    const nodeList = props.nodeList;
    const nodeDictionary = props.nodeDictionary;
    const iconSize = props.iconSize;
    const tree = props.rootNode;
    const ReRenderTree = props.render;

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
        isDeleted: false,
    };


    return (
        <>
            <button className='button-header button-root tooltip' style = {{marginRight: '1vw'}}>
                <i className='pi pi-warehouse' style = {{fontSize: String(iconSize*0.9)+'px'}} onClick = {() => { setCreateNode(true);}} />
                <span class="tooltip-left">New Root Node</span>
            </button> 
            <Dialog className={"dialogContent"} showHeader = {false} headerStyle={{background: 'white', height: '0px'}} contentStyle={{background: 'white'}} visible = {createNode} onHide={() => {if (!createNode) return; setCreateNode(false);}} > 
                <Provider store = {store}>
                    <NodeDetails rootNode = {tree} files = {newRoot.files} root = {true} render = {ReRenderTree} input = {newRoot} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
                </Provider>
            </Dialog>
        </>
    );
}

export default CreateRoot 