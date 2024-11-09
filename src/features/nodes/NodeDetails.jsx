import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber, updateNodeDescription, updateNodeTitle, updateNodeRank, updateNodeParent} from './nodeSlice'
import { InputText} from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './detailsList.css';
import UploadAndDisplayImage from '../UploadAndDisplayImage';

const NodeDetails = (input) => {
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const titlePresent = useRef(true);
    const[titleRequired, setTitleRequired] = useState(titlePresent.current);
    const nodeList = useRef([]);

    const create = 'create' in input ? input['create'] : false;
    const node = useSelector(state => state.node);
    const dispatch = useDispatch();
    const firstRender = useRef(true);
    const props = input.input;
    const nodeDictionary = input.nodeDictionary;

    if(firstRender.current){
        dispatch(cloneNode(props));
        nodeList.current = [...input.nodeList];
        RemoveDescendants(props);
        nodeList.current = nodeList.current.sort(CompareNodes);
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
        prop.rankId = node.rankId;
        prop.level = node.level;
        prop.nodeId = node.nodeId;
        prop.id = node.id;
        prop.isDeleted = node.isDeleted;
        prop.files = node.files;
        prop.thumbnailId = node.thumbnailId;
    }

    function createNode(node){
        const postOptions =  {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        postOptions.body = JSON.stringify(node);
        fetch("http://localhost:11727/api/Nodes/", postOptions);
    };

    function RemoveDescendants(node)
    {
        const removeIndex = nodeList.current.findIndex((object) => object.id === node.id);
        if(removeIndex > -1)  nodeList.current.splice(removeIndex, 1);
        node.children.forEach(child => {
            RemoveDescendants(child);
        });
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

    function CheckValueChange(originalValue, previousValue, newValue)
    {
        const previousChangeCount = changeCount.current;
        if(previousValue ==  originalValue && newValue != originalValue)
        {
            changeCount.current++;
        }
        else if(previousValue !=  originalValue && newValue == originalValue)
        {
            changeCount.current--;
        }

        if((previousChangeCount == 0 && changeCount.current != 0) || (previousChangeCount != 0 && changeCount.current == 0))
        {
            setHideButtons(changeCount.current);
        }
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

    function HandleSaveOrCreate()
    {
        if(!node.title || node.title.length === 0)
        {
            titlePresent.current = false;
            setTitleRequired(false);
        }
        else if(!create)
        {
            updateNode(node.id, node); 
            
            if(node.nodeId != props.nodeId)
            {
                const oldParentNode = nodeDictionary[props.nodeId];
                const newParentNode = nodeDictionary[node.nodeId];
                const removeOldChildIndex = oldParentNode.children.findIndex((object) => object.id === node.id);
                if(removeOldChildIndex > -1)  oldParentNode.children.splice(removeOldChildIndex, 1);
                newParentNode.children.push(node);

                setNode(props);
                input.render(true);
            }
            else{
                setNode(props);
            }
        }
        else
        {
            createNode(node);
            setNode(props);
            //input.render(tree, true);
        }    
    }

    //style = {{marginBottom: (hideButtons === 0) ? '0vh' : '3.275vh'}}
        return(
            <div className='container'>
                <div style = {{display: 'flex', height: '33vh', marginBottom: '5.275vh'}}>
                    <div className="thumbnail-container">
                        <img className='image'/>
                    </div>
                    <div className='title-container'>
                        <InputTextarea 
                            autoResize 
                            rows = {1} 
                            placeholder="Title" 
                            className= {(titleRequired) ? "title" : "title-required"}
                            spellCheck = {false}
                            onChange = {(e) => {CheckValueChange(props.title, node.title, e.target.value); handleChange(e.target.value, updateNodeTitle);}} value = {node.title ? node.title : ""} />
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Description:  
                    </div> 
                    <div className="fullWidthRight" style = {{height: '17vh'}}>
                        <InputTextarea  autoResize style = {{height: '17vh'}} rows={5} className = "input" onChange = {(e) => {CheckValueChange(props.description, node.description, e.target.value); handleChange(e.target.value, updateNodeDescription);}} value = {node.description ? node.description : ""} />
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Data: 
                    </div>
                    <div className="fullWidthRight" style = {{height: '26vh'}}>
                        <InputTextarea autoResize rows={7} style = {{height: '26vh'}} className = "input-data" onChange = {(e) => {CheckValueChange(props.data, node.data, e.target.value); handleChange(e.target.value, updateNodeData);}} value = {node.data? node.data : ""} />    
                    </div>
                </div>
                <div className="entryContainer">
                    <div className = "fullWidthLeft">
                        Number:  
                    </div> 
                    <div className="fullWidthRight">
                        <InputText className = "input" type = 'number' keyfilter='int' onChange = {(e) => {CheckValueChange(props.number, node.number, e.target.value); handleChange(e.target.value, updateNodeNumber);}} value = {node.number ? node.number : ""} />
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
                        <Dropdown  
                            className = "dropdown"
                            panelStyle={{borderRadius: '2vh', color: 'rgba(204, 223, 255, 0.9)', backgroundColor: 'red'}}
                            //style = {{border: '3px solid rgba(204, 223, 255, 0.9)'}}
                            onFocus={(event) => {}}
                            //className='input'
                            disabled = {node.nodeId ? false : true}
                            filter
                            onChange = {(e) => {CheckValueChange(props.nodeId, node.nodeId, e.target.value.id); handleChange(e.target.value.id, updateNodeParent);}} 
                            value = {nodeList.current.find((object) => object.id === node.nodeId)}
                            options = {nodeList.current}
                            optionLabel='title'
                            />
                    </div>
                </div> 
                <div hidden = {changeCount.current === 0 && titleRequired} style = {{height: (changeCount.current === 0 && titleRequired)? '0vh':'auto', display: 'flex'}}>
                    <div hidden = {changeCount.current === 0}  id = 'node-details-button-container' style = {{display: 'flex', marginTop: '8vh'}}>
                        <button hidden = {changeCount.current === 0} className='button' style = {{marginRight: '2px'}} onClick = {() => {HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {changeCount.current === 0} className='button' onClick = {() => {titlePresent.current = true; changeCount.current = 0; handleChange(props, cloneNode); }} > Reset </button>
                    </div>
                    <div hidden = {(titleRequired)} style = {{marginLeft: '2vw', width: '100%', color: 'red', marginTop: '8vh', textAlign: 'bottom'}}>Title is required. Highlighted in red above.</div>
                </div>
            </div> );
}

export default NodeDetails 