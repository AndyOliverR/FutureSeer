import Link from "next/link"
import { TopNavBar } from "./TopNavBar"

export function Header() {
  return (
    <header style={{ 
      margin: 0, 
      padding: 0, 
      width: '100vw', 
      minWidth: '100vw',
      maxWidth: '100vw',
      position: 'relative', 
      marginLeft: 'calc(-50vw + 50%)', 
      marginRight: 'calc(-50vw + 50%)',
      boxSizing: 'border-box',
      overflow: 'visible',
      overflowX: 'visible'
    }}>
      <TopNavBar />
    </header>
  )
} 