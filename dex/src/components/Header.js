import React from 'react'
import Logo from "../moralis-logo.svg";
import Eth from "../eth.svg";
import { Link } from "react-router-dom";

function Header(props) {

  const {address, isConnected, connect} = props;

  return (
    <header>
      <div className='leftH'>
       
        <Link to="/">
        <div className='link'>Swap</div>
        </Link>
        <Link to="/tokens">
        <div className='link'>Token</div>
        </Link>

      </div>

      <div className='rightH'>
        <div className='headerItem'>
          <img src={Eth} alt="Ethereum Logo" className='eth' />
          Ethereum
        </div>
        <div className='connectButton' onClick={connect}>
          {isConnected ? (address.slice(0,4) +"..." +address.slice(38)) : "Connect"}
        </div>

      </div>

    </header>
  )
}

export default Header