import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber, updateNodeDescription, updateNodeTitle, updateNodeRank, updateNodeParent} from './nodeSlice'
import { InputText} from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './detailsList.css';

const NodeDetails = (input, create = false) => {
    const node = useSelector(state => state.node);
    const dispatch = useDispatch();
    const firstRender = useRef(true);
    const props = input.input;

    if(firstRender.current){
        dispatch(cloneNode(props));
    }

    const handleChange = (value, method) => {
        firstRender.current = false;
        dispatch(method(value));
    }

    const setNode = (prop) => {
        prop.data = node.data;
        prop.title = node.title;
        prop.number = node.number;
        prop.description = node.description;
        prop.rank = node.rank;
        prop.level = node.level;
        prop.nodeId = node.nodeId;
        prop.id = node.id;
        prop.isDeleted = node.isDeleted;
    }

    function RenderCreateOrSaveButton()
    {
        if(create)
        {
            return (
                <>Create</>
            );
        }
        
        return (
            <>Save</>
        );
    }

        return(
            <div className='container'>
                <div style = {{display: 'flex', height: '33vh', marginBottom: '5.275vh'}}>
                    <div className="thumbnail-container">
                    </div>
                    <div className='title-container'>
                        <InputTextarea 
                            autoResize 
                            rows = {1} 
                            placeholder="Title" 
                            className='title'
                            spellCheck = {false}
                            onChange = {(e) => handleChange(e.target.value, updateNodeTitle)} value = {node.title} />
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Description:  
                    </div> 
                    <div className="fullWidthRight">
                        <InputText unstyled className = "input" onChange = {(e) => handleChange(e.target.value, updateNodeDescription)} value = {node.number ? node.number : ""} />
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Data: 
                    </div>
                    <div className="fullWidthRight">
                        <InputText className = "input" onChange = {(e) => handleChange(e.target.value, updateNodeData)} value = {node.data} />    
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Number:  
                    </div> 
                    <div className="fullWidthRight">
                        <InputText className = "input" keyfilter='int' onChange = {(e) => handleChange(e.target.value, updateNodeNumber)} value = {node.number ? node.number : ""} />
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Rank:  
                    </div> 
                    <div className="fullWidthRight">
                        <InputText className = "input" value = {""} />
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Parent:  
                    </div> 
                    <div className="fullWidthRight">
                        <InputText className = "input" onChange = {(e) => handleChange(e.target.value, updateNodeParent)} value = {node.number ? node.number : ""} />
                    </div>
                </div>
                
                <div style = {{display: 'flex'}}>
                    <button className='button' style = {{marginRight: '2px'}} onClick = {() => {updateNode(node.id, node); setNode(props); }}> {RenderCreateOrSaveButton()} </button>
                    <button className='button' onClick = {() => handleChange(props, cloneNode)} > Reset </button>
                </div>
            </div> );
}

export default NodeDetails 