import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, setStateProperty, updateNodeData, updateNodeNumber, updateNodeDescription, updateNodeTitle, updateNodeRank, updateNodeParent} from './nodeSlice'
import { InputText} from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';
import { Dialog } from 'primereact/dialog';
import './detailsList.css';
import UploadFile from '../utils/UploadFile';
import { Provider } from 'react-redux';
import { store } from '/LocalTreeData.React/src/store';
import { unmountComponentAtNode } from 'react-dom';

const NodeDetails = (input) => {
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const titlePresent = useRef(true);
    const[titleRequired, setTitleRequired] = useState(titlePresent.current);
    const[resetFiles, setResetFiles] = useState({reset: false});
    const [deleteOptions, setDeleteOptions] = useState("");
    const deleteType = useRef("cascade"); //single | cascade
    const nodeList = useRef([]);

    const SetChangeTracker = 'setChangeTracker' in input.setChangeTracker ? input.setChangeTracker : null;
    const [create, setCreate] = useState('create' in input ? input['create'] : false);
    const [root, setRoot] = useState('root' in input ? input['root'] : false);
    const node = useSelector(state => state.node);
    const dispatch = useDispatch();
    const firstRender = useRef(true);
    const unMount = input.unMount;
    const props = input.input;
    //const rootNode = input.rootNode;
    const renderTreeNode = input.renderTreeNode;

    const SetStateFiles = (value) => {
        firstRender.current = false;
        dispatch(setStateProperty({key: 'files', value: value}));
      }

    if(firstRender.current){
        firstRender.current = false;
        dispatch(cloneNode(props));
        SetStateFiles(input.files);
        nodeList.current = [...input.nodeList];
        RemoveDescendants(props);
        nodeList.current = nodeList.current.sort(CompareNodes);
    }

    const handleChange = (value, method) => {
        dispatch(method(value));
    }

    const FileChangeCallBack = (showButtons) => 
    {
        if(showButtons)
        {
            changeCount.current++;
        }
        else 
        {
            changeCount.current = 0;
        }

        setHideButtons(changeCount.current);
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

    async function DeleteSingle(id){
        await fetch("http://localhost:11727/api/Nodes/Delete-One"+id, {method: 'DELETE'})
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
    };

    async function DeleteCascade(id){
        await fetch("http://localhost:11727/api/Nodes/Delete-Cascade"+id, {method: 'DELETE'})
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
    };

    async function createNode(node){
        const postOptions =  {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        postOptions.body = JSON.stringify(node);
        return await fetch("http://localhost:11727/api/Nodes/", postOptions)
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});;
    };

    async function createRoot(node){
        const postOptions =  {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        postOptions.body = JSON.stringify(node);
        return await fetch("http://localhost:11727/api/Nodes/Root", postOptions)
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
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

    const GetConfirmDelete = () => 
    {
        return (
        <>
                <Dialog  style = {{height: '30vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral'}}  visible = {(deleteOptions === "confirm")} onHide = {() => {setDeleteOptions("")}}>
                    <>
                        <div style = {{marginLeft: '2.5vw', width: '35vw', height: '25vh'}}>
                            <div style = {{width: '35vw', height: '5vh', textAlign: 'center' }}>Please confirm that you would like to delete this node (including all of its files)</div>
                            <div style = {{marginTop: '1vh', display: 'flex', width: '35vw', height: '18vh'}}>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button 
                                        onClick={() => { HandleDeleteNode();}} 
                                        className='button' style = {{height: '8vh', width: '17vh'}}
                                    >
                                           Yes
                                    </button>
                                </div>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button
                                         onClick={() => {setDeleteOptions(""); }}
                                         className='button' style = {{height: '8vh', width: '17vh'}}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                </Dialog>
            </>
        );
    }

    const GetDeleteOptions = () =>
    {
        return (
            <>
                <Dialog  style = {{height: '30vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral'}}  visible = {(deleteOptions === "options")} onHide = {() => {setDeleteOptions("")}}>
                    <>
                        <div style = {{marginLeft: '2.5vw', width: '35vw', height: '25vh'}}>
                            <div style = {{width: '35vw', height: '5vh', textAlign: 'center' }}>What type of Deletion would you like to make?</div>
                            <div style = {{marginTop: '1vh', display: 'flex', width: '35vw', height: '18vh'}}>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button onClick={() => {deleteType.current = "cascade"; setDeleteOptions("confirm");}} className='button' style = {{height: '8vh', width: '17vh'}}>Delete Cascade</button>
                                    <div >
                                        (Delete this node and all descendants )
                                    </div>
                                </div>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button
                                         onClick={() => {deleteType.current = "single"; setDeleteOptions("confirm"); }}
                                         className='button' style = {{height: '8vh', width: '17vh'}}>Delete Single</button>
                                    <div >
                                        (Delete only this Node)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                </Dialog>
            </>
        );
    }

    function RenderCreateOrSaveButton()
    {
        if(create || root)
        {
            return (
                <>Create</>
            );
        }
        
        return (
            <>Save</>
        );
    }

    async function HandleDeleteNode()
    {   
        if(deleteType.current === "single")
        {
            await DeleteSingle(props.id);
            input.render("delete single", null, node.id, null, node.nodeId);
        }
        else
        {
            await DeleteCascade(props.id);
            input.render("delete cascade", null, node.id, null, node.nodeId);
        }
        unMount();
    }

    async function HandleSaveOrCreate()
    {
        if(!node.title || node.title.trim().length === 0)
        {
            titlePresent.current = false;
            setTitleRequired(false);
        }
        else if(!create && !root)
        {
            await updateNode(node.id, node); 
            
            if(node.nodeId != props.nodeId)
            {
                const oldParentId = props.nodeId;
                setNode(props);
                input.render("update", null, node.id, node.nodeId, oldParentId);
            }
            else{
                //setStateProperty();
                setNode(props);
                renderTreeNode();
                SetChangeTracker(props);
            }
        }
        else if(create)
        {            
            var resultNode = await createNode(node);
            setNode(props);
            props['id'] = resultNode.id;
            input.nodeList.push(props);
            input.render("create", props);

            dispatch(setStateProperty({key: 'id', value: resultNode.id}));
        }  
        else if(root)
        {
            var resultNode = await createRoot(node);
            setNode(props);
            props['id'] = resultNode.id;
            input.nodeList.push(props);
            nodeList.current = [];
            input.render("new root", props);

            dispatch(setStateProperty({key: 'id', value: resultNode.id}));
        }  
    }

    const GetHeader = () => {
        if(create)return <>Create New Node</>;
        if(root)return <>Create New Root</>;
        
        return <>Node Content</>;
    }

    //style = {{marginBottom: (hideButtons === 0) ? '0vh' : '3.275vh'}}
        return(
        <>    
            <div className='container'>
                <div style = {{ height: '6.5vh',  fontSize: '4vw', display: 'flex'}}>
                    <header style = {{width: '33vw', float: 'top'}}>{GetHeader()}</header>                   
                    
                    { (node.nodeId && !root && !create) && (
                        <>
                            <div style = {{height: '6.5vh', width: '7vw',  float: 'right' }}>
                                <button className='button' 
                                    style = {{backgroundColor: 'red', height: '4.5vh', maxHeight: '6.5vh', float: 'right', fontSize: '3vh', justifyContent: 'center'}} 
                                    onClick={() => {setDeleteOptions("options")}}                       
                                >Delete</button>                   
                            </div>
                            { (deleteOptions === "options") && 
                                (
                                  <>
                                    {GetDeleteOptions()}
                                  </>
                                )
                            }
                            { (deleteOptions === "confirm") && 
                                (
                                  <>
                                    {GetConfirmDelete()}
                                  </>
                                )
                            }
                        </>
                        )
                    }
                </div>
                <div style = {{display: 'flex', height: '44vh', marginBottom: '5.275vh'}}>
                    <div className="thumbnail-container">
                        <Provider store = {store}>
                            <UploadFile reset = {resetFiles} fileChangeCallBack = {FileChangeCallBack} files = {input.files} node = {input.input} thumbnailUpload = {(props.thumbnailId)} create = {create} />
                        </Provider>  
                    </div>
                    <div className='title-container'>
                        <InputTextarea 
                            autoResize 
                            rows = {1} 
                            placeholder="Title" 
                            className= {(titleRequired) ? "title" : "title-required"}
                            spellCheck = {false}
                            onChange = {(e) => {CheckValueChange(props.title, node.title, e.target.value); handleChange(e.target.value, updateNodeTitle);}} value = {node.title ? node.title.trim() : ""} />
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
                        <button hidden = {changeCount.current === 0} className='button' style = {{marginRight: '2px'}} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {changeCount.current === 0} className='button' onClick = {() => {titlePresent.current = true; changeCount.current = 0; setResetFiles({reset: true}); handleChange(props, cloneNode); }} > Reset </button>
                    </div>
                    <div hidden = {(titleRequired)} style = {{marginLeft: '2vw', width: '100%', color: 'red', marginTop: '8vh', textAlign: 'bottom'}}>Title is required. Highlighted in red above.</div>
                </div>
            </div> 
        </>    
        );
}

export default NodeDetails 