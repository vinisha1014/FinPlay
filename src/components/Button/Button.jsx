import React from 'react'
import "./style.css"

function Button({ text, onClick, blue, type = "button" ,disabled}) {  // Added default type as "button"
    return (
        <button
            className={blue ? "btn btn-blue" : "btn"} onClick={onClick}
            disabled={disabled}
           
            type={type}  
        >
            {text}
        </button>
    )
}

export default Button
