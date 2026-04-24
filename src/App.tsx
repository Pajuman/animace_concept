import AniImageOverlay from './AniImageOverlay'

import body from './assets/body1.png'
import ani1 from './assets/ani11.png'
import ani2 from './assets/ani12.png'
import ani3 from './assets/ani21.png'
import ani4 from './assets/ani22.png'
import ani5 from './assets/ani13.png'


import './App.css'

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <img src={body} alt="" style={{ marginTop: '40rem' }} />

      <AniImageOverlay
        coord_x={32}
        coord_y={543}
        dragable={false}
        images={[
          { image: ani1, duration: 5000 },
          { image: ani2, duration: 700 },
        ]}
      />
      <AniImageOverlay
        coord_x={32}
        coord_y={543}
        coord_z={5}
        dragable={false}
        images={[
          { image: ani2, duration: 1000 },
          { image: ani5, duration: 1000 },
        ]}
      />
      <AniImageOverlay
        coord_x={200}
        coord_y={543}
        
        dragable={true}
        images={[
          { image: ani3, duration: 800 },
          { image: ani4, duration: 800 },
        ]}
      />
    </div>
  )
}

export default App