import React, { useState, useRef } from 'react'
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import '../nodes/DetailsList.css';
import '../trees/tree.css';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import { deleteTree, updateTree, createTree } from '../../api/trees/treesApi';

const TreeDetails = ({reRenderList = null, unMount = null, id = null, inputTree, creation  = false}) => {
    const navigate = useNavigate();
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const [titleRequired, setTitleRequired] = useState(true);
    const [deleteOptions, setDeleteOptions] = useState("");
    const [create, setCreate] = useState(creation);
    const [name, setName] = useState(inputTree.name);
    const [description, setDescription] = useState(inputTree.description);

    function CheckValueChange(originalValue, previousValue, newValue)
    {
        if(originalValue != null && String(originalValue).length === 0) originalValue = null;
        if(previousValue != null && String(previousValue).length === 0) previousValue = null;
        if(newValue != null && String(newValue).length === 0) newValue = null;

        const previousChangeCount = changeCount.current;
        if(previousValue == originalValue && newValue != originalValue)
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
            <>  <Draggable>
                    <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}}  visible = {(deleteOptions === "confirm")} onHide = {() => {setDeleteOptions("")}}>
                        <>  
                        <i onClick={() => {setDeleteOptions("")}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                            <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                                <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>Please confirm that you would like to delete this Tree.</div>
                                <div style = {{position: 'relative', top: '10vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button className='text-overflow button' onClick={() => {HandleDeleteTree();}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Yes</button>
                                    </div>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button 
                                             onClick={() => {setDeleteOptions(""); }}
                                             className='button text-overflow' style = {{height: '12vh',  width: '15.5vw', fontSize: '4vh'}}>No</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    </Dialog>
                </Draggable>
            </>
            );
        }

    function SetInputTree(tree)
    {
        inputTree['id'] = tree.id;
        inputTree['description'] = tree.description;
        inputTree['rootId'] = tree.rootId;
        inputTree['name'] = tree.name;
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

    async function HandleDeleteTree()
    {   
        await deleteTree(id);
        unMount();
        navigate("/");
    }

    async function HandleSaveOrCreate()
    {
        if(!name || name.trim().length === 0)
        {
            setTitleRequired(false);
        }
        else if(create)
        {

            const newTree = await createTree({name: name, description: description});
            SetInputTree(newTree);
            reRenderList("create", newTree);
            setCreate(false);
            navigate("tree/"+newTree.id);
        }
        else
        {   
            inputTree.name = name;
            inputTree.description = description; 
            await updateTree(id, inputTree);
            //reRenderList("update");
        }   

        if(name && name.trim().length > 0)
        {
            changeCount.current = 0;
            setHideButtons(changeCount.current);
        }
    }

    const ResetForm = () => 
    {
        changeCount.current = 0; 
        setHideButtons(0);
        setName(inputTree.name); 
        setDescription(inputTree.description);

    }

    const GetHeader = () => {
        if(create)return <>New Tree</>;
        
        return <>Tree</>;
    }
    
        return(
        <>  
            <div className='dialog-root'>
                <div id = 'fixed-header' className='fixed-header'>
                    <div className='dialog-header-inner'>
                        <div className='dialog-close-container'>
                            <i onClick={() => {unMount()}} className='pi pi-times dialog-close-button'/>
                        </div>
                        <div className='dialog-header center-text text-overflow'>{GetHeader()}</div>                   
                        <div className={!create ? 'dialog-delete' : 'dialog-delete-skeleton'}>
                        { (!create) && (
                            <> 
                                <button className='text-overflow dialog-delete-button button' 
                                    onClick={() => {setDeleteOptions("confirm")}}                       
                                >
                                Delete</button>                   
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
                    </div> 
                </div>
                <div className={'container-2'}> 
                    <div className='tree-title-outer'>
                        <div className='tree-title-container center-text'>
                            <InputTextarea 
                                maxLength={100}
                                autoResize 
                                rows = {1} 
                                placeholder="Title..." 
                                className= {(titleRequired) ? "tree-title center-text" : "tree-title-required center-text"}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(inputTree.name, name, e.target.value); setName(e.target.value);}} value = {name ? name : ""} />
                        </div>
                    </div>
                        <div className = 'tree-description-container center-text'>
                            <InputTextarea 
                                maxLength={1000}
                                placeholder='Description...'   
                                autoResize  
                                rows={6} 
                                className = 'tree-description center-text' 
                                onChange = {(e) => {CheckValueChange(inputTree.description, description, e.target.value); setDescription(e.target.value);}} value = {description ? description : ""} />
                        </div>
                  
                </div> 
                {
                <div className = 'dialog-save-banner' style = {{backgroundColor: (hideButtons === 0 && titleRequired) ? '#F0F0F0' : '#DCDCDC'}}>
                    <div className = 'dialog-save-container' hidden = {hideButtons === 0}  id = 'node-details-button-container'>
                        <button className = 'dialog-save-button dialog-save-button-left button text-overflow' hidden = {hideButtons === 0} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button className = 'dialog-save-button button text-overflow' hidden = {hideButtons === 0} onClick = {() => { ResetForm(); }} > Reset </button>
                    </div>                      {/*font size 1.3rem for a big screen, 12px for small screen */}
                    <div className='title-required-container'  hidden = {(titleRequired)}>Title is required!</div>
                </div>
                }
            </div>

        </>    
        );
}

export default TreeDetails 