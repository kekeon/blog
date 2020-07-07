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

#### 从 counter examples 读源码

> 这里主要了解一下 store 的创建， 以及 store 的消费 和 state 更新
> createStore， 创建store， 关注入参和出参

```js

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
import counter from './reducers'

// 入参是 reducer 在 reducers/index.js， 方便看先贴出来

/* 入参 counter start */

export default (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
/*  入参 counter end */

const store = createStore(counter)

/* store Object 出参 start */

const store = {
     dispatch: dispatch as Dispatch<A>,
     subscribe,
     getState,
     replaceReducer,
    [$$observable]: observable
}

return store;
/* 出参 end */

const rootEl = document.getElementById('root')


// 在这里边使用了， 返回store 中的 getState 、 dispatch 、 subscribe 三个方法，下面将揭示三者之间的关系

const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)

render()

store.subscribe(render)

```

> 在这里用到的发布/订阅模式来实现, 不了解的自行查询哦

1. 先看一下 [createStore](https://github.com/kekeon/blog/tree/master/redux/source_code/src/createStore.ts) 中的 89 行， 先不要关注其他的

2. currentReducer 就是传进来的 counter

3. currentState 就是 store.getState() 的返回值，例子中没有默认值就是 undefined

4. store.subscribe(render) ，这里订阅了 render 这个组件方法, 返回值：unsubscribe 取消订阅

5. 在 subscribe 中 nextListeners.push(listener) 会把 render push 到 nextListeners中

6. dispatch 的实现

```js
// 删减版代码

  function dispatch(action: A) {

    try {
      isDispatching = true
      // 结合 Counter 示例 currentReducer 就是 counter 函数， 根据 action.type, 修改 state

      // currentReducer 返回的 state 会更新到 currentState
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 监听队列， 中存放一个 render 方法
    const listeners = (currentListeners = nextListeners)
  
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      // 在此调用 render 方法渲染, 渲染中会 调用 getState 获取 currentState
      listener()
    }

    return action
  }
```

> 总结： 通过上面的大概了解 redux 的设计，中 使用发布/订阅模式来实现，深入了解往下看

#### TODO MVC examples  深入了解 React-Redux

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
 */

const store = createStore(reducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

```

> 接下来我们能看下 react-redux 中 Provider 组件的实现

```js

// 下面我们一样来看下入参

import React, { useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context'
import Subscription from '../utils/Subscription'

// 我们看见内部大多用 hooks 实现
function Provider({ store, context, children }) {

  // memo store
  const contextValue = useMemo(() => {

  // 深挖 Subscription 的实现；
  // Subscription  constructor(store, parentSub) {}
  // 这里只是用了一个参数
    const subscription = new Subscription(store)
    // 默认 notifyNestedSubs 是 notify 空函数
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription
    }
  }, [store])

 // memo state
  const previousState = useMemo(() => store.getState(), [store])


  useEffect(() => {
    const { subscription } = contextValue

    // 重点， 生成订阅队列
    subscription.trySubscribe()

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}


// store: 构建 (createStore)必穿， context、children，不必传
if (process.env.NODE_ENV !== 'production') {
  Provider.propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
    context: PropTypes.object,
    children: PropTypes.any
  }
}

export default Provider
```

###### 1. 深挖 [Subscription](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/utils/Subscription.js) 的实现

```js

export default class Subscription {
  // 两个参数 store, parentSub
  constructor(store, parentSub) {
    this.store = store
    this.parentSub = parentSub
    this.unsubscribe = null
    this.listeners = nullListeners

    this.handleChangeWrapper = this.handleChangeWrapper.bind(this)
  }

 //
  addNestedSub(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
  }

  notifyNestedSubs() {
    this.listeners.notify()
  }

  handleChangeWrapper() {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.handleChangeWrapper)
        : this.store.subscribe(this.handleChangeWrapper)

      this.listeners = createListenerCollection()
    }
  }

  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}

```

###### 2. 看一下 App 中的 Header 组件

```js

// src/containers/Header

import { connect } from 'react-redux'
import Header from '../components/Header'
import { addTodo } from '../actions'

// 通过 connect 包装过的组件
export default connect(null, { addTodo })(Header)

// react-redux/src/connect/connect
```

###### 3. 探索 [connect](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/connect/connect.js)