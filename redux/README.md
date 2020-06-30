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
 * 2. 关注 createStore 的入参，和参数
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

- 入参 reducer 函数

```js
// 1. assertReducerShape 判断 reducer 函数是否有效

```

- 出参

```ts

/**
 * 1. 返回 combination 函数，
 *    函数的入参是， state: 当前的state, action: 提交的: action
 *    出参返回的是state, 先不关注这个函数具体是处理什么
 *  2. combination 作为 createStore 的入参
 */

  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction
  ) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false

    // 下一次的状态， finalReducerKeys： 记录有效的 reducers 的 key， finalReducers： key 对应的方法
    const nextState: StateFromReducersMapObject<typeof reducers> = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      // dispatch
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }

```

- 接下来继续看 createStore

```ts

// 在代码实现中实现了重载
export default function createStore<S, A extends Action, Ext = {}, StateExt = never>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S> | StoreEnhancer<Ext, StateExt>, enhancer?: StoreEnhancer<Ext, StateExt>): Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext {}

// reducer: 就是 combination 函数

// preloadedState: 初始化 state 参数

// enhancer: 是一个 store 增强函数

// enhancer 调用
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(
      reducer,
      preloadedState as PreloadedState<S>
    ) as Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext
  }

  // enhancer 使用方式

   function enhancer(createStore) {
    return (reducer,preloadedState) => {
         //逻辑代码
    }
 }

```

- createStore 入参和出参

```js

// 入参 educer: 就是 combination 函数 ，preloadedState: 初始化 state 参数 enhancer: 是一个 store 增强函数

// 出参 store Object

const store = {
     dispatch: dispatch as Dispatch<A>,
     subscribe,
     getState,
     replaceReducer,
    [$$observable]: observable
}

return store;

```