import React from 'react'

function Home() {
  return (
    <div>
     

      <button onClick={()=>(window.location.href='/register')}>Register</button><br></br>
       <button onClick={()=>(window.location.href='/login')}>Login</button><br></br>
      
    </div>
  )
}

export default Home
