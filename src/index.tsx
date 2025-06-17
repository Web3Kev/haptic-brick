import { createRoot } from 'react-dom/client'

import { StrictMode } from 'react'
import Game from './app'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>,
)
