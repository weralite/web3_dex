import React from 'react'
import Logo from "../moralis-logo.svg";
import Eth from "../eth.svg";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <div className='leftH'>
        <img src={Logo} alt="Moralis Logo" className='logo' />
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
        <div className='connectButton'>
          Connect
        </div>

      </div>

    </header>
  )
}

export default Header