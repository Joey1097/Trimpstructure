/**
 * @Input: React, ReactDOM, Root 组件, CSS
 * @Output: 应用挂载点
 * @Pos: 应用入口，渲染 Root 到 DOM
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './Root.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)