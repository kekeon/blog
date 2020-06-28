### Redux 源码阅读记录

#### 目录介绍

- source_code 源码注释翻译
- record_md 源码阅读笔记
- [Redux 中文文档](https://www.redux.org.cn/)

#### 基本概念

- Store：全局 state 管理对象， 主要是用来消费

- Action：触发的动作事件

- Reducer：动作触发修改 state 方法

> 三者之间的关系及简单理解，不对的大家多多指教， 首先创建全局Store 管理 state, 通过 dispatch 提交 action 触发 reducer 函数修改 store 中的 state

#### TODO MVC examples 读源码

> createStore， 创建store， 关注入参和出参

```js
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './components/App'
import reducer from './reducers'
import 'todomvc-app-css/index.css'

/**
 * 1. Provider context 全局消费者 store
 * 2. 关注 createStore 的入参，和参数
 * 
 */
const store = createStore(reducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

```
> createStore 入参, 在 /reducers/index.js 中 rootReducer

```js

import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const rootReducer = combineReducers({
  todos,
  visibilityFilter
})

// createStore 入参， 经过 combineReducers 函数处理
export default rootReducer

```

> combineReducers 入参和出参



