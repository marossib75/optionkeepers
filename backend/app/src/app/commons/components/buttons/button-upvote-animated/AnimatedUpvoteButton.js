import React from "react"

import "./AnimatedUpvoteButton.css";

const AnimatedButton = ({iconFill, iconOutline, iconSize = '40px', isUpvoted, isDisabled, upvote, downvote}) => {
    
    const onClickVote = () => {
        if(isUpvoted){
            downvote()
        }
        else {
            upvote()
        }
    }
    const IconFill = iconFill
    const IconOutline = iconOutline

    const iconStyle = {height: iconSize, width: iconSize}

    return (
        <div>
            <button onClick={onClickVote} 
                    disabled={isDisabled} 
                    className={` counter-button ${isUpvoted ? "clicked" : "idle"}`}
                    style={{opacity: isDisabled && '0.3', marginBottom: isDisabled && '-200px', cursor: isDisabled && 'default'}}
            >
                <div className="icons" style={iconStyle}>
                    <div className="icons-sm" style={iconStyle}>
                        <IconFill height={6} width={6} className="fill-1"/>
                        <IconFill height={10} width={10} className="fill-2"/>
                        <IconOutline height={6} width={6} className="outline-1"/>
                        <IconOutline height={10} width={10} className="outline-2"/>
                    </div>
                    <IconOutline className="circular-btn outline" style={iconStyle}/>
                    <IconFill className="circular-btn fill" style={iconStyle}/>
                </div>
            </button>
        </div>
    );
}

export default AnimatedButton;