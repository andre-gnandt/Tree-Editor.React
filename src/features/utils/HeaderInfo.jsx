import '../trees/tree.css';
import '../nodes/DetailsList.css';

const HeaderInfo = ({creator = true, middleText = null}) => {
    
    
    return (
        <div id = 'header-container' className='header-container'>
            { (creator) && 
                ( 
                <div className='header-creator'>
                    Creator: Andre Gnandt
                </div>
                )
            }

            { (middleText) && 
                (
                    <div className='center-text header-middle-text'>
                        {middleText}
                    
                    </div>
                )
            }
        </div>
    );
}
export default HeaderInfo 