import '../trees/tree.css';

const HeaderInfo = ({middleText = null}) => {
    
    
    return (
        <div className='header-container'>
            <div className='header-creator'>
                Creator: Andre Gnandt
            </div>

            { (middleText) && 
                (
                    <div className='header-middle-text'>
                        {middleText}
                    
                    </div>
                )
            }
        </div>
    );
}
export default HeaderInfo 