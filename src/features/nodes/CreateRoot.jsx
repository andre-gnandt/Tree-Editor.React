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
            <i className='pi pi-warehouse' style = {{fontSize: iconSize, color: 'brown'}} onClick = {() => { setCreateNode(true);}} />
            <Dialog className={"dialogContent"} showHeader = {false} headerStyle={{background: 'white', height: '0px'}} contentStyle={{background: 'white'}} visible = {createNode} onHide={() => {if (!createNode) return; setCreateNode(false);}} > 
                <Provider store = {store}>
                    <NodeDetails rootNode = {tree} files = {newRoot.files} root = {true} render = {ReRenderTree} input = {newRoot} nodeList = {nodeList} nodeDictionary = {nodeDictionary}/>
                </Provider>
            </Dialog>
        </>
    );
}

export default CreateRoot 